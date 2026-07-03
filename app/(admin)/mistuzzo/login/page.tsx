'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      router.replace('/mistuzzo')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-theme min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[color:var(--surface)] rounded-2xl border border-[color:var(--border-light)] shadow-sm p-8">
          <div className="w-12 h-12 rounded-full bg-[color:var(--basil)] flex items-center justify-center mx-auto mb-4">
            <Lock className="h-5 w-5 text-[color:var(--cream)]" />
          </div>
          <h1 className="text-2xl text-center text-[color:var(--basil)] mb-1">Caterfy Admin</h1>
          <p className="text-sm text-[color:var(--ink-soft)] text-center mb-6">Enter the admin password to continue.</p>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-2.5 border border-[color:var(--border-light)] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[color:var(--basil)]"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[color:var(--basil)] text-[color:var(--cream)] py-2.5 rounded-lg font-medium text-sm hover:bg-[color:var(--basil-2)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
