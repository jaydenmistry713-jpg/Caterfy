import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CatererPageClassic from '@/components/caterer/template-classic'
import CatererPageModern from '@/components/caterer/template-modern'
import CatererPageBold from '@/components/caterer/template-bold'
import CatererPageLinkPage from '@/components/caterer/template-linkpage'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: caterer } = await supabase
    .from('caterers')
    .select('business_name, page:caterer_pages(tagline)')
    .eq('slug', slug)
    .single()

  if (!caterer) return { title: 'Not Found' }

  return {
    title: `${caterer.business_name} — Caterfy`,
    description: (caterer as any).page?.tagline || `Professional catering by ${caterer.business_name}`,
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

  if (!caterer || !['active', 'trialling'].includes(caterer.subscription_status || '')) {
    notFound()
  }

  const [menuItemsRes, packagesRes, galleryRes, reviewsRes] = await Promise.all([
    supabase.from('menu_items').select('*').eq('caterer_id', caterer.id).eq('is_available', true).order('sort_order'),
    supabase.from('packages').select('*').eq('caterer_id', caterer.id).eq('is_available', true).order('sort_order'),
    supabase.from('gallery_images').select('*').eq('caterer_id', caterer.id).order('sort_order'),
    supabase.from('reviews').select('*').eq('caterer_id', caterer.id).order('created_at', { ascending: false }),
  ])

  const data = {
    caterer,
    menuItems: menuItemsRes.data || [],
    packages: packagesRes.data || [],
    gallery: galleryRes.data || [],
    reviews: reviewsRes.data || [],
  }

  const template = caterer.page?.template || 'classic'

  // Load the caterer's selected Google Fonts so heading/body font choices actually render.
  const fonts = Array.from(new Set([caterer.page?.heading_font, caterer.page?.body_font].filter(Boolean)))
  const fontHref = fonts.length
    ? `https://fonts.googleapis.com/css2?${fonts.map((f: string) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&')}&display=swap`
    : null

  const page =
    template === 'modern' ? <CatererPageModern {...data} /> :
    template === 'bold' ? <CatererPageBold {...data} /> :
    template === 'linkpage' ? <CatererPageLinkPage {...data} /> :
    <CatererPageClassic {...data} />

  return (
    <>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      {page}
    </>
  )
}
