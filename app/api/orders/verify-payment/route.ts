import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { sendOrderAccepted } from '@/lib/resend/emails'

// Verifies a Stripe Checkout session on the success redirect (no webhook required).
// Called by the /order-status page when it receives a session_id query param.
// Marks the order paid and auto-accepts it (a paid card order needs no manual accept),
// then emails the customer their acceptance + review link — once.
export async function POST(request: NextRequest) {
  try {
    const { session_id, reference_number } = await request.json()
    if (!session_id || !reference_number) {
      return NextResponse.json({ error: 'Missing session_id or reference_number' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: order } = await supabase
      .from('orders')
      .select('id, payment_status, status, customer_email, reference_number, items, caterers(business_name)')
      .eq('reference_number', reference_number)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Already reconciled — nothing to do (avoids duplicate emails on refresh)
    if (order.payment_status === 'paid') {
      return NextResponse.json({ payment_status: 'paid', status: order.status })
    }

    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ payment_status: order.payment_status, status: order.status })
    }

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
      })
      .eq('id', order.id)

    try {
      const businessName = (order as any).caterers?.business_name || ''
      await sendOrderAccepted(order.customer_email, {
        id: order.id,
        reference_number: order.reference_number,
        business_name: businessName,
        items: (order as any).items,
      })
    } catch (emailErr) {
      console.error('Acceptance email failed:', emailErr)
    }

    return NextResponse.json({ payment_status: 'paid', status: 'accepted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
