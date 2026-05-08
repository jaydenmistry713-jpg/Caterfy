import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuEditor from './menu-editor'

export default async function MenuPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [itemsRes, packagesRes] = await Promise.all([
    supabase.from('menu_items').select('*').eq('caterer_id', user.id).order('sort_order', { ascending: true }),
    supabase.from('packages').select('*').eq('caterer_id', user.id).order('sort_order', { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu & Services</h1>
        <p className="text-gray-500 mt-1">Add your menu items, categories, and packages</p>
      </div>
      <MenuEditor
        caterererId={user.id}
        initialItems={itemsRes.data || []}
        initialPackages={packagesRes.data || []}
      />
    </div>
  )
}
