import { Metadata } from 'next'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { stripe } from '@/lib/stripe'
import { finalizeCardOrder } from '@/lib/orders/finalize'
import AcceptQuote from './accept-quote'
import Link from 'next/link'

// Reconcile a card payment on the success redirect (no webhook needed).
// Marks the order paid + auto-accepts it, then runs the deferred side effects
// (emails, stock, discount) exactly once — the compare-and-set update below
// guards against the webhook and this redirect both firing.
async function reconcileCardPayment(ref: string, sessionId: string) {
  try {
    const service = await createServiceClient()
    const { data: order } = await service
      .from('orders')
      .select('id, payment_status')
      .eq('reference_number', ref)
      .single()
    if (!order || order.payment_status === 'paid') return

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return

    const { data: updated } = await service
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
      .select('id')

    if (updated && updated.length > 0) {
      await finalizeCardOrder(service, order.id)
    }
  } catch (err) {
    console.error('Card payment reconcile failed:', err)
  }
}

export const metadata: Metadata = { title: 'Order Status — Caterfy' }

const STATUS_INFO: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  pending:           { label: 'Pending',           icon: Clock,         color: 'warning',     desc: 'Awaiting caterer response' },
  accepted:          { label: 'Accepted',           icon: CheckCircle,   color: 'success',     desc: 'Your order has been accepted' },
  declined:          { label: 'Declined',           icon: XCircle,       color: 'destructive', desc: 'The caterer is unable to fulfil this order' },
  cancelled:         { label: 'Cancelled',          icon: XCircle,       color: 'destructive', desc: 'This order has been cancelled' },
  completed:         { label: 'Completed',          icon: CheckCircle,   color: 'success',     desc: 'Event completed' },
  awaiting_payment:  { label: 'Awaiting Payment',   icon: Clock,         color: 'warning',     desc: 'Payment to be arranged with caterer' },
  paid:              { label: 'Paid',               icon: CheckCircle,   color: 'success',     desc: 'Payment received' },
}

interface Props {
  searchParams: Promise<{ ref?: string; email?: string; session_id?: string }>
}

export default async function OrderStatusPage({ searchParams }: Props) {
  const { ref, email, session_id } = await searchParams

  // If we came back from Stripe Checkout, reconcile the payment before rendering.
  if (ref && session_id) {
    await reconcileCardPayment(ref, session_id)
  }

  if (!ref) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track your order</h1>
          <p className="text-gray-500 mb-6">Enter your reference number and email to check your order status.</p>
          <OrderLookupForm />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, caterer:caterers(business_name, email, phone, show_contact_publicly, slug), quotes(line_items, total, notes, status)')
    .eq('reference_number', ref)
    .single()

  if (!order || (email && order.customer_email.toLowerCase() !== email.toLowerCase())) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[color:var(--ink)] mb-2">Order not found</h1>
          <p className="text-[color:var(--ink-soft)]">Check your reference number and email address.</p>
          <Link href="/order-status" className="text-[color:var(--basil)] underline mt-4 block">Try again</Link>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[order.status] || STATUS_INFO.pending
  const paymentInfo = STATUS_INFO[order.payment_status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <StatusIcon className={`h-6 w-6 ${order.status === 'accepted' || order.status === 'completed' ? 'text-green-500' : order.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`} />
              <h1 className="text-xl font-bold text-gray-900">{statusInfo.label}</h1>
            </div>
            <p className="text-gray-500 text-sm">{statusInfo.desc}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Reference</p>
                <p className="font-mono font-semibold text-gray-900">{order.reference_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Caterer</p>
                <p className="font-medium text-gray-900">{(order as any).caterer?.business_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Event date</p>
                <p className="font-medium text-gray-900">{formatDate(order.event_date)}</p>
              </div>
              {order.guest_count && (
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-medium text-gray-900">{order.guest_count}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Order type</p>
                <p className="font-medium text-gray-900 capitalize">{order.order_type}</p>
              </div>
              {order.total && (
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-medium text-gray-900">£{Number(order.total).toFixed(2)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Payment</p>
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                  {order.payment_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {order.items && Array.isArray(order.items) && (order.items as any[]).length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                {(order.items as any[]).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {(() => {
              const quote = (order as any).quotes?.[0]
              if (order.order_type === 'quote' && quote?.status === 'sent') {
                return (
                  <AcceptQuote
                    referenceNumber={order.reference_number}
                    lineItems={(quote.line_items as any[]) || []}
                    total={Number(quote.total || 0)}
                    notes={quote.notes}
                  />
                )
              }
              if (order.order_type === 'quote' && quote?.status === 'accepted') {
                return (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-green-700">✓ Quote accepted</p>
                    <p className="text-sm text-gray-500">The caterer will be in touch to arrange payment and finalise your event.</p>
                  </div>
                )
              }
              return null
            })()}

            {(order as any).caterer?.show_contact_publicly && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Contact the caterer</p>
                {(order as any).caterer?.phone && (
                  <p className="text-sm text-gray-600">{(order as any).caterer.phone}</p>
                )}
                {(order as any).caterer?.email && (
                  <a href={`mailto:${(order as any).caterer.email}`} className="text-sm text-blue-600">
                    {(order as any).caterer.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderLookupForm() {
  return (
    <form action="/order-status" method="get" className="space-y-3">
      <input
        name="ref"
        placeholder="Reference number (e.g. CAT-ABC12345)"
        required
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <input
        name="email"
        type="email"
        placeholder="Your email address"
        required
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <button
        type="submit"
        className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
      >
        Track order
      </button>
    </form>
  )
}
