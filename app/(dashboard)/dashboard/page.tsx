import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Star, AlertCircle, CheckCircle, ArrowRight, PlayCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import OnboardingWizard from './onboarding-wizard'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [catererRes, ordersRes, reviewsRes, pageRes, galleryRes, menuRes] = await Promise.all([
    supabase.from('caterers').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('reviews').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('caterer_pages').select('*').eq('caterer_id', user.id).single(),
    supabase.from('gallery_images').select('id').eq('caterer_id', user.id),
    supabase.from('menu_items').select('id').eq('caterer_id', user.id).limit(1),
  ])

  // Fetch reference data for onboarding wizard on first login
  let onboardingData: { locations: any[]; cuisines: any[]; eventTypes: any[] } | null = null
  if (welcome === 'true') {
    const [locRes, cuiRes, evtRes] = await Promise.all([
      supabase.from('locations').select('id, name').order('name'),
      supabase.from('cuisines').select('id, name').order('name'),
      supabase.from('event_types').select('id, name').order('name'),
    ])
    onboardingData = {
      locations: locRes.data || [],
      cuisines: cuiRes.data || [],
      eventTypes: evtRes.data || [],
    }
  }

  const caterer = catererRes.data
  const recentOrders = ordersRes.data || []
  const recentReviews = reviewsRes.data || []
  const page = pageRes.data
  const galleryCount = galleryRes.data?.length || 0
  const hasMenuItems = (menuRes.data?.length || 0) > 0
  const pendingOrders = recentOrders.filter((o) => o.status === 'pending').length

  // Build checklist
  const checklist = [
    { label: 'Basic info added', done: !!caterer?.phone || !!caterer?.location_id, href: '/settings' },
    { label: 'Branding set up', done: !!(page?.logo_url || page?.primary_color !== '#000000'), href: '/site-editor' },
    { label: 'Menu items added', done: hasMenuItems, href: '/menu' },
    { label: 'Gallery photos uploaded (min 3)', done: galleryCount >= 3, href: '/gallery' },
    { label: 'Stripe Connect connected', done: !!caterer?.stripe_connect_id, href: '/payments' },
  ]

  return (
    <div className="space-y-8">
      {/* Onboarding wizard — shown once after email verification */}
      {onboardingData && (
        <OnboardingWizard
          caterererId={user.id}
          businessName={caterer?.business_name || ''}
          locations={onboardingData.locations}
          cuisines={onboardingData.cuisines}
          eventTypes={onboardingData.eventTypes}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{caterer?.business_name ? `, ${caterer.business_name}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your business</p>
      </div>

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
            {checklist.every((i) => i.done) ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="font-medium text-gray-900">All set!</p>
                <p className="text-sm text-gray-500">Your profile is complete and ready for customers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checklist.filter((item) => !item.done).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200" />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
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

      {/* Getting started video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-gray-400" />
            Getting started with Caterfy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full max-w-2xl rounded-xl bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <PlayCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Tutorial video coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
