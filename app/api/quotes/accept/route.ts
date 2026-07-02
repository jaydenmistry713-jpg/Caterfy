import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  reference_number: z.string().min(1),
})

// Customer-facing: accept a quote from the order-status page.
// The reference number acts as the access token (same model as order tracking).
export async function POST(request: NextRequest) {
  try {
    const { reference_number } = schema.parse(await request.json())
    const supabase = await createServiceClient()

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_type')
      .eq('reference_number', reference_number)
      .single()

    if (!order || order.order_type !== 'quote') {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const { data: quote } = await supabase
      .from('quotes')
      .select('id, status')
      .eq('order_id', order.id)
      .single()

    if (!quote || quote.status !== 'sent') {
      return NextResponse.json({ error: 'No quote is awaiting your acceptance.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    await supabase.from('quotes').update({ status: 'accepted', accepted_at: now }).eq('id', quote.id)
    // Accepting a quote gives the caterer the go-ahead to contact the customer and arrange payment.
    await supabase.from('orders').update({ status: 'accepted', accepted_at: now }).eq('id', order.id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
