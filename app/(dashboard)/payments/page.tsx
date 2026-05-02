import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConnectStripeButton from './connect-stripe-button'
import { ExternalLink, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caterer } = await supabase.from('caterers').select('*').eq('id', user.id).single()

  const { data: transactions } = await supabase
    .from('orders')
    .select('id, reference_number, customer_name, total, payment_status, payment_method, event_date, status')
    .eq('caterer_id', user.id)
    .in('payment_status', ['paid', 'awaiting_payment'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Manage your payment account and view transaction history</p>
      </div>

      {/* Stripe Connect status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caterer?.stripe_connect_id ? (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Stripe account connected</p>
                  <p className="text-sm text-gray-500">You can accept card payments from customers</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Stripe Dashboard
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="font-medium text-gray-900">Connect Stripe to accept payments</p>
                  <p className="text-sm text-gray-500">Your site won't go live until Stripe is connected. Takes 5–10 minutes.</p>
                </div>
              </div>
              <ConnectStripeButton caterererId={user.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Reference</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Customer</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Event</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-xs">{t.reference_number}</td>
                      <td className="py-3">{t.customer_name}</td>
                      <td className="py-3">{formatDate(t.event_date)}</td>
                      <td className="py-3 text-right">
                        {t.total ? `£${Number(t.total).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={t.payment_status === 'paid' ? 'success' : 'warning'}>
                          {t.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
