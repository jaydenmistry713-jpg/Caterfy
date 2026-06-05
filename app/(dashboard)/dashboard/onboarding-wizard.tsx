'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  caterererId: string
  businessName: string
  locations: { id: string; name: string }[]
  cuisines: { id: string; name: string }[]
  eventTypes: { id: string; name: string }[]
}

const STEPS = [
  { title: "What's your business phone number?", subtitle: 'Customers can use this to contact you directly.' },
  { title: 'Where are you based?', subtitle: 'This helps customers find you in the directory.' },
  { title: 'What cuisines do you offer?', subtitle: 'Select everything that applies.' },
  { title: 'What events do you cater for?', subtitle: 'Select everything that applies.' },
]

export default function OnboardingWizard({ caterererId, businessName, locations, cuisines, eventTypes }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [saving, setSaving] = useState(false)

  const [phone, setPhone] = useState('')
  const [locationId, setLocationId] = useState('')
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  function transition(cb: () => void) {
    setVisible(false)
    setTimeout(() => { cb(); setVisible(true) }, 240)
  }

  function advance() {
    if (step < STEPS.length - 1) {
      transition(() => setStep((s) => s + 1))
    } else {
      handleFinish()
    }
  }

  function toggleChip(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])
  }

  async function handleFinish() {
    setSaving(true)
    const supabase = createClient()
    const updates: Record<string, any> = {}
    if (phone.trim()) updates.phone = phone.trim()
    if (locationId) updates.location_id = locationId

    if (Object.keys(updates).length > 0) {
      await supabase.from('caterers').update(updates).eq('id', caterererId)
    }
    if (selectedCuisines.length > 0) {
      await supabase.from('caterer_cuisines').delete().eq('caterer_id', caterererId)
      await supabase.from('caterer_cuisines').insert(selectedCuisines.map((id) => ({ caterer_id: caterererId, cuisine_id: id })))
    }
    if (selectedEvents.length > 0) {
      await supabase.from('caterer_event_types').delete().eq('caterer_id', caterererId)
      await supabase.from('caterer_event_types').insert(selectedEvents.map((id) => ({ caterer_id: caterererId, event_type_id: id })))
    }

    router.replace('/dashboard')
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <p className="font-bold text-lg text-gray-900">Caterfy</p>
      </div>
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.replace('/dashboard')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip setup
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-14">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step ? 'w-6 h-2 bg-gray-900' : i < step ? 'w-2 h-2 bg-gray-400' : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question content — fades in/out */}
      <div
        className={`transition-all duration-[240ms] max-w-lg w-full text-center ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-sm text-gray-400 mb-3 font-medium">{step + 1} of {STEPS.length}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{STEPS[step].title}</h2>
        <p className="text-gray-500 mb-8 text-sm">{STEPS[step].subtitle}</p>

        {step === 0 && (
          <Input
            type="tel"
            placeholder="e.g. 07700 000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-center text-base h-12 max-w-xs mx-auto"
            autoFocus
          />
        )}

        {step === 1 && (
          <div className="max-w-xs mx-auto">
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select your location..." /></SelectTrigger>
              <SelectContent className="max-h-64">
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {cuisines.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleChip(selectedCuisines, setSelectedCuisines, c.id)}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  selectedCuisines.includes(c.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() =>
                selectedEvents.length === eventTypes.length
                  ? setSelectedEvents([])
                  : setSelectedEvents(eventTypes.map((e) => e.id))
              }
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                selectedEvents.length === eventTypes.length
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
              }`}
            >
              All events
            </button>
            {eventTypes.map((e) => (
              <button
                key={e.id}
                onClick={() => toggleChip(selectedEvents, setSelectedEvents, e.id)}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  selectedEvents.includes(e.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={advance}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            {isLast ? 'Skip & finish' : 'Skip'}
          </button>
          <Button onClick={advance} disabled={saving} size="lg">
            {saving ? 'Saving...' : isLast ? 'Finish' : 'Continue →'}
          </Button>
        </div>
      </div>

      {/* Bottom hint */}
      <p className="absolute bottom-8 text-xs text-gray-300">You can update all of this later in Settings</p>
    </div>
  )
}
