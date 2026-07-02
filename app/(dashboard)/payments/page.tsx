import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConnectStripeButton from './connect-stripe-button'
import { ExternalLink, CreditCard, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PaymentsPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [catererRes, transactionsRes] = await Promise.all([
    supabase.from('caterers').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('id, reference_number, customer_name, total, payment_status, payment_method, event_date, status')
      .eq('caterer_id', user.id)
      .in('payment_status', ['paid', 'awaiting_payment'])
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const caterer = catererRes.data
  const transactions = transactionsRes.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Manage your payment account and view transaction history</p>
      </div>

      {/* Stripe Connect status */}
      {caterer?.stripe_connect_id ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
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
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Connect your payment account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              Connect a Stripe account to accept card payments from customers. Funds go directly to your bank account. This is a one-time setup that takes about 10 minutes — have your bank details ready.
            </p>

            <div className="space-y-4">
              {[
                { n: 1, title: 'Click Connect Stripe below', body: "You'll be taken to a secure Stripe form. Have your bank sort code and account number ready." },
                { n: 2, title: 'Complete the Stripe form', body: `Select your country and business type (Individual for sole traders). For industry choose Food & Beverage / Catering. When Stripe asks for your business website, enter your Caterfy page URL${caterer?.slug ? `: caterfy.com/${caterer.slug}` : ' (caterfy.com/your-slug)'}. Then enter your bank details for payouts.` },
                { n: 3, title: "You're done", body: "You'll be redirected back here automatically. Your payment account will be connected and your site can start taking card payments." },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">{n}</div>
                  <div>
                    <p className="font-medium text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500 mt-1">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <ConnectStripeButton caterererId={user.id} />
            </div>
          </CardContent>
        </Card>
      )}

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
