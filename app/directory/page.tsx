import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'
import DirectoryFilters from '@/components/customer/directory-filters'
import CatererCard from '@/components/customer/caterer-card'

export const metadata: Metadata = {
  title: 'Browse Caterers — Caterfy',
  description: 'Find professional caterers near you. Filter by cuisine, event type, dietary options and more.',
  alternates: { canonical: '/directory' },
}

const PAGE_SIZE = 24
// Live = visible in the directory. Trialling caterers are listed too — every
// Caterfy site is in the directory from day one.
const LIVE_STATUSES = ['active', 'trialling']

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const pageNum = Math.max(1, parseInt(typeof params.page === 'string' ? params.page : '1', 10) || 1)

  let query = supabase
    .from('caterers')
    .select(`
      *,
      location:locations(*),
      page:caterer_pages(*),
      reviews(rating),
      caterer_cuisines(cuisine:cuisines(*)),
      caterer_event_types(event_type:event_types(*)),
      caterer_dietary_options(dietary_option:dietary_options(*))
    `, { count: 'exact' })
    .in('subscription_status', LIVE_STATUSES)
    .order('created_at', { ascending: false })

  // Sentinel UUID that no caterer will have — used to force an empty result set
  // when a filter matches nobody (instead of falling through to "show everyone").
  const NO_MATCH = '00000000-0000-0000-0000-000000000000'
  const asList = (v?: string | string[]) => (typeof v === 'string' && v ? v.split(',').filter(Boolean) : [])

  // Sidebar filters pass comma-separated reference IDs (cuisines/events/dietary).
  // A caterer must match ALL selected groups, so we intersect the matching id sets.
  const idsFor = async (table: string, column: string, values: string[]): Promise<string[]> => {
    const { data } = await supabase.from(table).select('caterer_id').in(column, values)
    return Array.from(new Set((data || []).map((r: any) => r.caterer_id)))
  }

  const groups: string[][] = []
  if (asList(params.cuisines).length) groups.push(await idsFor('caterer_cuisines', 'cuisine_id', asList(params.cuisines)))
  if (asList(params.events).length) groups.push(await idsFor('caterer_event_types', 'event_type_id', asList(params.events)))
  if (asList(params.dietary).length) groups.push(await idsFor('caterer_dietary_options', 'dietary_option_id', asList(params.dietary)))

  // Legacy single-slug entry (e.g. links to ?cuisine=slug)
  if (params.cuisine && typeof params.cuisine === 'string') {
    const { data: cuisine } = await supabase.from('cuisines').select('id').eq('slug', params.cuisine).single()
    groups.push(cuisine ? await idsFor('caterer_cuisines', 'cuisine_id', [cuisine.id]) : [NO_MATCH])
  }

  if (groups.length) {
    const intersection = groups.reduce((acc, g) => acc.filter((id) => g.includes(id)))
    query = query.in('id', intersection.length ? intersection : [NO_MATCH])
  }

  // Location filter (by slug from the sidebar dropdown)
  if (params.location && typeof params.location === 'string') {
    const { data: loc } = await supabase.from('locations').select('id').eq('slug', params.location).limit(1).maybeSingle()
    query = loc ? query.eq('location_id', loc.id) : query.in('id', [NO_MATCH])
  }

  const from = (pageNum - 1) * PAGE_SIZE
  const { data: caterers, count } = await query.range(from, from + PAGE_SIZE - 1)
  const total = count ?? caterers?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const [{ data: cuisines }, { data: eventTypes }, { data: dietaryOptions }, { data: locations }, { data: liveCaterers }] =
    await Promise.all([
      supabase.from('cuisines').select('*').order('name'),
      supabase.from('event_types').select('*').order('name'),
      supabase.from('dietary_options').select('*').order('name'),
      supabase.from('locations').select('id, name, slug').order('name'),
      supabase.from('caterers').select('location_id').in('subscription_status', LIVE_STATUSES),
    ])

  // "Browse by city" — only cities that actually have live caterers
  const liveLocationIds = new Set((liveCaterers || []).map((c) => c.location_id).filter(Boolean))
  const citiesWithCaterers = (locations || []).filter((l) => liveLocationIds.has(l.id))

  const pageLink = (p: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === 'string' && v && k !== 'page') q.set(k, v)
    }
    if (p > 1) q.set('page', String(p))
    const qs = q.toString()
    return `/directory${qs ? `?${qs}` : ''}`
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Caterers on Caterfy',
    numberOfItems: total,
    itemListElement: (caterers || []).slice(0, 10).map((c: any, i: number) => ({
      '@type': 'ListItem',
      position: from + i + 1,
      name: c.business_name,
      url: `${SITE_URL}/${c.slug}`,
    })),
  }

  return (
    <div className="app-theme min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border-light)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--ink)] mb-2">Find a Caterer</h1>
          <p className="text-[color:var(--ink-soft)]">
            {total > 0 ? `Browse ${total} caterer${total === 1 ? '' : 's'} on Caterfy` : 'Browse caterers on Caterfy'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <DirectoryFilters
              cuisines={cuisines || []}
              eventTypes={eventTypes || []}
              dietaryOptions={dietaryOptions || []}
              locations={locations || []}
            />
          </aside>

          <div className="flex-1">
            {caterers && caterers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {caterers.map((caterer) => (
                    <CatererCard key={caterer.id} caterer={caterer} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Pagination">
                    {pageNum > 1 && (
                      <Link href={pageLink(pageNum - 1)} className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)] hover:underline">
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Link>
                    )}
                    <span className="text-sm text-[color:var(--ink-soft)]">
                      Page {pageNum} of {totalPages}
                    </span>
                    {pageNum < totalPages && (
                      <Link href={pageLink(pageNum + 1)} className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)] hover:underline">
                        Next <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold text-[color:var(--ink)] mb-2">No caterers found</p>
                <p className="text-[color:var(--ink-soft)] mb-6">Try broadening your search filters</p>
                <p className="text-sm text-[color:var(--ink-soft)]">
                  Are you a caterer?{' '}
                  <Link href="/signup" className="font-medium text-[color:var(--basil)] underline">
                    Get listed free
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Browse-by links — internal linking for the location/cuisine pages */}
        {citiesWithCaterers.length > 0 && (
          <section className="mt-14 border-t border-[color:var(--border-light)] pt-10">
            <h2 className="text-lg font-bold text-[color:var(--ink)] mb-4">Browse caterers by city</h2>
            <div className="flex flex-wrap gap-2">
              {citiesWithCaterers.map((l) => (
                <Link
                  key={l.id}
                  href={`/directory/${l.slug}`}
                  className="text-sm bg-[color:var(--surface)] border border-[color:var(--border-light)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] px-3.5 py-1.5 rounded-full"
                >
                  Caterers in {l.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
