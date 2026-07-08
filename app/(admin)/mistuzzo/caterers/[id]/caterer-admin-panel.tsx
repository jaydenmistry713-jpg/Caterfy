'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/utils/use-toast'
import { Loader2, Ban, RotateCcw, CheckCircle, CalendarPlus } from 'lucide-react'

export default function CatererAdminPanel({ caterer }: { caterer: any }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [form, setForm] = useState({
    business_name: caterer.business_name || '',
    email: caterer.email || '',
    phone: caterer.phone || '',
    slug: caterer.slug || '',
  })

  async function call(payload: any, busyKey: string) {
    setBusy(busyKey)
    try {
      const res = await fetch(`/api/admin/caterers/${caterer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      toast({ title: 'Done', variant: 'success' })
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setBusy(null)
    }
  }

  const status = caterer.subscription_status

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lifecycle actions */}
      <Card>
        <CardHeader><CardTitle>Account actions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Suspending takes the public site offline (visitors see the &ldquo;taking a break&rdquo; page). All actions are reversible.
          </p>
          <div className="flex flex-wrap gap-2">
            {status !== 'cancelled' ? (
              <Button variant="outline" onClick={() => call({ action: 'suspend' }, 'suspend')} disabled={!!busy}
                className="text-red-600 border-red-200 hover:bg-red-50">
                {busy === 'suspend' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Ban className="h-4 w-4 mr-1" />}
                Suspend site
              </Button>
            ) : (
              <Button variant="outline" onClick={() => call({ action: 'reactivate_trial' }, 'reactivate')} disabled={!!busy}>
                {busy === 'reactivate' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                Reactivate (14-day trial)
              </Button>
            )}
            {status !== 'active' && (
              <Button variant="outline" onClick={() => call({ action: 'activate' }, 'activate')} disabled={!!busy}>
                {busy === 'activate' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Mark active
              </Button>
            )}
            <Button variant="outline" onClick={() => call({ action: 'extend_trial', days: 14, setTrialling: true }, 'extend')} disabled={!!busy}>
              {busy === 'extend' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CalendarPlus className="h-4 w-4 mr-1" />}
              Extend trial +14d
            </Button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Accepting orders</p>
              <p className="text-xs text-gray-500">Pause incoming orders without taking the site down</p>
            </div>
            <button
              onClick={() => call({ action: 'toggle_orders', value: !caterer.is_accepting_orders }, 'orders')}
              disabled={!!busy}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${caterer.is_accepting_orders ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${caterer.is_accepting_orders ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Edit details */}
      <Card>
        <CardHeader><CardTitle>Edit details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Business name</Label>
            <Input className="mt-1" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>URL slug</Label>
            <div className="flex items-center mt-1">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">caterfy.com/</span>
              <Input className="rounded-l-none" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} />
            </div>
          </div>
          <Button onClick={() => call({ fields: form }, 'save')} disabled={!!busy}>
            {busy === 'save' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
