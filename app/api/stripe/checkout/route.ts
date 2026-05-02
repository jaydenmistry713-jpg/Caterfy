import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Called when caterer wants to start/resume subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: caterer } = await supabase
      .from('caterers')
      .select('email, business_name, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!caterer) return NextResponse.json({ error: 'Caterer not found' }, { status: 404 })

    let customerId = caterer.stripe_customer_id

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: caterer.email,
        name: caterer.business_name,
        metadata: { caterer_id: user.id },
      })
      customerId = customer.id
      await supabase.from('caterers').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // Get price from settings or hardcode
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'subscription_price_uk')
      .single()

    const priceAmount = (settings?.value as any)?.amount || 1000
    const currency = (settings?.value as any)?.currency || 'gbp'

    // Create Stripe price on the fly (or use a saved price ID)
    // In production, create prices in Stripe dashboard and save IDs to settings
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: 'Caterfy Monthly Subscription',
            description: 'Professional catering website + marketplace listing',
          },
          unit_amount: priceAmount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      metadata: { caterer_id: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
