import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'
import CatererCard from '@/components/customer/caterer-card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ location: string; cuisine: string }>
}

const LIVE_STATUSES = ['active', 'trialling']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location, cuisine } = await params
  const supabase = await createClient()
  const [{ data: loc }, { data: cui }] = await Promise.all([
    supabase.from('locations').select('name').eq('slug', location).maybeSingle(),
    supabase.from('cuisines').select('name').eq('slug', cuisine).maybeSingle(),
  ])
  if (!loc || !cui) return { title: 'Not Found' }
  return {
    title: `${cui.name} Caterers in ${loc.name} — Caterfy`,
    description: `Find ${cui.name} caterers in ${loc.name} for weddings, corporate events, parties and more. Browse menus and order online.`,
    alternates: { canonical: `/directory/${location}/${cuisine}` },
  }
}

export default async function LocationCuisineDirectoryPage({ params }: Props) {
  const { location, cuisine } = await params
  const supabase = await createClient()

  const [locationRes, cuisineRes] = await Promise.all([
    supabase.from('locations').select('*').eq('slug', location).maybeSingle(),
    supabase.from('cuisines').select('*').eq('slug', cuisine).maybeSingle(),
  ])

  // Unknown slugs are a 404, not an infinite thin-content surface
  if (!locationRes.data || !cuisineRes.data) notFound()

  const { data: ids } = await supabase
    .from('caterer_cuisines')
    .select('caterer_id')
    .eq('cuisine_id', cuisineRes.data.id)
  const catererIds = ids?.map((i) => i.caterer_id) || []

  const { data: caterers } = catererIds.length
    ? await supabase
        .from('caterers')
        .select(`
          *,
          location:locations(*),
          page:caterer_pages(*),
          reviews(rating),
          caterer_cuisines(cuisine:cuisines(*))
        `)
        .in('subscription_status', LIVE_STATUSES)
        .eq('location_id', locationRes.data.id)
        .in('id', catererIds)
        .limit(60)
    : { data: [] as any[] }

  const locationName = locationRes.data.name
  const cuisineName = cuisineRes.data.name

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Directory', item: `${SITE_URL}/directory` },
          { '@type': 'ListItem', position: 2, name: `Caterers in ${locationName}`, item: `${SITE_URL}/directory/${location}` },
          { '@type': 'ListItem', position: 3, name: `${cuisineName} Caterers in ${locationName}`, item: `${SITE_URL}/directory/${location}/${cuisine}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${cuisineName} Caterers in ${locationName}`,
        numberOfItems: caterers?.length || 0,
        itemListElement: (caterers || []).slice(0, 10).map((c: any, i: number) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.business_name,
          url: `${SITE_URL}/${c.slug}`,
        })),
      },
    ],
  }

  return (
    <div className="app-theme min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border-light)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/directory/${location}`} className="flex items-center gap-1 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] mb-3">
            <ChevronLeft className="h-4 w-4" />Caterers in {locationName}
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--ink)] mb-1">{cuisineName} Caterers in {locationName}</h1>
          <p className="text-[color:var(--ink-soft)]">
            {caterers?.length
              ? `${caterers.length} ${cuisineName} caterer${caterers.length === 1 ? '' : 's'} serving ${locationName}`
              : `We're onboarding ${cuisineName} caterers in ${locationName}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {caterers && caterers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caterers.map((caterer) => <CatererCard key={caterer.id} caterer={caterer} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-[color:var(--ink)] mb-2">
              No {cuisineName} caterers in {locationName} yet
            </p>
            <p className="text-[color:var(--ink-soft)] mb-6">
              <Link href={`/directory/${location}`} className="underline">See all caterers in {locationName}</Link>
              {' '}or{' '}
              <Link href="/directory" className="underline">browse the full directory</Link>.
            </p>
            <p className="text-sm text-[color:var(--ink-soft)]">
              Are you a {cuisineName} caterer in {locationName}?{' '}
              <Link href="/signup" className="font-medium text-[color:var(--basil)] underline">
                Get listed free
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
