import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, TrendingUp, Users, ShoppingBag } from 'lucide-react'

export default async function AnalyticsPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [ordersRes, reviewsRes, totalOrdersRes] = await Promise.all([
    supabase.from('orders').select('id, created_at, status, total').eq('caterer_id', user.id).gte('created_at', thirtyDaysAgo),
    supabase.from('reviews').select('rating').eq('caterer_id', user.id),
    supabase.from('orders').select('id', { count: 'exact' }).eq('caterer_id', user.id),
  ])

  const recentOrders = ordersRes.data || []
  const allReviews = reviewsRes.data || []
  const totalOrders = totalOrdersRes.count || 0

  const completedOrders = recentOrders.filter((o) => o.status === 'completed' || o.status === 'accepted')
  const avgRating = allReviews.length
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Order and enquiry statistics for your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Orders (30 days)</p>
                <p className="text-3xl font-bold mt-1">{recentOrders.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold mt-1">{totalOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Rating</p>
                <p className="text-3xl font-bold mt-1">{avgRating || '—'}</p>
              </div>
              <BarChart2 className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-3xl font-bold mt-1">{allReviews.length}</p>
              </div>
              <Users className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Order Activity (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No orders in the last 30 days</p>
          ) : (
            <div className="space-y-2">
              {['pending', 'accepted', 'completed', 'declined', 'cancelled'].map((status) => {
                const count = recentOrders.filter((o) => o.status === status).length
                if (!count) return null
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-20 capitalize">{status}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full"
                        style={{ width: `${(count / recentOrders.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
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
