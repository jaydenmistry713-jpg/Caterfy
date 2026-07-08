import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminCaterersListPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect('/mistuzzo/login')

  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('caterers')
    .select('id, business_name, email, subscription_status, created_at, slug')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q && q.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`business_name.ilike.${term},email.ilike.${term},slug.ilike.${term}`)
  }

  const { data: caterers } = await query

  return (
    <div className="app-theme min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/mistuzzo" className="inline-flex items-center gap-1 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--basil)]">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl text-[color:var(--basil)]">All caterers</h1>
          <form method="get" className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="q"
                defaultValue={q || ''}
                placeholder="Search name, email or slug"
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[color:var(--basil)]"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-[color:var(--basil)] text-[color:var(--cream)]">Search</button>
          </form>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2">Business</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Joined</th>
                    <th className="py-2">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {(caterers || []).map((c) => (
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
                      <td className="py-3 text-gray-500">{formatDate(c.created_at)}</td>
                      <td className="py-3">
                        <Link href={`/mistuzzo/caterers/${c.id}`} className="text-[color:var(--basil)] font-medium hover:underline text-xs">Manage →</Link>
                      </td>
                    </tr>
                  ))}
                  {(!caterers || caterers.length === 0) && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">No caterers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
