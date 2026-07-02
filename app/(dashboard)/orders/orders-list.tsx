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
import { Check, X, ChevronDown, ChevronUp, FileText, Plus, Trash2, Loader2 } from 'lucide-react'

interface Props {
  orders: Order[]
  caterererId: string
}

export default function OrdersList({ orders: initialOrders, caterererId }: Props) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [quotingOrder, setQuotingOrder] = useState<Order | null>(null)
  const [quoteLines, setQuoteLines] = useState([{ description: '', amount: '' }])
  const [quoteNotes, setQuoteNotes] = useState('')
  const [sendingQuote, setSendingQuote] = useState(false)
  // Top-level split between one-off item orders and catering quote requests
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'quote'>('all')

  const quoteTotal = quoteLines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)

  // Quote status for an order (from the joined quotes row), if any
  const quoteStatusOf = (order: any): string | null => order?.quotes?.[0]?.status ?? null

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
      // Reflect "quote sent" on the order immediately (badge + button change)
      setOrders((prev) => prev.map((o) => o.id === quotingOrder.id
        ? { ...o, quotes: [{ status: 'sent', total: quoteTotal }] }
        : o))
      setQuotingOrder(null)
      setQuoteLines([{ description: '', amount: '' }])
      setQuoteNotes('')
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSendingQuote(false)
    }
  }

  const visible = orders.filter((o) => typeFilter === 'all' ? true : (o.order_type || 'fixed') === typeFilter)
  const pending = visible.filter((o) => o.status === 'pending')
  const active = visible.filter((o) => ['accepted', 'awaiting_payment'].includes(o.status))
  const completed = visible.filter((o) => ['completed', 'declined', 'cancelled'].includes(o.status))

  async function deleteOrder(orderId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').delete().eq('id', orderId).eq('caterer_id', caterererId)
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return }
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    setExpanded(null)
    toast({ title: 'Order deleted' })
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setProcessingId(orderId + status)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: status as any } : o))
      toast({ title: 'Order updated', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
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
                  <Badge variant="info">Catering quote</Badge>
                )}
                {quoteStatusOf(order) === 'sent' && (
                  <Badge variant="warning">Quote sent · awaiting confirmation</Badge>
                )}
                {quoteStatusOf(order) === 'accepted' && (
                  <Badge variant="success">Quote accepted</Badge>
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
                    <FileText className="h-3 w-3 mr-1" />{quoteStatusOf(order) === 'sent' ? 'Update quote' : 'Send Quote'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'accepted') }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingId === order.id + 'accepted'}
                  >
                    {processingId === order.id + 'accepted'
                      ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      : <Check className="h-3 w-3 mr-1" />}
                    Accept
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'declined') }}
                  disabled={processingId === order.id + 'declined'}
                >
                  {processingId === order.id + 'declined'
                    ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    : <X className="h-3 w-3 mr-1" />}
                  Decline
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
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              {order.status === 'accepted' && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={processingId === order.id + 'completed'}
                >
                  {processingId === order.id + 'completed'
                    ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    : null}
                  Mark as Completed
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteOrder(order.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
    {/* Split one-off item orders from catering quote requests */}
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 mb-4">
      {([['all', 'All'], ['fixed', 'Item orders'], ['quote', 'Catering quotes']] as const).map(([val, label]) => (
        <button
          key={val}
          onClick={() => setTypeFilter(val)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            typeFilter === val ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
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
            {/* The customer's request — so you can quote against what they actually asked for */}
            {quotingOrder && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm">
                <p className="font-medium text-gray-700 mb-1">Their request</p>
                <div className="text-gray-600 space-y-0.5">
                  <p>Date: {formatDate(quotingOrder.event_date)}{quotingOrder.event_time ? ` at ${quotingOrder.event_time}` : ''}</p>
                  {quotingOrder.event_location && <p>Location: {quotingOrder.event_location}</p>}
                  {quotingOrder.guest_count && <p>Guests: {quotingOrder.guest_count}</p>}
                  {quotingOrder.event_type && <p>Event: {quotingOrder.event_type}</p>}
                  {quotingOrder.special_requests && <p className="mt-1"><span className="text-gray-500">Requirements:</span> {quotingOrder.special_requests}</p>}
                  {quotingOrder.dietary_requirements && <p><span className="text-gray-500">Dietary:</span> {quotingOrder.dietary_requirements}</p>}
                </div>
              </div>
            )}
            <div>
              <Label>Items</Label>
              <p className="text-xs text-gray-400 mb-1">Tip: you don't have to itemise — you can enter a single line (e.g. "Catering package") with one price if you'd rather not break down your costs.</p>
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
                <Plus className="h-3.5 w-3.5 mr-1" />Add item
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
    </>
  )
}
