'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/directory', label: 'Browse caterers' },
]

export default function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="mk-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="mk-display text-2xl" style={{ color: 'var(--ink)' }}>
            Caterfy
          </Link>

          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="mk-nav-link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/login" className="mk-nav-link">
              Sign in
            </Link>
            <Link href="/signup" className="mk-btn mk-btn-basil mk-btn-sm">
              Start free trial
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.7} /> : <Menu className="h-5 w-5" strokeWidth={1.7} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 flex flex-col gap-4" style={{ borderTop: '1px solid var(--border-light)' }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="mk-nav-link" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="mk-nav-link" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link href="/signup" className="mk-btn mk-btn-basil mk-btn-sm w-fit" onClick={() => setOpen(false)}>
              Start free trial
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
