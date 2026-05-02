import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Star, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [catererRes, ordersRes, reviewsRes, pageRes, galleryRes] = await Promise.all([
    supabase.from('caterers').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('reviews').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('caterer_pages').select('*').eq('caterer_id', user.id).single(),
    supabase.from('gallery_images').select('id').eq('caterer_id', user.id),
  ])

  const caterer = catererRes.data
  const recentOrders = ordersRes.data || []
  const recentReviews = reviewsRes.data || []
  const page = pageRes.data
  const galleryCount = galleryRes.data?.length || 0
  const pendingOrders = recentOrders.filter((o) => o.status === 'pending').length

  // Build checklist
  const checklist = [
    { label: 'Basic info added', done: !!caterer?.phone || !!caterer?.location_id, href: '/settings' },
    { label: 'Branding set up', done: !!(page?.logo_url || page?.primary_color !== '#000000'), href: '/site-editor' },
    { label: 'Menu items added', done: false, href: '/menu' },
    { label: 'Gallery photos uploaded (min 3)', done: galleryCount >= 3, href: '/gallery' },
    { label: 'Stripe Connect connected', done: !!caterer?.stripe_connect_id, href: '/payments' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{caterer?.business_name ? `, ${caterer.business_name}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your business</p>
      </div>

      {/* Welcome banner — shown once after email verification */}
      {welcome === 'true' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Email verified — welcome to Caterfy!</p>
            <p className="text-sm text-green-800 mt-1">
              Your account is set up and your 14-day free trial has started. Work through the setup checklist below to get your site live.
            </p>
          </div>
        </div>
      )}

      {/* Trial banner */}
      {caterer?.subscription_status === 'trialling' && caterer?.trial_ends_at && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Free trial active</p>
            <p className="text-sm text-yellow-700">
              Your trial ends on {formatDate(caterer.trial_ends_at)}.{' '}
              <Link href="/settings" className="underline">Add payment details</Link> to continue.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold mt-1">{pendingOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{recentOrders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reviews</p>
                <p className="text-2xl font-bold mt-1">{recentReviews.length}</p>
              </div>
              <Star className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gallery Photos</p>
                <p className="text-2xl font-bold mt-1">{galleryCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                {galleryCount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Setup checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {item.done && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900">View all →</Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.reference_number} · {formatDate(order.event_date)}</p>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
