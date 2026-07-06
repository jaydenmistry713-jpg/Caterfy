import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'
import DirectoryFilters from '@/components/customer/directory-filters'
import CatererCard from '@/components/customer/caterer-card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ location: string }>
}

const LIVE_STATUSES = ['active', 'trialling']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params
  const supabase = await createClient()
  const { data: loc } = await supabase.from('locations').select('name').eq('slug', location).maybeSingle()
  if (!loc) return { title: 'Not Found' }
  return {
    title: `Caterers in ${loc.name} — Caterfy`,
    description: `Find professional caterers in ${loc.name} for weddings, corporate events, parties and more. Browse menus and order online.`,
    alternates: { canonical: `/directory/${location}` },
  }
}

export default async function LocationDirectoryPage({ params }: Props) {
  const { location } = await params
  const supabase = await createClient()

  const { data: locationData } = await supabase.from('locations').select('*').eq('slug', location).maybeSingle()

  // Unknown location slugs are a 404, not an infinite thin-content surface
  if (!locationData) notFound()

  const [{ data: caterers }, { data: cuisines }, { data: eventTypes }, { data: dietaryOptions }, { data: locations }] =
    await Promise.all([
      supabase
        .from('caterers')
        .select(`
          *,
          location:locations(*),
          page:caterer_pages(*),
          reviews(rating),
          caterer_cuisines(cuisine:cuisines(*))
        `)
        .in('subscription_status', LIVE_STATUSES)
        .eq('location_id', locationData.id)
        .limit(60),
      supabase.from('cuisines').select('*').order('name'),
      supabase.from('event_types').select('*').order('name'),
      supabase.from('dietary_options').select('*').order('name'),
      supabase.from('locations').select('id, name, slug').order('name'),
    ])

  const locationName = locationData.name

  // Cuisines actually offered by caterers in this city → links to combo pages
  const cuisineSlugsHere = new Map<string, string>()
  for (const c of (caterers || []) as any[]) {
    for (const cc of c.caterer_cuisines || []) {
      if (cc.cuisine?.slug && cc.cuisine?.name) cuisineSlugsHere.set(cc.cuisine.slug, cc.cuisine.name)
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Directory', item: `${SITE_URL}/directory` },
          { '@type': 'ListItem', position: 2, name: `Caterers in ${locationName}`, item: `${SITE_URL}/directory/${location}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `Caterers in ${locationName}`,
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
          <Link href="/directory" className="flex items-center gap-1 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] mb-3">
            <ChevronLeft className="h-4 w-4" />All caterers
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--ink)] mb-1">Caterers in {locationName}</h1>
          <p className="text-[color:var(--ink-soft)]">
            {caterers?.length
              ? `${caterers.length} caterer${caterers.length === 1 ? '' : 's'} serving ${locationName} and the surrounding area`
              : `We're onboarding caterers in ${locationName}`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {caterers.map((caterer) => (
                  <CatererCard key={caterer.id} caterer={caterer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold text-[color:var(--ink)] mb-2">
                  We&rsquo;re onboarding caterers in {locationName}
                </p>
                <p className="text-[color:var(--ink-soft)] mb-6">
                  <Link href="/directory" className="underline">Browse all caterers</Link> in the meantime.
                </p>
                <p className="text-sm text-[color:var(--ink-soft)]">
                  Are you a caterer in {locationName}?{' '}
                  <Link href="/signup" className="font-medium text-[color:var(--basil)] underline">
                    Get listed free
                  </Link>
                </p>
              </div>
            )}

            {cuisineSlugsHere.size > 0 && (
              <section className="mt-12 border-t border-[color:var(--border-light)] pt-8">
                <h2 className="text-lg font-bold text-[color:var(--ink)] mb-4">Popular cuisines in {locationName}</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.from(cuisineSlugsHere.entries()).map(([slug, name]) => (
                    <Link
                      key={slug}
                      href={`/directory/${location}/${slug}`}
                      className="text-sm bg-[color:var(--surface)] border border-[color:var(--border-light)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] px-3.5 py-1.5 rounded-full"
                    >
                      {name} caterers in {locationName}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
