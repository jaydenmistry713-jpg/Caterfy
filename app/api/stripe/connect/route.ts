import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { caterererId } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== caterererId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { data: caterer } = await supabase.from('caterers').select('email, stripe_connect_id').eq('id', caterererId).single()

    let accountId = caterer?.stripe_connect_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: caterer?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id
      await supabase.from('caterers').update({ stripe_connect_id: accountId }).eq('id', caterererId)
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments?connected=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
