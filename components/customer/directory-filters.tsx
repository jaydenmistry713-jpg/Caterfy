'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Cuisine, EventType, DietaryOption } from '@/types'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface LocationOption { id: string; name: string; slug: string }

interface Props {
  cuisines: Cuisine[]
  eventTypes: EventType[]
  dietaryOptions: DietaryOption[]
  locations?: LocationOption[]
}

export default function DirectoryFilters({ cuisines, eventTypes, dietaryOptions, locations = [] }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const fromParam = (key: string) => {
    const v = searchParams.get(key)
    return v ? v.split(',').filter(Boolean) : []
  }

  // Seed from the URL so the sidebar reflects the currently-applied filters.
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(() => fromParam('cuisines'))
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(() => fromParam('events'))
  const [selectedDietary, setSelectedDietary] = useState<string[]>(() => fromParam('dietary'))
  const [minRating, setMinRating] = useState<number>(() => Number(searchParams.get('rating') || 0))
  const [location, setLocation] = useState<string>(() => searchParams.get('location') || '')
  const [showAll, setShowAll] = useState({ cuisines: false, events: false, dietary: false })

  function toggleItem(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])
  }

  function applyFilters() {
    const params = new URLSearchParams()
    if (selectedCuisines.length) params.set('cuisines', selectedCuisines.join(','))
    if (selectedEventTypes.length) params.set('events', selectedEventTypes.join(','))
    if (selectedDietary.length) params.set('dietary', selectedDietary.join(','))
    if (minRating > 0) params.set('rating', String(minRating))
    if (location) params.set('location', location)
    startTransition(() => router.push(`/directory?${params.toString()}`))
  }

  function clearFilters() {
    setSelectedCuisines([])
    setSelectedEventTypes([])
    setSelectedDietary([])
    setMinRating(0)
    setLocation('')
    startTransition(() => router.push('/directory'))
  }

  const FilterSection = ({
    title,
    items,
    selected,
    onToggle,
    showKey,
  }: {
    title: string
    items: { id: string; name: string }[]
    selected: string[]
    onToggle: (id: string) => void
    showKey: 'cuisines' | 'events' | 'dietary'
  }) => {
    const displayItems = showAll[showKey] ? items : items.slice(0, 6)
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{title}</h4>
        <div className="space-y-2">
          {displayItems.map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{item.name}</span>
            </label>
          ))}
        </div>
        {items.length > 6 && (
          <button
            onClick={() => setShowAll((prev) => ({ ...prev, [showKey]: !prev[showKey] }))}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2 flex items-center gap-1"
          >
            {showAll[showKey] ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show all {items.length}</>}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700">
          Clear all
        </button>
      </div>

      {locations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Location</h4>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Anywhere</option>
            {locations.map((l) => (
              <option key={l.id} value={l.slug}>{l.name}</option>
            ))}
          </select>
        </div>
      )}

      <FilterSection
        title="Cuisine"
        items={cuisines}
        selected={selectedCuisines}
        onToggle={(id) => toggleItem(selectedCuisines, setSelectedCuisines, id)}
        showKey="cuisines"
      />

      <FilterSection
        title="Event Type"
        items={eventTypes}
        selected={selectedEventTypes}
        onToggle={(id) => toggleItem(selectedEventTypes, setSelectedEventTypes, id)}
        showKey="events"
      />

      <FilterSection
        title="Dietary Options"
        items={dietaryOptions}
        selected={selectedDietary}
        onToggle={(id) => toggleItem(selectedDietary, setSelectedDietary, id)}
        showKey="dietary"
      />

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Min. Rating</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                minRating === r
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-600 hover:border-gray-900'
              }`}
            >
              {r === 0 ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={applyFilters} className="w-full" disabled={isPending}>
        {isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Applying…</> : 'Apply Filters'}
      </Button>
    </div>
  )
}
