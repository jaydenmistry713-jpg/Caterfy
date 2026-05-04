'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { Plus, Trash2, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface DiscountCode {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_value: number | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

interface Props {
  caterererId: string
  initialCodes: DiscountCode[]
}

export default function DiscountCodesManager({ caterererId, initialCodes }: Props) {
  const [codes, setCodes] = useState(initialCodes)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    min_order_value: '',
    max_uses: '',
    expires_at: '',
  })

  function resetForm() {
    setForm({ code: '', discount_type: 'percent', discount_value: '', min_order_value: '', max_uses: '', expires_at: '' })
  }

  async function createCode() {
    if (!form.code || !form.discount_value) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        caterer_id: caterererId,
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setCodes((prev) => [data, ...prev])
      setShowCreate(false)
      resetForm()
      toast({ title: 'Discount code created', variant: 'success' })
    }
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('discount_codes').update({ is_active: !current }).eq('id', id)
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c))
  }

  async function deleteCode(id: string) {
    const supabase = createClient()
    await supabase.from('discount_codes').delete().eq('id', id)
    setCodes((prev) => prev.filter((c) => c.id !== id))
    toast({ title: 'Code deleted' })
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />Create Code
        </Button>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Tag className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No discount codes yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => (
            <Card key={code.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono font-bold text-gray-900">{code.code}</p>
                      <Badge variant={code.is_active ? 'success' : 'default'}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="info">
                        {code.discount_type === 'percent'
                          ? `${code.discount_value}% off`
                          : `£${Number(code.discount_value).toFixed(2)} off`}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {code.uses_count} use{code.uses_count !== 1 ? 's' : ''}
                      {code.max_uses !== null ? ` / ${code.max_uses} max` : ''}
                      {code.min_order_value !== null ? ` · Min order £${Number(code.min_order_value).toFixed(2)}` : ''}
                      {code.expires_at ? ` · Expires ${formatDate(code.expires_at)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(code.id, code.is_active)}>
                      {code.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCode(code.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Discount Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code *</Label>
              <Input
                className="mt-1 uppercase"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v) => setForm({ ...form, discount_type: v as 'percent' | 'fixed' })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value *</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min="0.01"
                  max={form.discount_type === 'percent' ? '100' : undefined}
                  placeholder={form.discount_type === 'percent' ? '20' : '10.00'}
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min order (£)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={form.min_order_value}
                  onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                />
              </div>
              <div>
                <Label>Max uses</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Expires on</Label>
              <Input
                className="mt-1"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowCreate(false); resetForm() }}>Cancel</Button>
              <Button
                onClick={createCode}
                disabled={saving || !form.code || !form.discount_value}
              >
                {saving ? 'Creating...' : 'Create Code'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
