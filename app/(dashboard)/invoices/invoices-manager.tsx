'use client'

import { useState } from 'react'
import { Invoice } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { formatDate } from '@/lib/utils'
import { Plus, Send, CheckCircle, Trash2 } from 'lucide-react'

interface Props {
  caterererId: string
  businessName: string
  initialInvoices: Invoice[]
}

export default function InvoicesManager({ caterererId, businessName, initialInvoices }: Props) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    due_date: '',
    lineItems: [{ description: '', amount: '' }],
  })

  function addLineItem() {
    setForm({ ...form, lineItems: [...form.lineItems, { description: '', amount: '' }] })
  }

  function removeLineItem(i: number) {
    setForm({ ...form, lineItems: form.lineItems.filter((_, idx) => idx !== i) })
  }

  function updateLineItem(i: number, field: 'description' | 'amount', value: string) {
    const updated = [...form.lineItems]
    updated[i] = { ...updated[i], [field]: value }
    setForm({ ...form, lineItems: updated })
  }

  const total = form.lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  async function createInvoice() {
    if (!form.customer_name || !form.customer_email) return
    setSaving(true)
    const supabase = createClient()

    const count = invoices.length + 1
    const invoice_number = `INV-${String(count).padStart(5, '0')}`

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        caterer_id: caterererId,
        invoice_number,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        line_items: form.lineItems.filter((i) => i.description && i.amount),
        total,
        due_date: form.due_date || null,
        status: 'unpaid',
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setInvoices((prev) => [data, ...prev])
      setShowCreate(false)
      setForm({ customer_name: '', customer_email: '', due_date: '', lineItems: [{ description: '', amount: '' }] })
      toast({ title: 'Invoice created', variant: 'success' })
    }
    setSaving(false)
  }

  async function markPaid(id: string) {
    const supabase = createClient()
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: 'paid' as const } : inv))
    toast({ title: 'Invoice marked as paid', variant: 'success' })
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No invoices yet. Create your first invoice above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{inv.invoice_number}</p>
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{inv.customer_name} · £{Number(inv.total).toFixed(2)}</p>
                    {inv.due_date && <p className="text-xs text-gray-400">Due: {formatDate(inv.due_date)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status === 'unpaid' && (
                      <Button size="sm" variant="outline" onClick={() => markPaid(inv.id)}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer name *</Label>
                <Input className="mt-1" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <Label>Customer email *</Label>
                <Input className="mt-1" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Due date</Label>
              <Input className="mt-1" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>

            <div>
              <Label>Line items</Label>
              <div className="space-y-2 mt-1">
                {form.lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="£0.00"
                      className="w-24"
                      value={item.amount}
                      onChange={(e) => updateLineItem(i, 'amount', e.target.value)}
                    />
                    {form.lineItems.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => removeLineItem(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={addLineItem} className="mt-2">
                <Plus className="h-3.5 w-3.5 mr-1" />Add line
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <p className="font-semibold text-gray-900">Total</p>
              <p className="font-bold text-xl">£{total.toFixed(2)}</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={createInvoice} disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
