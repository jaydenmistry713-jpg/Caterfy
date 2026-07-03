import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import DirectoryFilters from '@/components/customer/directory-filters'
import CatererCard from '@/components/customer/caterer-card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params
  const locationName = location.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  return {
    title: `Caterers in ${locationName} — Caterfy`,
    description: `Find professional caterers in ${locationName} for weddings, corporate events, and more.`,
  }
}

export default async function LocationDirectoryPage({ params }: Props) {
  const { location } = await params
  const supabase = await createClient()

  const { data: locationData } = await supabase.from('locations').select('*').eq('slug', location).single()

  let query = supabase
    .from('caterers')
    .select(`
      *,
      location:locations(*),
      page:caterer_pages(*),
      caterer_cuisines(cuisine:cuisines(*))
    `)
    .eq('subscription_status', 'active')

  if (locationData) {
    query = query.eq('location_id', locationData.id)
  }

  const { data: caterers } = await query.limit(20)
  const { data: cuisines } = await supabase.from('cuisines').select('*').order('name')
  const { data: eventTypes } = await supabase.from('event_types').select('*').order('name')
  const { data: dietaryOptions } = await supabase.from('dietary_options').select('*').order('name')

  const locationName = locationData?.name || location.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div className="app-theme min-h-screen">
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border-light)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/directory" className="flex items-center gap-1 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] mb-3">
            <ChevronLeft className="h-4 w-4" />All caterers
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--ink)] mb-1">Caterers in {locationName}</h1>
          <p className="text-[color:var(--ink-soft)]">{caterers?.length || 0} caterers found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <DirectoryFilters cuisines={cuisines || []} eventTypes={eventTypes || []} dietaryOptions={dietaryOptions || []} />
          </aside>
          <div className="flex-1">
            {caterers && caterers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {caterers.map((caterer) => <CatererCard key={caterer.id} caterer={caterer} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold text-gray-700 mb-2">No caterers found in {locationName}</p>
                <Link href="/directory" className="text-gray-500 hover:text-gray-900 underline">Browse all caterers</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
