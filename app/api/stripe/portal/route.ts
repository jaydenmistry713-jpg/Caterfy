import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: caterer } = await supabase.from('caterers').select('stripe_customer_id').eq('id', user.id).single()
    if (!caterer?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/settings', request.url))
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: caterer.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.redirect(session.url)
  } catch (err: any) {
    return NextResponse.redirect(new URL('/settings', request.url))
  }
}
