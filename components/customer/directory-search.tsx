'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DirectorySearch() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [cuisine, setCuisine] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const loc = location.trim().toLowerCase().replace(/\s+/g, '-')
    const cui = cuisine.trim().toLowerCase().replace(/\s+/g, '-')

    if (loc && cui) router.push(`/directory/${loc}/${cui}`)
    else if (loc) router.push(`/directory/${loc}`)
    else if (cui) router.push(`/directory/${cui}`)
    else router.push('/directory')
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="City or town..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-9 h-12 bg-white text-gray-900 border-0 shadow-lg"
        />
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cuisine type..."
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="pl-9 h-12 bg-white text-gray-900 border-0 shadow-lg"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
        Search
      </Button>
    </form>
  )
}
