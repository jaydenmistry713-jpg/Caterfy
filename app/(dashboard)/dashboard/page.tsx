import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, AlertCircle, CheckCircle, ArrowRight, Eye, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import OnboardingWizard from './onboarding-wizard'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [
    catererRes,
    recentOrdersRes,
    totalOrdersRes,
    pendingOrdersRes,
    reviewsCountRes,
    pageRes,
    galleryRes,
    menuRes,
    pageViewsRes,
  ] = await Promise.all([
    supabase.from('caterers').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('caterer_id', user.id),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('caterer_id', user.id).eq('status', 'pending'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('caterer_id', user.id),
    supabase.from('caterer_pages').select('*').eq('caterer_id', user.id).single(),
    supabase.from('gallery_images').select('id', { count: 'exact', head: true }).eq('caterer_id', user.id),
    supabase.from('menu_items').select('id').eq('caterer_id', user.id).limit(1),
    supabase.from('page_views').select('views').eq('caterer_id', user.id).gte('date', thirtyDaysAgo),
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
  const recentOrders = recentOrdersRes.data || []
  const totalOrders = totalOrdersRes.count || 0
  const pendingOrders = pendingOrdersRes.count || 0
  const totalReviews = reviewsCountRes.count || 0
  const page = pageRes.data
  const galleryCount = galleryRes.count || 0
  const hasMenuItems = (menuRes.data?.length || 0) > 0
  const pageViews30d = (pageViewsRes.data || []).reduce((sum, r: any) => sum + (r.views || 0), 0)

  // Build checklist — location is required (a caterer without one never
  // appears in location searches), and sharing the link is the final step.
  const checklist = [
    { label: 'Basic info added (location required)', done: !!caterer?.location_id, href: '/settings' },
    { label: 'Branding set up', done: !!(page?.logo_url || page?.tagline || page?.accent_color !== '#2E75B6' || page?.primary_color !== '#000000'), href: '/site-editor' },
    { label: 'Menu items added', done: hasMenuItems, href: '/menu' },
    { label: 'Gallery photos uploaded (min 3)', done: galleryCount >= 3, href: '/gallery' },
    { label: 'Stripe Connect connected', done: !!caterer?.stripe_connect_id, href: '/payments' },
    { label: 'Share your link', done: !!caterer?.link_shared_at, href: '/site-editor' },
  ]

  const stats = [
    { label: 'Pending Orders', value: pendingOrders, icon: ShoppingBag },
    { label: 'Total Orders', value: totalOrders, icon: CheckCircle },
    { label: 'Reviews', value: totalReviews, icon: Star },
    { label: 'Page views (30 days)', value: pageViews30d, icon: Eye },
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
        <h1 className="text-2xl font-bold text-[color:var(--ink)]">
          Welcome back{caterer?.business_name ? `, ${caterer.business_name}` : ''}
        </h1>
        <p className="text-[color:var(--ink-soft)] mt-1">Here&rsquo;s an overview of your business</p>
      </div>

      {/* Trial banner */}
      {caterer?.subscription_status === 'trialling' && caterer?.trial_ends_at && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Free trial active</p>
            <p className="text-sm text-yellow-700">
              Your trial ends on {formatDate(caterer.trial_ends_at)}.{' '}
              <Link href="/settings?tab=subscription" className="underline font-medium">Set up your subscription</Link> to keep your site live.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[color:var(--ink-soft)]">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 text-[color:var(--ink)]">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-[color:var(--border-light)]" />
              </div>
            </CardContent>
          </Card>
        ))}
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
                <p className="font-medium text-[color:var(--ink)]">All set!</p>
                <p className="text-sm text-[color:var(--ink-soft)]">Your profile is complete and ready for customers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checklist.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[color:var(--cream-2)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.done ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full flex-shrink-0 bg-[color:var(--cream-2)] border border-[color:var(--border-light)]" />
                      )}
                      <span className={`text-sm ${item.done ? 'text-[color:var(--ink-soft)] line-through' : 'text-[color:var(--ink)]'}`}>
                        {item.label}
                      </span>
                    </div>
                    {!item.done && <ArrowRight className="h-4 w-4 text-[color:var(--ink-soft)]" />}
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
            <Link href="/orders" className="text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]">View all →</Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[color:var(--ink-soft)] text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-[color:var(--border-light)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--ink)]">{order.customer_name}</p>
                      <p className="text-xs text-[color:var(--ink-soft)]">{order.reference_number} · {formatDate(order.event_date)}</p>
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
