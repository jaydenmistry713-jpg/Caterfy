import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoicesManager from './invoices-manager'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('caterer_id', user.id)
    .order('created_at', { ascending: false })

  const { data: caterer } = await supabase.from('caterers').select('business_name').eq('id', user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">View and create invoices for your customers</p>
      </div>
      <InvoicesManager caterererId={user.id} businessName={caterer?.business_name || ''} initialInvoices={invoices || []} />
    </div>
  )
}
