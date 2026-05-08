import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvailabilityManager from './availability-manager'

export default async function AvailabilityPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [catererRes, blockedRes] = await Promise.all([
    supabase.from('caterers').select('is_accepting_orders, max_orders_per_week, auto_accept_orders').eq('id', user.id).single(),
    supabase.from('blocked_dates').select('*').eq('caterer_id', user.id).order('date', { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-gray-500 mt-1">Manage your order availability and block dates</p>
      </div>
      <AvailabilityManager
        caterererId={user.id}
        caterer={catererRes.data}
        blockedDates={blockedRes.data || []}
      />
    </div>
  )
}
