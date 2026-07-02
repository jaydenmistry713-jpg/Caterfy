import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPaymentFailed } from '@/lib/resend/emails'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { data: caterer } = await supabase.from('caterers').select('id').eq('stripe_customer_id', customerId).single()
      if (caterer) {
        // current_period_end moved onto subscription items in recent Stripe API
        // versions, so fall back to the item value (and cancel_at) to avoid a null.
        const periodEnd =
          (sub as any).current_period_end ??
          (sub as any).items?.data?.[0]?.current_period_end ??
          (sub as any).cancel_at ??
          null
        await supabase.from('caterers').update({
          subscription_status: sub.status === 'trialing' ? 'trialling' : sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'cancelled' : 'past_due',
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          subscription_ends_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        }).eq('id', caterer.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { data: caterer } = await supabase.from('caterers').select('id').eq('stripe_customer_id', customerId).single()
      if (caterer) {
        const endedAt =
          (sub as any).ended_at ??
          (sub as any).current_period_end ??
          (sub as any).items?.data?.[0]?.current_period_end ??
          Math.floor(Date.now() / 1000)
        await supabase.from('caterers').update({
          subscription_status: 'cancelled',
          subscription_ends_at: new Date(endedAt * 1000).toISOString(),
        }).eq('id', caterer.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: caterer } = await supabase.from('caterers').select('id, email, business_name').eq('stripe_customer_id', customerId).single()
      if (caterer) {
        await supabase.from('caterers').update({ subscription_status: 'past_due' }).eq('id', caterer.id)
        await sendPaymentFailed(caterer.email, caterer.business_name)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('caterers').update({ subscription_status: 'active' }).eq('stripe_customer_id', customerId)
      break
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      if (account.charges_enabled) {
        await supabase.from('caterers').update({ stripe_connect_id: account.id }).eq('stripe_connect_id', account.id)
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      if (orderId && session.payment_status === 'paid') {
        // A paid card order needs no manual accept — auto-accept it too.
        await supabase.from('orders').update({
          payment_status: 'paid',
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        }).eq('id', orderId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
