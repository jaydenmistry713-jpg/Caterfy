'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Bell } from 'lucide-react'

interface Props {
  caterer: any
}

export default function DashboardTopbar({ caterer }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="lg:hidden font-bold text-lg text-gray-900">Caterfy</div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {caterer && (
          <span className="hidden sm:block text-sm text-gray-500">{caterer.email}</span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
