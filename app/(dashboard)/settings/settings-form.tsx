'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import SubscribeButton from './subscribe-button'
import { toast } from '@/lib/utils/use-toast'
import { Cuisine, EventType, DietaryOption, Location } from '@/types'

interface Props {
  caterererId: string
  caterer: any
  locations: Location[]
  cuisines: Cuisine[]
  eventTypes: EventType[]
  dietaryOptions: DietaryOption[]
}

export default function SettingsForm({ caterererId, caterer, locations, cuisines, eventTypes, dietaryOptions }: Props) {
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    business_name: caterer?.business_name || '',
    phone: caterer?.phone || '',
    location_id: caterer?.location_id || '',
    show_contact_publicly: caterer?.show_contact_publicly ?? true,
    business_mode: caterer?.business_mode || 'full',
  })

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    caterer?.caterer_cuisines?.map((c: any) => c.cuisine_id) || []
  )
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    caterer?.caterer_event_types?.map((e: any) => e.event_type_id) || []
  )
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    caterer?.caterer_dietary_options?.map((d: any) => d.dietary_option_id) || []
  )

  function toggleItem(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])
  }

  async function saveProfile() {
    setSaving(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from('caterers').update(profile).eq('id', caterererId)
      if (error) throw error

      // Update cuisines
      await supabase.from('caterer_cuisines').delete().eq('caterer_id', caterererId)
      if (selectedCuisines.length) {
        await supabase.from('caterer_cuisines').insert(
          selectedCuisines.map((id) => ({ caterer_id: caterererId, cuisine_id: id }))
        )
      }

      // Update event types
      await supabase.from('caterer_event_types').delete().eq('caterer_id', caterererId)
      if (selectedEvents.length) {
        await supabase.from('caterer_event_types').insert(
          selectedEvents.map((id) => ({ caterer_id: caterererId, event_type_id: id }))
        )
      }

      // Update dietary options
      await supabase.from('caterer_dietary_options').delete().eq('caterer_id', caterererId)
      if (selectedDietary.length) {
        await supabase.from('caterer_dietary_options').insert(
          selectedDietary.map((id) => ({ caterer_id: caterererId, dietary_option_id: id }))
        )
      }

      toast({ title: 'Settings saved!', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList className="flex-wrap">
        <TabsTrigger value="profile">Business Profile</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="contact">Contact Methods</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Business name</Label>
              <Input className="mt-1" value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} />
            </div>
            <div>
              <Label>Phone number</Label>
              <Input className="mt-1" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+44 7700 000000" />
            </div>
            <div>
              <Label>Location (city/town)</Label>
              <Select value={profile.location_id} onValueChange={(v) => setProfile({ ...profile, location_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select your location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}, {loc.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Business mode</Label>
              <p className="text-xs text-gray-500 mb-2">Controls which order options customers see on your public page.</p>
              <div className="space-y-2">
                {[
                  { value: 'full', label: 'Full service', desc: 'Show both "Order items" and "Request a catering quote"' },
                  { value: 'catering_only', label: 'Catering inquiries only', desc: 'Hide item ordering — only show quote requests' },
                  { value: 'items_only', label: 'Items only', desc: 'Hide quote requests — only show item ordering' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="business_mode"
                      value={opt.value}
                      checked={profile.business_mode === opt.value}
                      onChange={() => setProfile({ ...profile, business_mode: opt.value })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Cuisine Types</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cuisines.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedCuisines.includes(c.id)} onChange={() => toggleItem(selectedCuisines, setSelectedCuisines, c.id)} className="rounded" />
                    <span className="text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Event Types</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {eventTypes.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedEvents.includes(e.id)} onChange={() => toggleItem(selectedEvents, setSelectedEvents, e.id)} className="rounded" />
                    <span className="text-sm">{e.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Dietary Options</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dietaryOptions.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedDietary.includes(d.id)} onChange={() => toggleItem(selectedDietary, setSelectedDietary, d.id)} className="rounded" />
                    <span className="text-sm">{d.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Categories'}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="contact">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Show contact info publicly</p>
                <p className="text-sm text-gray-500">Display your phone and email on your public site</p>
              </div>
              <button
                onClick={() => setProfile({ ...profile, show_contact_publicly: !profile.show_contact_publicly })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.show_contact_publicly ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.show_contact_publicly ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="mt-4">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium capitalize">{caterer?.subscription_status || 'Not active'}</span>
              </div>
              {caterer?.trial_ends_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trial ends</span>
                  <span className="font-medium">{new Date(caterer.trial_ends_at).toLocaleDateString('en-GB')}</span>
                </div>
              )}
              {caterer?.subscription_ends_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing period ends</span>
                  <span className="font-medium">{new Date(caterer.subscription_ends_at).toLocaleDateString('en-GB')}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200">
                {(!caterer?.stripe_customer_id || ['cancelled', 'past_due'].includes(caterer?.subscription_status)) ? (
                  <>
                    <p className="text-sm text-gray-500 mb-3">
                      {caterer?.subscription_status === 'past_due'
                        ? 'Your payment failed. Please subscribe to restore your site.'
                        : 'Subscribe to keep your site live after your trial ends.'}
                    </p>
                    <SubscribeButton />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-3">Manage your subscription or update payment details via the Stripe Customer Portal.</p>
                    <Button variant="outline" asChild>
                      <a href="/api/stripe/portal">Manage Billing</a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
