import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/sidebar'
import DashboardTopbar from '@/components/dashboard/topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: caterer } = await supabase
    .from('caterers')
    .select('*, location:locations(*)')
    .eq('id', user.id)
    .single()

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
