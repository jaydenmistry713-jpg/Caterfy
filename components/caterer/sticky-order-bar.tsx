'use client'

import { ShoppingBag, Phone } from 'lucide-react'

interface Props {
  accentColor: string
  phone?: string | null
  showPhone?: boolean
}

// Fixed bottom bar with quick actions, shown on Classic/Modern/Bold when the
// caterer enables it (Link Page has its own built-in version). "Order now"
// smooth-scrolls to the page's #order section.
export default function StickyOrderBar({ accentColor, phone, showPhone }: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-2.5 flex gap-2 sm:hidden">
      <a
        href="#order"
        className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-white text-sm font-semibold"
        style={{ backgroundColor: accentColor }}
      >
        <ShoppingBag className="h-4 w-4" />
        Order now
      </a>
      {showPhone && phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 rounded-full py-2.5 px-5 border border-gray-300 text-gray-800 text-sm font-semibold"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
      )}
    </div>
  )
}
