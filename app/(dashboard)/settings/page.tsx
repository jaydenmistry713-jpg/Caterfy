import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const [catererRes, locationsRes, cuisinesRes, eventTypesRes, dietaryRes] = await Promise.all([
    supabase.from('caterers').select(`
      *,
      caterer_cuisines(cuisine_id),
      caterer_event_types(event_type_id),
      caterer_dietary_options(dietary_option_id)
    `).eq('id', user.id).single(),
    supabase.from('locations').select('*').order('name'),
    supabase.from('cuisines').select('*').order('name'),
    supabase.from('event_types').select('*').order('name'),
    supabase.from('dietary_options').select('*').order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and business profile</p>
      </div>
      <SettingsForm
        caterererId={user.id}
        caterer={catererRes.data}
        locations={locationsRes.data || []}
        cuisines={cuisinesRes.data || []}
        eventTypes={eventTypesRes.data || []}
        dietaryOptions={dietaryRes.data || []}
      />
    </div>
  )
}
