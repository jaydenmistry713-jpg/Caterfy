import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import CatererAdminPanel from './caterer-admin-panel'

export const dynamic = 'force-dynamic'

export default async function AdminCatererPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect('/mistuzzo/login')

  const { id } = await params
  const supabase = await createClient()

  const { data: caterer } = await supabase
    .from('caterers')
    .select('*, location:locations(name)')
    .eq('id', id)
    .single()

  if (!caterer) notFound()

  const [ordersRes, reviewsRes, orderCountRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, reference_number, customer_name, total, status, payment_status, event_date, created_at')
      .eq('caterer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('caterer_id', id),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('caterer_id', id),
  ])

  const orders = ordersRes.data || []

  return (
    <div className="app-theme min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/mistuzzo" className="inline-flex items-center gap-1 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--basil)]">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl text-[color:var(--basil)]">{caterer.business_name}</h1>
            <p className="text-[color:var(--ink-soft)] mt-1">
              {caterer.email}
              {caterer.location?.name ? ` · ${caterer.location.name}` : ''}
              {' · joined '}{formatDate(caterer.created_at)}
            </p>
          </div>
          {caterer.slug && (
            <Link href={`/${caterer.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap">
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Status', value: caterer.subscription_status || '—' },
            { label: 'Orders (all time)', value: orderCountRes.count ?? 0 },
            { label: 'Reviews', value: reviewsRes.count ?? 0 },
            { label: 'Accepting orders', value: caterer.is_accepting_orders ? 'Yes' : 'No' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold capitalize">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin actions + edit form (client) */}
        <CatererAdminPanel caterer={caterer} />

        <Card>
          <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-2">Ref</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Event</th>
                      <th className="py-2 text-right">Total</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-100">
                        <td className="py-2 font-mono text-xs">{o.reference_number}</td>
                        <td className="py-2">{o.customer_name}</td>
                        <td className="py-2 text-gray-500">{formatDate(o.event_date)}</td>
                        <td className="py-2 text-right">{o.total ? `£${Number(o.total).toFixed(2)}` : '—'}</td>
                        <td className="py-2 capitalize">{o.status}</td>
                        <td className="py-2 capitalize text-gray-500">{o.payment_status?.replace('_', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
