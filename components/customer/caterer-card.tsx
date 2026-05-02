import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { Caterer } from '@/types'

interface Props {
  caterer: any
}

export default function CatererCard({ caterer }: Props) {
  const page = caterer.page
  const location = caterer.location
  const cuisines = caterer.caterer_cuisines?.map((c: any) => c.cuisine?.name).filter(Boolean) || []

  return (
    <Link
      href={`/${caterer.slug}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[16/9] bg-gray-100">
        {page?.hero_image_url ? (
          <Image
            src={page.hero_image_url}
            alt={caterer.business_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-4xl font-bold">
            {caterer.business_name[0]}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{caterer.business_name}</h3>

        {page?.tagline && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">{page.tagline}</p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {location.name}
            </span>
          )}
          {caterer.avg_rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              {caterer.avg_rating.toFixed(1)}
              <span className="text-gray-400">({caterer.review_count})</span>
            </span>
          )}
        </div>

        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {cuisines.slice(0, 3).map((c: string) => (
              <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
