'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function AdminLogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.replace('/mistuzzo/login')
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  )
}
