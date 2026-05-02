import { Metadata } from 'next'
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

  if (params.cuisine) {
    const { data: cuisine } = await supabase
      .from('cuisines')
      .select('id')
      .eq('slug', params.cuisine)
      .single()
    if (cuisine) {
      const { data: catererIds } = await supabase
        .from('caterer_cuisines')
        .select('caterer_id')
        .eq('cuisine_id', cuisine.id)
      if (catererIds?.length) {
        query = query.in('id', catererIds.map((c) => c.caterer_id))
      }
    }
  }

  const { data: caterers } = await query.limit(20)
  const { data: cuisines } = await supabase.from('cuisines').select('*').order('name')
  const { data: eventTypes } = await supabase.from('event_types').select('*').order('name')
  const { data: dietaryOptions } = await supabase.from('dietary_options').select('*').order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Caterer</h1>
          <p className="text-gray-500">Browse {caterers?.length || 0} caterers on Caterfy</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <DirectoryFilters
              cuisines={cuisines || []}
              eventTypes={eventTypes || []}
              dietaryOptions={dietaryOptions || []}
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
