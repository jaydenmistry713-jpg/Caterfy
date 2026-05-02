'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Cuisine, EventType, DietaryOption } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  cuisines: Cuisine[]
  eventTypes: EventType[]
  dietaryOptions: DietaryOption[]
}

export default function DirectoryFilters({ cuisines, eventTypes, dietaryOptions }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
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
    router.push(`/directory?${params.toString()}`)
  }

  function clearFilters() {
    setSelectedCuisines([])
    setSelectedEventTypes([])
    setSelectedDietary([])
    setMinRating(0)
    router.push('/directory')
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

      <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
    </div>
  )
}
