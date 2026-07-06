import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, TrendingUp, Users, ShoppingBag, Eye } from 'lucide-react'

export default async function AnalyticsPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString()
  const thirtyDaysAgoDate = thirtyDaysAgoIso.split('T')[0]

  const [ordersRes, reviewsRes, totalOrdersRes, pageViewsRes] = await Promise.all([
    supabase.from('orders').select('id, created_at, status, total').eq('caterer_id', user.id).gte('created_at', thirtyDaysAgoIso),
    supabase.from('reviews').select('rating').eq('caterer_id', user.id),
    supabase.from('orders').select('id', { count: 'exact' }).eq('caterer_id', user.id),
    supabase.from('page_views').select('views').eq('caterer_id', user.id).gte('date', thirtyDaysAgoDate),
  ])

  const recentOrders = ordersRes.data || []
  const allReviews = reviewsRes.data || []
  const totalOrders = totalOrdersRes.count || 0
  const pageViews30d = (pageViewsRes.data || []).reduce((sum, r: any) => sum + (r.views || 0), 0)

  const avgRating = allReviews.length
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : null

  const stats = [
    { label: 'Page views (30 days)', value: pageViews30d, icon: Eye },
    { label: 'Orders (30 days)', value: recentOrders.length, icon: ShoppingBag },
    { label: 'Total Orders', value: totalOrders, icon: TrendingUp },
    { label: 'Avg. Rating', value: avgRating || '—', icon: BarChart2 },
    { label: 'Total Reviews', value: allReviews.length, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--ink)]">Analytics</h1>
        <p className="text-[color:var(--ink-soft)] mt-1">Visits, orders and reviews for your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[color:var(--ink-soft)]">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 text-[color:var(--ink)]">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-[color:var(--border-light)]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Order Activity (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-[color:var(--ink-soft)] text-center py-6">No orders in the last 30 days</p>
          ) : (
            <div className="space-y-2">
              {['pending', 'accepted', 'completed', 'declined', 'cancelled'].map((status) => {
                const count = recentOrders.filter((o) => o.status === status).length
                if (!count) return null
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm text-[color:var(--ink-soft)] w-20 capitalize">{status}</span>
                    <div className="flex-1 bg-[color:var(--cream-2)] rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[color:var(--basil)]"
                        style={{ width: `${(count / recentOrders.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[color:var(--ink)] w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
