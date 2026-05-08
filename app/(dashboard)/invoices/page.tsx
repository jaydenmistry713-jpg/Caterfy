import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoicesManager from './invoices-manager'

export default async function InvoicesPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [invoicesRes, catererRes, ordersRes] = await Promise.all([
    supabase.from('invoices').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }),
    supabase.from('caterers').select('business_name').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('id, reference_number, customer_name, customer_email, total, items, status, event_date')
      .eq('caterer_id', user.id)
      .in('status', ['accepted', 'completed'])
      .order('created_at', { ascending: false }),
  ])

  const invoices = invoicesRes.data
  const caterer = catererRes.data
  const orders = ordersRes.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">View and create invoices for your customers</p>
      </div>
      <InvoicesManager caterererId={user.id} businessName={caterer?.business_name || ''} initialInvoices={invoices || []} orders={orders || []} />
    </div>
  )
}
