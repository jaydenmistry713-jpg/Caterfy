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
      .select('*, caterers(business_name, bank_transfer_details, show_bank_details_on_invoice)')
      .eq('id', id)
      .eq('caterer_id', user.id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const catererData = (invoice as any).caterers
    const bankDetails = catererData?.show_bank_details_on_invoice && catererData?.bank_transfer_details
      ? catererData.bank_transfer_details
      : undefined

    await sendInvoiceEmail(invoice.customer_email, {
      invoice_number: invoice.invoice_number,
      business_name: catererData?.business_name || '',
      customer_name: invoice.customer_name,
      line_items: invoice.line_items as { description: string; amount: number }[],
      total: invoice.total,
      due_date: invoice.due_date || undefined,
      bank_transfer_details: bankDetails,
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
