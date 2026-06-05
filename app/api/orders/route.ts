import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewOrderNotification, sendOrderConfirmationToCustomer } from '@/lib/resend/emails'
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
      .select('email, business_name, auto_accept_orders, is_accepting_orders, stripe_connect_id, slug')
      .eq('id', validated.caterer_id)
      .single()

    if (!caterer?.is_accepting_orders) {
      return NextResponse.json({ error: 'This caterer is not currently accepting orders' }, { status: 400 })
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
        }),
      ])
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    // Create Stripe Checkout Session for card payments
    let checkout_url: string | null = null
    if (
      validated.payment_method === 'card' &&
      caterer.stripe_connect_id &&
      validated.total &&
      validated.total > 0
    ) {
      const session = await stripe.checkout.sessions.create({
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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-status?ref=${validated.reference_number}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${caterer.slug}`,
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
      checkout_url = session.url
    }

    return NextResponse.json({ order, checkout_url })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
