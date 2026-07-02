'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { formatPriceUnit } from '@/lib/utils'

interface Props {
  item: any
  variant?: 'classic' | 'modern-card'
  accentColor?: string
}

export default function ExpandableMenuItem({ item, variant = 'classic', accentColor }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasDesc = !!item.description

  if (variant === 'modern-card') {
    return (
      <div
        className={`flex gap-3 p-3 rounded-lg border border-gray-100 ${hasDesc ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={() => hasDesc && setExpanded((v) => !v)}
      >
        {item.image_url && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-gray-900">{item.name}</p>
            {hasDesc && (
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            )}
          </div>
          {expanded && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
          )}
          <p className="text-sm font-semibold mt-1" style={accentColor ? { color: accentColor } : {}}>
            £{Number(item.price).toFixed(2)} {formatPriceUnit(item.price_unit)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex justify-between items-start border-b border-gray-100 pb-3 ${hasDesc ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded transition-colors' : ''}`}
      onClick={() => hasDesc && setExpanded((v) => !v)}
    >
      <div className="flex gap-3 flex-1">
        {item.image_url && (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-gray-900">{item.name}</p>
            {hasDesc && (
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            )}
          </div>
          {expanded && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>
      <p className="font-semibold text-gray-900 ml-4 flex-shrink-0">
        £{Number(item.price).toFixed(2)}
        {formatPriceUnit(item.price_unit) && (
          <span className="text-xs text-gray-400 font-normal"> {formatPriceUnit(item.price_unit)}</span>
        )}
      </p>
    </div>
  )
}
