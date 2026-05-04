import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendInvoiceEmail } from '@/lib/resend/emails'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const service = await createServiceClient()

    const { data: invoice, error } = await service
      .from('invoices')
      .select('*, caterers(business_name)')
      .eq('id', id)
      .eq('caterer_id', user.id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await sendInvoiceEmail(invoice.customer_email, {
      invoice_number: invoice.invoice_number,
      business_name: (invoice as any).caterers?.business_name || '',
      customer_name: invoice.customer_name,
      line_items: invoice.line_items as { description: string; amount: number }[],
      total: invoice.total,
      due_date: invoice.due_date || undefined,
    })

    await service
      .from('invoices')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
