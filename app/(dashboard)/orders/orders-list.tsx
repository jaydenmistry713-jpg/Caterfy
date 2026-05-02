'use client'

import { useState } from 'react'
import { Order } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { Check, X, ChevronDown, ChevronUp, FileText, Plus, Trash2 } from 'lucide-react'

interface Props {
  orders: Order[]
  caterererId: string
}

export default function OrdersList({ orders: initialOrders, caterererId }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quotingOrder, setQuotingOrder] = useState<Order | null>(null)
  const [quoteLines, setQuoteLines] = useState([{ description: '', amount: '' }])
  const [quoteNotes, setQuoteNotes] = useState('')
  const [sendingQuote, setSendingQuote] = useState(false)

  const quoteTotal = quoteLines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)

  async function sendQuote() {
    if (!quotingOrder) return
    setSendingQuote(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: quotingOrder.id,
          caterer_id: caterererId,
          line_items: quoteLines.filter((l) => l.description && l.amount).map((l) => ({ description: l.description, amount: parseFloat(l.amount) })),
          total: quoteTotal,
          notes: quoteNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Quote sent to customer!', variant: 'success' })
      setQuotingOrder(null)
      setQuoteLines([{ description: '', amount: '' }])
      setQuoteNotes('')
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSendingQuote(false)
    }
  }

  const pending = orders.filter((o) => o.status === 'pending')
  const active = orders.filter((o) => ['accepted', 'awaiting_payment'].includes(o.status))
  const completed = orders.filter((o) => ['completed', 'declined', 'cancelled'].includes(o.status))

  async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status, ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}) })
      .eq('id', orderId)
      .eq('caterer_id', caterererId)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }

    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: status as any } : o))
    toast({ title: 'Order updated', variant: 'success' })
  }

  function OrderCard({ order }: { order: Order }) {
    const isExpanded = expanded === order.id

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setExpanded(isExpanded ? null : order.id)}
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{order.customer_name}</p>
                <Badge
                  variant={
                    order.status === 'accepted' ? 'success' :
                    order.status === 'pending' ? 'warning' :
                    order.status === 'declined' || order.status === 'cancelled' ? 'destructive' :
                    'default'
                  }
                >
                  {order.status}
                </Badge>
                {order.order_type === 'quote' && (
                  <Badge variant="info">Quote</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {order.reference_number} · Event: {formatDate(order.event_date)}
                {order.total ? ` · £${Number(order.total).toFixed(2)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.status === 'pending' && (
              <>
                {order.order_type === 'quote' ? (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setQuotingOrder(order) }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="h-3 w-3 mr-1" />Send Quote
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'accepted') }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />Accept
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'declined') }}
                >
                  <X className="h-3 w-3 mr-1" />Decline
                </Button>
              </>
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-2">Customer Details</p>
                <p className="text-gray-600">Email: {order.customer_email}</p>
                <p className="text-gray-600">Phone: {order.customer_phone}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-2">Event Details</p>
                <p className="text-gray-600">Date: {formatDate(order.event_date)}</p>
                {order.event_time && <p className="text-gray-600">Time: {order.event_time}</p>}
                {order.event_location && <p className="text-gray-600">Location: {order.event_location}</p>}
                {order.event_type && <p className="text-gray-600">Type: {order.event_type}</p>}
                {order.guest_count && <p className="text-gray-600">Guests: {order.guest_count}</p>}
              </div>
              {order.special_requests && (
                <div className="sm:col-span-2">
                  <p className="font-medium text-gray-700 mb-1">Special Requests</p>
                  <p className="text-gray-600">{order.special_requests}</p>
                </div>
              )}
              {order.dietary_requirements && (
                <div className="sm:col-span-2">
                  <p className="font-medium text-gray-700 mb-1">Dietary Requirements</p>
                  <p className="text-gray-600">{order.dietary_requirements}</p>
                </div>
              )}
              {order.items && Array.isArray(order.items) && (
                <div className="sm:col-span-2">
                  <p className="font-medium text-gray-700 mb-2">Items Ordered</p>
                  <div className="space-y-1">
                    {(order.items as any[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-gray-600">
                        <span>{item.name} × {item.quantity}</span>
                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.total && (
                      <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                        <span>Total</span>
                        <span>£{Number(order.total).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {order.status === 'accepted' && order.payment_method === 'offline' && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark as Paid & Completed
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
        <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
      </TabsList>

      {(['pending', 'active', 'completed'] as const).map((tab) => {
        const items = tab === 'pending' ? pending : tab === 'active' ? active : completed
        return (
          <TabsContent key={tab} value={tab}>
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No {tab} orders</div>
            ) : (
              <div className="space-y-3">
                {items.map((order) => <OrderCard key={order.id} order={order} />)}
              </div>
            )}
          </TabsContent>
        )
      })}

      {/* Quote builder dialog */}
      <Dialog open={!!quotingOrder} onOpenChange={(open) => !open && setQuotingOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Quote to {quotingOrder?.customer_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Line items</Label>
              <div className="space-y-2 mt-1">
                {quoteLines.map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => {
                        const updated = [...quoteLines]
                        updated[i] = { ...updated[i], description: e.target.value }
                        setQuoteLines(updated)
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="£0.00"
                      className="w-24"
                      value={line.amount}
                      onChange={(e) => {
                        const updated = [...quoteLines]
                        updated[i] = { ...updated[i], amount: e.target.value }
                        setQuoteLines(updated)
                      }}
                    />
                    {quoteLines.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => setQuoteLines((prev) => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setQuoteLines((prev) => [...prev, { description: '', amount: '' }])} className="mt-2">
                <Plus className="h-3.5 w-3.5 mr-1" />Add line
              </Button>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                className="mt-1"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="Any additional notes for the customer..."
                rows={2}
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-xl">£{quoteTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setQuotingOrder(null)}>Cancel</Button>
              <Button
                onClick={sendQuote}
                disabled={sendingQuote || quoteTotal === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingQuote ? 'Sending...' : 'Send Quote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
