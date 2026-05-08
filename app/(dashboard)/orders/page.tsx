import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersList from './orders-list'

export default async function OrdersPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('caterer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage your orders and quote requests</p>
      </div>
      <OrdersList orders={orders || []} caterererId={user.id} />
    </div>
  )
}
