import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import AdminLogoutButton from './logout-button'
import { Users, ShoppingBag, Star, TrendingUp } from 'lucide-react'

// Auth is cookie-based, so this page must render per-request (never prerendered).
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Require admin authentication (cookie-based; see lib/admin/auth.ts)
  if (!(await isAdminAuthenticated())) {
    redirect('/mistuzzo/login')
  }

  const supabase = await createClient()

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [caterersRes, ordersRes, reviewsRes, activeRes, trialRes] = await Promise.all([
    supabase.from('caterers').select('id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact' }).gte('created_at', oneWeekAgo),
    supabase.from('reviews').select('id', { count: 'exact' }).gte('created_at', oneWeekAgo),
    supabase.from('caterers').select('id', { count: 'exact' }).eq('subscription_status', 'active'),
    supabase.from('caterers').select('id', { count: 'exact' }).eq('subscription_status', 'trialling'),
  ])

  const { data: recentCaterers } = await supabase
    .from('caterers')
    .select('id, business_name, email, subscription_status, created_at, slug')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Caterfy Admin</h1>
          <AdminLogoutButton />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Caterers</p>
                  <p className="text-3xl font-bold">{caterersRes.count || 0}</p>
                  <p className="text-xs text-gray-400">{activeRes.count} active · {trialRes.count} trialling</p>
                </div>
                <Users className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Orders (7d)</p>
                  <p className="text-3xl font-bold">{ordersRes.count || 0}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reviews (7d)</p>
                  <p className="text-3xl font-bold">{reviewsRes.count || 0}</p>
                </div>
                <Star className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-3xl font-bold">£{((activeRes.count || 0) * 10).toFixed(0)}</p>
                  <p className="text-xs text-gray-400">est. from {activeRes.count} active</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Caterers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500">Business</th>
                    <th className="text-left py-2 text-gray-500">Email</th>
                    <th className="text-left py-2 text-gray-500">Status</th>
                    <th className="text-left py-2 text-gray-500">Joined</th>
                    <th className="text-left py-2 text-gray-500">Site</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCaterers?.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{c.business_name}</td>
                      <td className="py-3 text-gray-500">{c.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                          c.subscription_status === 'trialling' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {c.subscription_status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="py-3">
                        {c.slug ? (
                          <Link href={`/${c.slug}`} target="_blank" className="text-blue-600 hover:underline text-xs">View site</Link>
                        ) : (
                          <span className="text-gray-400 text-xs">No site</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
