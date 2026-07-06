import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'
import { GUIDES } from '@/lib/guides'

export const revalidate = 3600 // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/directory`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Bare client (no cookies) — sitemap generation runs outside a request
  // context. If Supabase isn't reachable (e.g. placeholder env in a local
  // build), fall back to the static routes rather than failing the build.
  let live: { id: string; slug: string; updated_at: string | null; location_id: string | null }[] = []
  let supabase: ReturnType<typeof createClient> | null = null
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // Live caterer pages (active or trialling — matches what actually renders)
    const { data: caterers } = await supabase
      .from('caterers')
      .select('id, slug, updated_at, location_id')
      .in('subscription_status', ['active', 'trialling'])
    live = (caterers as any) || []
  } catch {
    return [...staticRoutes, ...guideRoutes]
  }

  const catererRoutes: MetadataRoute.Sitemap = live.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Location pages — only those with at least one live caterer (avoids thin pages)
  const liveLocationIds = Array.from(new Set(live.map((c) => c.location_id).filter(Boolean)))
  let locationRoutes: MetadataRoute.Sitemap = []
  let comboRoutes: MetadataRoute.Sitemap = []

  if (liveLocationIds.length && supabase) {
    const [locationsRes, catererCuisinesRes] = await Promise.all([
      supabase.from('locations').select('id, slug').in('id', liveLocationIds),
      supabase.from('caterer_cuisines').select('caterer_id, cuisine:cuisines(slug)'),
    ])
    const locations = (locationsRes.data || []) as { id: string; slug: string }[]
    const catererCuisines = (catererCuisinesRes.data || []) as any[]

    locationRoutes = locations.map((l) => ({
      url: `${SITE_URL}/directory/${l.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    }))

    // Location + cuisine combos with at least one live caterer
    const locIdByCaterer = new Map(live.map((c) => [c.id, c.location_id]))
    const locSlugById = new Map(locations.map((l) => [l.id, l.slug]))
    const combos = new Set<string>()
    for (const cc of catererCuisines) {
      const locId = locIdByCaterer.get(cc.caterer_id)
      const locSlug = locId ? locSlugById.get(locId) : undefined
      if (locSlug && cc.cuisine?.slug) combos.add(`${locSlug}/${cc.cuisine.slug}`)
    }
    comboRoutes = Array.from(combos).map((path) => ({
      url: `${SITE_URL}/directory/${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  }

  return [...staticRoutes, ...guideRoutes, ...catererRoutes, ...locationRoutes, ...comboRoutes]
}
