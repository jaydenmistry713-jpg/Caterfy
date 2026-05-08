import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GalleryManager from './gallery-manager'

export default async function GalleryPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('caterer_id', user.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <p className="text-gray-500 mt-1">Upload 3–20 photos to showcase your food and events</p>
      </div>
      <GalleryManager caterererId={user.id} initialImages={images || []} />
    </div>
  )
}
