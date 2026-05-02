import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewOrderNotification, sendOrderConfirmationToCustomer } from '@/lib/resend/emails'
import { z } from 'zod'

const orderSchema = z.object({
  caterer_id: z.string().uuid(),
  reference_number: z.string(),
  order_type: z.enum(['fixed', 'quote']),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  event_date: z.string(),
  event_time: z.string().optional(),
  event_location: z.string().optional(),
  event_type: z.string().optional(),
  guest_count: z.number().int().positive().optional().nullable(),
  items: z.array(z.any()).optional().nullable(),
  subtotal: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  special_requests: z.string().optional(),
  dietary_requirements: z.string().optional(),
  additional_comments: z.string().optional(),
  payment_method: z.enum(['card', 'offline']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = orderSchema.parse(body)

    const supabase = await createServiceClient()

    // Get caterer details for email
    const { data: caterer } = await supabase
      .from('caterers')
      .select('email, business_name, auto_accept_orders, is_accepting_orders')
      .eq('id', validated.caterer_id)
      .single()

    if (!caterer?.is_accepting_orders) {
      return NextResponse.json({ error: 'This caterer is not currently accepting orders' }, { status: 400 })
    }

    const status = caterer.auto_accept_orders && validated.order_type === 'fixed' ? 'accepted' : 'pending'

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ...validated,
        status,
        payment_status: validated.payment_method === 'offline' ? 'awaiting_payment' : 'unpaid',
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

    return NextResponse.json({ order })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
