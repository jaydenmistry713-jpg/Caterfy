import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConnectStripeButton from './connect-stripe-button'
import { ExternalLink, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
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
        <div className="space-y-4">
          {/* What is this */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">Payment setup required</p>
                  <p className="text-sm text-orange-800 mt-1">
                    To accept card payments from customers, you need to connect a Stripe account. Stripe handles all card processing securely — funds are paid directly to your bank account. This is a one-time setup that takes about 10 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step by step */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                How to connect your payment account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">1</div>
                <div>
                  <p className="font-medium text-gray-900">Enable Stripe Connect on your Stripe account</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Stripe requires you to activate Connect before linking accounts. Visit your Stripe dashboard and click <strong>Get started with Connect</strong>. You only need to do this once.
                  </p>
                  <a
                    href="https://dashboard.stripe.com/connect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Open Stripe Connect setup
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">2</div>
                <div>
                  <p className="font-medium text-gray-900">Click Connect Stripe below</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You'll be taken to a Stripe form to set up your payout account. Have your bank details ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">3</div>
                <div>
                  <p className="font-medium text-gray-900">Complete the Stripe onboarding form</p>
                  <p className="text-sm text-gray-500 mt-1 mb-3">Follow these selections when prompted:</p>
                  <div className="space-y-2">
                    {[
                      { q: 'Country', a: 'United Kingdom (or your country)' },
                      { q: 'Business type', a: 'Individual — if you\'re a sole trader, or Company if you have a registered business' },
                      { q: 'Industry', a: 'Food and Beverage / Catering' },
                      { q: 'Website', a: 'Your Caterfy site URL e.g. caterfy.com/your-name, or caterfy.netlify.app/your-name for now' },
                      { q: 'Bank account', a: 'Your sort code and account number — this is where customer payments are sent' },
                    ].map(({ q, a }) => (
                      <div key={q} className="flex gap-2 text-sm">
                        <span className="font-medium text-gray-700 w-32 flex-shrink-0">{q}:</span>
                        <span className="text-gray-600">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">4</div>
                <div>
                  <p className="font-medium text-gray-900">Return here once complete</p>
                  <p className="text-sm text-gray-500 mt-1">
                    After finishing the Stripe form you'll be redirected back automatically. Your payment account will show as connected and your site will be able to accept orders.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <ConnectStripeButton caterererId={user.id} />
                <p className="text-xs text-gray-400 mt-2">You'll be redirected to Stripe and then back here automatically.</p>
              </div>

            </CardContent>
          </Card>
        </div>
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
