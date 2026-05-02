'use client'

import { useState } from 'react'
import { BlockedDate } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { formatDate } from '@/lib/utils'
import { Trash2, Calendar, Plus } from 'lucide-react'

interface Props {
  caterererId: string
  caterer: any
  blockedDates: BlockedDate[]
}

export default function AvailabilityManager({ caterererId, caterer: initialCaterer, blockedDates: initialDates }: Props) {
  const [caterer, setCaterer] = useState(initialCaterer)
  const [blockedDates, setBlockedDates] = useState(initialDates)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function toggleAcceptingOrders() {
    const supabase = createClient()
    const newVal = !caterer?.is_accepting_orders
    await supabase.from('caterers').update({ is_accepting_orders: newVal }).eq('id', caterererId)
    setCaterer({ ...caterer, is_accepting_orders: newVal })
    toast({ title: newVal ? 'Now accepting orders' : 'Orders paused', variant: 'success' })
  }

  async function saveCapacity() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('caterers').update({
      max_orders_per_week: caterer?.max_orders_per_week || null,
      auto_accept_orders: caterer?.auto_accept_orders || false,
    }).eq('id', caterererId)
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' })
    else toast({ title: 'Settings saved', variant: 'success' })
    setSaving(false)
  }

  async function addBlockedDate() {
    if (!newDate) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert({ caterer_id: caterererId, date: newDate, reason: newReason || null })
      .select()
      .single()
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return }
    setBlockedDates((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    setNewDate('')
    setNewReason('')
    toast({ title: 'Date blocked', variant: 'success' })
  }

  async function removeBlockedDate(id: string) {
    const supabase = createClient()
    await supabase.from('blocked_dates').delete().eq('id', id)
    setBlockedDates((prev) => prev.filter((d) => d.id !== id))
    toast({ title: 'Date unblocked' })
  }

  return (
    <div className="space-y-6">
      {/* Order toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Order Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Accepting orders</p>
              <p className="text-sm text-gray-500">Toggle this to temporarily pause all orders</p>
            </div>
            <button
              onClick={toggleAcceptingOrders}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                caterer?.is_accepting_orders ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                caterer?.is_accepting_orders ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Capacity settings */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity & Auto-Accept</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Max orders per week</Label>
            <p className="text-xs text-gray-500 mb-1">Leave blank for unlimited</p>
            <Input
              type="number"
              min="1"
              max="100"
              className="w-32 mt-1"
              value={caterer?.max_orders_per_week || ''}
              onChange={(e) => setCaterer({ ...caterer, max_orders_per_week: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Auto-accept orders</p>
              <p className="text-sm text-gray-500">Automatically accept fixed-price orders without manual review</p>
            </div>
            <button
              onClick={() => setCaterer({ ...caterer, auto_accept_orders: !caterer?.auto_accept_orders })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                caterer?.auto_accept_orders ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                caterer?.auto_accept_orders ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <Button onClick={saveCapacity} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Blocked dates */}
      <Card>
        <CardHeader>
          <CardTitle>Block Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-auto"
            />
            <Input
              placeholder="Reason (optional)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
            <Button onClick={addBlockedDate}>
              <Plus className="h-4 w-4 mr-1" />Block
            </Button>
          </div>

          {blockedDates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(bd.date)}</p>
                      {bd.reason && <p className="text-xs text-gray-500">{bd.reason}</p>}
                    </div>
                  </div>
                  <button onClick={() => removeBlockedDate(bd.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
