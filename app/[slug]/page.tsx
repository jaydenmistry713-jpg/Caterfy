import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'
import CatererPageClassic from '@/components/caterer/template-classic'
import CatererPageModern from '@/components/caterer/template-modern'
import CatererPageBold from '@/components/caterer/template-bold'
import CatererPageLinkPage from '@/components/caterer/template-linkpage'
import CatererPageMaison from '@/components/caterer/template-maison'

interface Props {
  params: Promise<{ slug: string }>
}

// A caterer site renders while the account is active, or trialling with time
// left on the trial. Lapsed accounts get a soft "taking a break" page instead
// of a 404 so links already in the wild aren't burned.
function isLive(caterer: { subscription_status?: string | null; trial_ends_at?: string | null }) {
  if (caterer.subscription_status === 'active') return true
  if (caterer.subscription_status === 'trialling') {
    if (!caterer.trial_ends_at) return true
    return new Date(caterer.trial_ends_at).getTime() > Date.now()
  }
  return false
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: caterer } = await supabase
    .from('caterers')
    .select(`
      business_name, subscription_status, trial_ends_at,
      page:caterer_pages(tagline, hero_image_url),
      location:locations(name),
      caterer_cuisines(cuisine:cuisines(name))
    `)
    .eq('slug', slug)
    .single()

  if (!caterer) return { title: 'Not Found' }

  const page = (caterer as any).page
  const location = (caterer as any).location?.name
  const cuisine = (caterer as any).caterer_cuisines?.[0]?.cuisine?.name

  // Local-SEO title: "{name} — {cuisine} Caterer in {town} | Caterfy"
  const descriptor = [cuisine ? `${cuisine} Caterer` : 'Caterer', location ? `in ${location}` : '']
    .filter(Boolean)
    .join(' ')
  const title = `${caterer.business_name} — ${descriptor} | Caterfy`
  const description =
    page?.tagline ||
    `Professional catering by ${caterer.business_name}${location ? ` in ${location}` : ''}. View the menu and order online.`

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    // Lapsed sites shouldn't be indexed while they're offline
    robots: isLive(caterer as any) ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      type: 'website',
      siteName: 'Caterfy',
      images: page?.hero_image_url
        ? [{ url: page.hero_image_url, alt: caterer.business_name }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Caterfy' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: page?.hero_image_url ? [page.hero_image_url] : ['/og-image.png'],
    },
  }
}

export default async function CatererPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: caterer } = await supabase
    .from('caterers')
    .select(`
      *,
      location:locations(*),
      page:caterer_pages(*),
      caterer_cuisines(cuisine:cuisines(*)),
      caterer_event_types(event_type:event_types(*)),
      caterer_dietary_options(dietary_option:dietary_options(*))
    `)
    .eq('slug', slug)
    .single()

  if (!caterer) notFound()

  // Soft expiry: the account exists but has lapsed — show a friendly holding
  // page rather than a 404, so shared links and QR codes stay warm.
  if (!isLive(caterer)) {
    return (
      <div className="app-theme min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="font-mono-brand text-xs tracking-[0.2em] uppercase text-[color:var(--marigold-deep)]">
            {caterer.business_name}
          </p>
          <h1 className="font-display text-3xl mt-4 text-[color:var(--ink)]">
            This site is taking a short break
          </h1>
          <p className="mt-4 text-[color:var(--ink-soft)]">
            {caterer.business_name}&rsquo;s page isn&rsquo;t available right now.
            Check back soon, or browse other caterers in the meantime.
          </p>
          <Link
            href="/directory"
            className="inline-block mt-6 rounded-full px-6 py-3 text-sm font-semibold bg-[color:var(--basil)] text-[color:var(--cream)]"
          >
            Browse caterers
          </Link>
        </div>
      </div>
    )
  }

  const [menuItemsRes, packagesRes, galleryRes, reviewsRes] = await Promise.all([
    supabase.from('menu_items').select('*').eq('caterer_id', caterer.id).eq('is_available', true).order('sort_order'),
    supabase.from('packages').select('*').eq('caterer_id', caterer.id).eq('is_available', true).order('sort_order'),
    supabase.from('gallery_images').select('*').eq('caterer_id', caterer.id).order('sort_order'),
    supabase.from('reviews').select('*').eq('caterer_id', caterer.id).order('created_at', { ascending: false }),
  ])

  // Count the visit (fire-and-forget; SECURITY DEFINER function, callable with
  // the anon key; ignore errors e.g. if the migration hasn't run yet)
  try {
    await supabase.rpc('increment_page_view', { p_caterer_id: caterer.id })
  } catch {}

  const data = {
    caterer,
    menuItems: menuItemsRes.data || [],
    packages: packagesRes.data || [],
    gallery: galleryRes.data || [],
    reviews: reviewsRes.data || [],
  }

  const template = caterer.page?.template || 'classic'

  // Load the caterer's selected Google Fonts so heading/body font choices
  // actually render. Maison locks its own type pairing and loads it itself.
  const fonts = template === 'maison'
    ? []
    : Array.from(new Set([caterer.page?.heading_font, caterer.page?.body_font].filter(Boolean)))
  const fontHref = fonts.length
    ? `https://fonts.googleapis.com/css2?${fonts.map((f: string) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&')}&display=swap`
    : null

  // LocalBusiness structured data — earns local-search visibility and, with
  // reviews, star snippets in results.
  const reviews = reviewsRes.data || []
  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : null
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: caterer.business_name,
    url: `${SITE_URL}/${caterer.slug}`,
    ...(caterer.page?.logo_url ? { logo: caterer.page.logo_url } : {}),
    ...(caterer.page?.hero_image_url ? { image: caterer.page.hero_image_url } : {}),
    ...(caterer.page?.tagline ? { description: caterer.page.tagline } : {}),
    ...(caterer.show_contact_publicly && caterer.phone ? { telephone: caterer.phone } : {}),
    ...(caterer.location?.name
      ? { areaServed: { '@type': 'City', name: caterer.location.name } }
      : {}),
    servesCuisine: (caterer.caterer_cuisines || [])
      .map((c: any) => c.cuisine?.name)
      .filter(Boolean),
    ...(avgRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(avgRating.toFixed(1)),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }

  const page =
    template === 'modern' ? <CatererPageModern {...data} /> :
    template === 'bold' ? <CatererPageBold {...data} /> :
    template === 'linkpage' ? <CatererPageLinkPage {...data} /> :
    template === 'maison' ? <CatererPageMaison {...data} /> :
    <CatererPageClassic {...data} />

  return (
    <>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {page}
    </>
  )
}
