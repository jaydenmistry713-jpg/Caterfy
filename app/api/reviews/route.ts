import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewReviewNotification } from '@/lib/resend/emails'
import { z } from 'zod'

const reviewSchema = z.object({
  order_id: z.string().uuid(),
  caterer_id: z.string().uuid(),
  customer_name: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().max(1000).nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = reviewSchema.parse(body)
    const supabase = await createServiceClient()

    // Verify order exists and belongs to caterer
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', validated.order_id)
      .eq('caterer_id', validated.caterer_id)
      .single()

    if (!order || !['accepted', 'completed'].includes(order.status)) {
      return NextResponse.json({ error: 'Order not eligible for review' }, { status: 400 })
    }

    // Check no duplicate review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', validated.order_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Review already submitted for this order' }, { status: 400 })
    }

    // Only publish the customer's first name — a full name is too personal on a public page.
    const firstName = validated.customer_name.trim().split(/\s+/)[0] || validated.customer_name.trim()

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({ ...validated, customer_name: firstName })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Notify caterer
    try {
      const { data: caterer } = await supabase
        .from('caterers')
        .select('email, business_name')
        .eq('id', validated.caterer_id)
        .single()
      if (caterer) {
        await sendNewReviewNotification(caterer.email, caterer.business_name, validated.rating)
      }
    } catch {}

    return NextResponse.json({ review })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
