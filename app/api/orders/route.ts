import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewOrderNotification, sendOrderConfirmationToCustomer, sendFirstOrderCelebration } from '@/lib/resend/emails'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const orderSchema = z.object({
  caterer_id: z.string().uuid(),
  reference_number: z.string(),
  order_type: z.enum(['fixed', 'quote']),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  event_date: z.string(),
  event_time: z.string().optional().nullable(),
  event_location: z.string().optional().nullable(),
  event_type: z.string().optional().nullable(),
  guest_count: z.number().int().positive().optional().nullable(),
  items: z.array(z.any()).optional().nullable(),
  subtotal: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  special_requests: z.string().optional().nullable(),
  dietary_requirements: z.string().optional().nullable(),
  additional_comments: z.string().optional().nullable(),
  payment_method: z.enum(['card', 'offline', 'bank_transfer']).optional(),
  discount_code: z.string().optional().nullable(),
  discount_amount: z.number().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = orderSchema.parse(body)

    const supabase = await createServiceClient()

    // Get caterer details
    const { data: caterer } = await supabase
      .from('caterers')
      .select('email, business_name, auto_accept_orders, is_accepting_orders, stripe_connect_id, slug, max_orders_per_week')
      .eq('id', validated.caterer_id)
      .single()

    if (!caterer?.is_accepting_orders) {
      return NextResponse.json({ error: 'This caterer is not currently accepting orders' }, { status: 400 })
    }

    // A card order isn't real until the customer pays. When we'll hand off to
    // Stripe's inline checkout, defer all side effects (confirmation emails,
    // stock, discount usage, first-order celebration) to payment confirmation
    // (see lib/orders/finalize.ts) so abandoning checkout doesn't email anyone
    // or consume stock.
    const isCardPending =
      validated.payment_method === 'card' &&
      !!caterer.stripe_connect_id &&
      !!validated.total &&
      validated.total > 0

    // Reject dates the caterer has blocked as unavailable
    if (validated.event_date) {
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('caterer_id', validated.caterer_id)
        .eq('date', validated.event_date)
        .maybeSingle()
      if (blocked) {
        return NextResponse.json({ error: 'The caterer is unavailable on this date. Please choose another date.' }, { status: 400 })
      }
    }

    // Enforce max orders per week (based on the event date's Mon–Sun week)
    if (caterer.max_orders_per_week && validated.event_date) {
      const eventDate = new Date(validated.event_date + 'T00:00:00')
      const day = eventDate.getUTCDay() // 0 = Sun
      const mondayOffset = day === 0 ? -6 : 1 - day
      const weekStart = new Date(eventDate)
      weekStart.setUTCDate(eventDate.getUTCDate() + mondayOffset)
      const weekEnd = new Date(weekStart)
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
      const toISODate = (d: Date) => d.toISOString().split('T')[0]

      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('caterer_id', validated.caterer_id)
        .gte('event_date', toISODate(weekStart))
        .lte('event_date', toISODate(weekEnd))
        .not('status', 'in', '(declined,cancelled)')
      if ((count ?? 0) >= caterer.max_orders_per_week) {
        return NextResponse.json({ error: 'The caterer is fully booked for that week. Please choose another date.' }, { status: 400 })
      }
    }

    const status = caterer.auto_accept_orders && validated.order_type === 'fixed' ? 'accepted' : 'pending'

    const nullIfEmpty = (v: string | null | undefined) => (v === '' ? null : v ?? null)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ...validated,
        event_time: nullIfEmpty(validated.event_time),
        event_location: nullIfEmpty(validated.event_location),
        event_type: nullIfEmpty(validated.event_type),
        special_requests: nullIfEmpty(validated.special_requests),
        dietary_requirements: nullIfEmpty(validated.dietary_requirements),
        additional_comments: nullIfEmpty(validated.additional_comments),
        status,
        payment_status: ['offline', 'bank_transfer'].includes(validated.payment_method ?? '') ? 'awaiting_payment' : 'unpaid',
        ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Decrement stock for fixed orders (menu items with a stock_limit set).
    // Skipped for card-pending orders — happens on payment confirmation instead.
    if (!isCardPending && validated.order_type === 'fixed' && Array.isArray(validated.items)) {
      for (const it of validated.items as any[]) {
        if (!it?.item_id || !it?.quantity) continue
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('stock_limit')
          .eq('id', it.item_id)
          .eq('caterer_id', validated.caterer_id)
          .maybeSingle()
        if (menuItem && menuItem.stock_limit != null) {
          const newStock = Math.max(0, menuItem.stock_limit - Number(it.quantity))
          await supabase.from('menu_items').update({ stock_limit: newStock }).eq('id', it.item_id)
        }
      }
    }

    // Increment usage count for an applied discount code.
    // Skipped for card-pending orders — happens on payment confirmation instead.
    if (!isCardPending && validated.discount_code) {
      const { data: dc } = await supabase
        .from('discount_codes')
        .select('id, uses_count')
        .eq('caterer_id', validated.caterer_id)
        .ilike('code', validated.discount_code)
        .maybeSingle()
      if (dc) {
        await supabase.from('discount_codes').update({ uses_count: (dc.uses_count ?? 0) + 1 }).eq('id', dc.id)
      }
    }

    // First-order celebration + confirmation emails. Skipped for card-pending
    // orders — these run on payment confirmation (finalizeCardOrder) instead, so
    // starting and abandoning the inline checkout never notifies anyone.
    if (!isCardPending) {
      // First-order celebration — the most shareable moment in the lifecycle
      try {
        const { count: orderCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('caterer_id', validated.caterer_id)
        if (orderCount === 1) {
          await sendFirstOrderCelebration(caterer.email, caterer.business_name, validated.reference_number)
        }
      } catch (celebErr) {
        console.error('First-order email failed:', celebErr)
      }

      // Send emails
      try {
        await Promise.all([
          sendNewOrderNotification(caterer.email, caterer.business_name, {
            reference_number: validated.reference_number,
            customer_name: validated.customer_name,
            event_date: validated.event_date,
            total: validated.total || undefined,
            order_type: validated.order_type,
          }),
          sendOrderConfirmationToCustomer(validated.customer_email, {
            reference_number: validated.reference_number,
            business_name: caterer.business_name,
            event_date: validated.event_date,
            total: validated.total || undefined,
            order_type: validated.order_type,
            payment_method: validated.payment_method,
            items: validated.items as any,
          }),
        ])
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    // Create an *embedded* Stripe Checkout Session for card payments so the
    // customer pays inline on the order page (no redirect to Stripe's hosted
    // page). On completion Stripe redirects the top window to return_url, and
    // /order-status reconciles the payment (see reconcileCardPayment) — the
    // same no-webhook path the hosted flow used.
    let client_secret: string | null = null
    if (isCardPending) {
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Order from ${caterer.business_name}`,
              description: `Reference: ${validated.reference_number}`,
            },
            unit_amount: Math.round(Number(validated.total) * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-status?ref=${validated.reference_number}&session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          order_id: order.id,
          reference_number: validated.reference_number,
        },
        payment_intent_data: {
          transfer_data: {
            destination: caterer.stripe_connect_id,
          },
        },
      })
      client_secret = session.client_secret
    }

    return NextResponse.json({ order, client_secret })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
