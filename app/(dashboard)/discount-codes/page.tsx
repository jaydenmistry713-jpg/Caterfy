import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiscountCodesManager from './discount-codes-manager'

export default async function DiscountCodesPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const { data: codes } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('caterer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
        <p className="text-gray-500 mt-1">Create codes your customers can apply at checkout</p>
      </div>
      <DiscountCodesManager caterererId={user.id} initialCodes={codes || []} />
    </div>
  )
}
