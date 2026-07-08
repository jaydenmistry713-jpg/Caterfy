import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoicesManager from './invoices-manager'

interface Props {
  searchParams: Promise<{ from_order?: string }>
}

export default async function InvoicesPage({ searchParams }: Props) {
  const { from_order } = await searchParams
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [invoicesRes, catererRes, ordersRes] = await Promise.all([
    supabase.from('invoices').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }),
    supabase.from('caterers').select('business_name, bank_transfer_details, show_bank_details_on_invoice').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('id, reference_number, customer_name, customer_email, total, items, status, event_date')
      .eq('caterer_id', user.id)
      .in('status', ['accepted', 'completed'])
      .order('created_at', { ascending: false }),
  ])

  const invoices = invoicesRes.data
  const caterer = catererRes.data
  let orders = ordersRes.data || []

  // Deep-link from an order's "Create invoice" button. The order may not be in
  // the accepted/completed list above (e.g. a still-pending bank-transfer
  // order), so fetch it explicitly and make sure it's selectable.
  if (from_order && !orders.some((o) => o.id === from_order)) {
    const { data: linked } = await supabase
      .from('orders')
      .select('id, reference_number, customer_name, customer_email, total, items, status, event_date')
      .eq('caterer_id', user.id)
      .eq('id', from_order)
      .maybeSingle()
    if (linked) orders = [linked, ...orders]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">View and create invoices for your customers</p>
      </div>
      <InvoicesManager
        caterererId={user.id}
        businessName={caterer?.business_name || ''}
        initialInvoices={invoices || []}
        orders={orders || []}
        bankTransferDetails={caterer?.bank_transfer_details || null}
        showBankDetailsOnInvoice={caterer?.show_bank_details_on_invoice ?? true}
        autoOpenOrderId={from_order || null}
      />
    </div>
  )
}
