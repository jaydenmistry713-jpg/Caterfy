import { redirect } from 'next/navigation'
import { createClient, createServiceClient, getUser } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import DashboardSidebar from '@/components/dashboard/sidebar'
import DashboardTopbar from '@/components/dashboard/topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  let { data: caterer } = await supabase
    .from('caterers')
    .select('*, location:locations(*)')
    .eq('id', user.id)
    .single()

  // Fallback: create caterer record if auth callback didn't run
  if (!caterer) {
    const service = await createServiceClient()
    const businessName = user.user_metadata?.business_name || 'My Catering Business'
    let slug = user.user_metadata?.slug || slugify(businessName)
    let attempts = 0
    while (attempts < 10) {
      const { data: taken } = await service.from('caterers').select('id').eq('slug', slug).single()
      if (!taken) break
      slug = `${slugify(businessName)}-${attempts + 1}`
      attempts++
    }
    await service.from('caterers').insert({
      id: user.id,
      email: user.email!,
      business_name: businessName,
      slug,
      subscription_status: 'trialling',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      is_accepting_orders: false,
      auto_accept_orders: false,
      show_contact_publicly: true,
    })
    await service.from('caterer_pages').insert({ caterer_id: user.id, template: 'classic' })
    const { data: newCaterer } = await supabase
      .from('caterers')
      .select('*, location:locations(*)')
      .eq('id', user.id)
      .single()
    caterer = newCaterer
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar caterer={caterer} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar caterer={caterer} />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
