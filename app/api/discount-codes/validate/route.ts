import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  caterer_id: z.string().uuid(),
  order_total: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, caterer_id, order_total } = schema.parse(body)

    const supabase = await createServiceClient()

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('caterer_id', caterer_id)
      .ilike('code', code)
      .eq('is_active', true)
      .single()

    if (error || !discount) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 })
    }

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 })
    }

    if (discount.max_uses !== null && discount.uses_count >= discount.max_uses) {
      return NextResponse.json({ error: 'This discount code has reached its usage limit' }, { status: 400 })
    }

    if (discount.min_order_value !== null && order_total < discount.min_order_value) {
      return NextResponse.json({
        error: `Minimum order value of £${Number(discount.min_order_value).toFixed(2)} required`,
      }, { status: 400 })
    }

    const discountAmount = discount.discount_type === 'percent'
      ? Math.min(order_total, (order_total * discount.discount_value) / 100)
      : Math.min(order_total, discount.discount_value)

    return NextResponse.json({
      valid: true,
      discount_id: discount.id,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      discount_amount: Number(discountAmount.toFixed(2)),
    })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
