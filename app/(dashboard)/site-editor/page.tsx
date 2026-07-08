import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SiteEditorForm from './site-editor-form'

export default async function SiteEditorPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [catererRes, pageRes, menuRes, packagesRes, galleryRes, reviewsRes] = await Promise.all([
    supabase.from('caterers').select(`
      *,
      location:locations(*),
      caterer_cuisines(cuisine:cuisines(*)),
      caterer_event_types(event_type:event_types(*)),
      caterer_dietary_options(dietary_option:dietary_options(*))
    `).eq('id', user.id).single(),
    supabase.from('caterer_pages').select('*').eq('caterer_id', user.id).single(),
    supabase.from('menu_items').select('*').eq('caterer_id', user.id).eq('is_available', true).order('sort_order'),
    supabase.from('packages').select('*').eq('caterer_id', user.id).eq('is_available', true).order('sort_order'),
    supabase.from('gallery_images').select('*').eq('caterer_id', user.id).order('sort_order'),
    supabase.from('reviews').select('*').eq('caterer_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Editor</h1>
        <p className="text-gray-500 mt-1">Customise your website template, branding, and content</p>
      </div>
      <SiteEditorForm
        caterererId={user.id}
        caterer={catererRes.data}
        page={pageRes.data}
        menuItems={menuRes.data || []}
        packages={packagesRes.data || []}
        gallery={galleryRes.data || []}
        reviews={reviewsRes.data || []}
      />
    </div>
  )
}
