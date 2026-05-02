import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const quoteSchema = z.object({
  order_id: z.string().uuid(),
  caterer_id: z.string().uuid(),
  line_items: z.array(z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
  })),
  total: z.number().positive(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const validated = quoteSchema.parse(body)

    if (validated.caterer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const serviceSupabase = await createServiceClient()

    // Create or update quote
    const { data: existing } = await serviceSupabase
      .from('quotes')
      .select('id')
      .eq('order_id', validated.order_id)
      .single()

    let quote
    if (existing) {
      const { data, error } = await serviceSupabase
        .from('quotes')
        .update({ ...validated, status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      quote = data
    } else {
      const { data, error } = await serviceSupabase
        .from('quotes')
        .insert({ ...validated, status: 'sent', sent_at: new Date().toISOString() })
        .select()
        .single()
      if (error) throw error
      quote = data
    }

    // Get order/customer for email
    const { data: order } = await serviceSupabase
      .from('orders')
      .select('customer_name, customer_email, reference_number')
      .eq('id', validated.order_id)
      .single()

    // Send quote email to customer
    if (order) {
      try {
        const { resend, ORDERS_EMAIL } = await import('@/lib/resend')
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL
        const { data: caterer } = await serviceSupabase
          .from('caterers')
          .select('business_name')
          .eq('id', validated.caterer_id)
          .single()

        await resend.emails.send({
          from: ORDERS_EMAIL,
          to: order.customer_email,
          subject: `Quote from ${caterer?.business_name} — ${order.reference_number}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Your quote is ready</h2>
              <p>Hi ${order.customer_name}, <strong>${caterer?.business_name}</strong> has sent you a quote for order ${order.reference_number}.</p>
              <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
                ${validated.line_items.map(i => `<tr><td style="padding:6px; border-bottom:1px solid #eee;">${i.description}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right;">£${i.amount.toFixed(2)}</td></tr>`).join('')}
                <tr><td style="padding:8px; font-weight:bold;">Total</td><td style="padding:8px; font-weight:bold; text-align:right;">£${validated.total.toFixed(2)}</td></tr>
              </table>
              ${validated.notes ? `<p>${validated.notes}</p>` : ''}
              <div style="text-align:center; margin:30px 0;">
                <a href="${APP_URL}/order-status?ref=${order.reference_number}" style="background:#1a1a1a; color:white; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold;">View &amp; Accept Quote</a>
              </div>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Quote email failed:', emailErr)
      }
    }

    return NextResponse.json({ quote })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
