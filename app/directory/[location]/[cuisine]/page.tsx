import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CatererCard from '@/components/customer/caterer-card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ location: string; cuisine: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location, cuisine } = await params
  const loc = location.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  const cui = cuisine.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  return {
    title: `${cui} Caterers in ${loc} — Caterfy`,
    description: `Find ${cui} caterers in ${loc} for weddings, corporate events, and more.`,
  }
}

export default async function LocationCuisineDirectoryPage({ params }: Props) {
  const { location, cuisine } = await params
  const supabase = await createClient()

  const [locationData, cuisineData] = await Promise.all([
    supabase.from('locations').select('*').eq('slug', location).single(),
    supabase.from('cuisines').select('*').eq('slug', cuisine).single(),
  ])

  let catererIds: string[] = []
  if (cuisineData.data) {
    const { data: ids } = await supabase.from('caterer_cuisines').select('caterer_id').eq('cuisine_id', cuisineData.data.id)
    catererIds = ids?.map((i) => i.caterer_id) || []
  }

  let query = supabase
    .from('caterers')
    .select(`
      *,
      location:locations(*),
      page:caterer_pages(*),
      caterer_cuisines(cuisine:cuisines(*))
    `)
    .eq('subscription_status', 'active')

  if (locationData.data) query = query.eq('location_id', locationData.data.id)
  if (catererIds.length) query = query.in('id', catererIds)

  const { data: caterers } = await query.limit(20)

  const locationName = locationData.data?.name || location.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  const cuisineName = cuisineData.data?.name || cuisine.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div className="app-theme min-h-screen">
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border-light)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/directory/${location}`} className="flex items-center gap-1 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] mb-3">
            <ChevronLeft className="h-4 w-4" />Caterers in {locationName}
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--ink)] mb-1">{cuisineName} Caterers in {locationName}</h1>
          <p className="text-[color:var(--ink-soft)]">{caterers?.length || 0} caterers found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {caterers && caterers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caterers.map((caterer) => <CatererCard key={caterer.id} caterer={caterer} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-gray-700 mb-2">No {cuisineName} caterers found in {locationName}</p>
            <Link href="/directory" className="text-gray-500 hover:text-gray-900 underline">Browse all caterers</Link>
          </div>
        )}
      </div>
    </div>
  )
}
