import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SiteEditorForm from './site-editor-form'

export default async function SiteEditorPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [catererRes, pageRes] = await Promise.all([
    supabase.from('caterers').select('*').eq('id', user.id).single(),
    supabase.from('caterer_pages').select('*').eq('caterer_id', user.id).single(),
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
      />
    </div>
  )
}
