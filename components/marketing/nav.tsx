'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Caterfy
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/directory" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Browse Caterers
            </Link>
            <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Start free trial</Link>
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-4">
            <Link href="/directory" className="text-sm text-gray-600" onClick={() => setOpen(false)}>Browse Caterers</Link>
            <Link href="/#how-it-works" className="text-sm text-gray-600" onClick={() => setOpen(false)}>How It Works</Link>
            <Link href="/#pricing" className="text-sm text-gray-600" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/login" className="text-sm text-gray-600" onClick={() => setOpen(false)}>Log in</Link>
            <Button asChild size="sm" className="w-fit">
              <Link href="/signup" onClick={() => setOpen(false)}>Start free trial</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
