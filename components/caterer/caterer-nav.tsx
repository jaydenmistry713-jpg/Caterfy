'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface Props {
  businessName: string
  logoUrl?: string
  primaryColor: string
  sections: { id: string; label: string }[]
}

export default function CatererNav({ businessName, logoUrl, primaryColor, sections }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-xl font-bold" style={{ color: primaryColor }}>
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="h-10 object-contain" />
            ) : (
              businessName
            )}
          </a>

          <div className="hidden md:flex items-center gap-6">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm text-gray-600"
                onClick={() => setOpen(false)}
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
