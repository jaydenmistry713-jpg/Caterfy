import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendOrderAccepted, sendOrderDeclined } from '@/lib/resend/emails'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!['accepted', 'declined', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const service = await createServiceClient()

    const { data: order, error } = await service
      .from('orders')
      .update({
        status,
        ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', id)
      .eq('caterer_id', user.id)
      .select('id, reference_number, customer_email, customer_name, items, caterers(business_name)')
      .single()

    if (error || !order) {
      return NextResponse.json({ error: error?.message || 'Order not found' }, { status: 400 })
    }

    const businessName = (order as any).caterers?.business_name || ''

    try {
      if (status === 'accepted') {
        await sendOrderAccepted(order.customer_email, {
          id: order.id,
          reference_number: order.reference_number,
          business_name: businessName,
          items: (order as any).items,
        })
      } else if (status === 'declined') {
        await sendOrderDeclined(order.customer_email, {
          reference_number: order.reference_number,
          business_name: businessName,
        })
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
