import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DirectoryFilters from '@/components/customer/directory-filters'
import CatererCard from '@/components/customer/caterer-card'

export const metadata: Metadata = {
  title: 'Browse Caterers — Caterfy',
  description: 'Find professional caterers near you. Filter by cuisine, event type, dietary options and more.',
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('caterers')
    .select(`
      *,
      location:locations(*),
      page:caterer_pages(*),
      caterer_cuisines(cuisine:cuisines(*)),
      caterer_event_types(event_type:event_types(*)),
      caterer_dietary_options(dietary_option:dietary_options(*))
    `)
    .eq('subscription_status', 'active')
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

  const { data: caterers } = await query.limit(20)
  const { data: cuisines } = await supabase.from('cuisines').select('*').order('name')
  const { data: eventTypes } = await supabase.from('event_types').select('*').order('name')
  const { data: dietaryOptions } = await supabase.from('dietary_options').select('*').order('name')
  const { data: locations } = await supabase.from('locations').select('id, name, slug').order('name')

  return (
    <div className="app-theme min-h-screen">
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border-light)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--ink)] mb-2">Find a Caterer</h1>
          <p className="text-[color:var(--ink-soft)]">Browse {caterers?.length || 0} caterers on Caterfy</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {caterers.map((caterer) => (
                  <CatererCard key={caterer.id} caterer={caterer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold text-gray-700 mb-2">No caterers found</p>
                <p className="text-gray-500">Try broadening your search filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
