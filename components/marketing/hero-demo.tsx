'use client'

import { useState } from 'react'
import { slugify } from '@/lib/utils'

// The four real site editor templates, using accent colours from the
// editor's preset palette.
const THEMES = [
  {
    id: 'classic',
    name: 'Classic',
    bg: '#FFFFFF',
    hero: '#F3F4F6',
    heroText: '#111827',
    card: '#F9FAFB',
    border: 'rgba(17, 24, 39, 0.10)',
    text: '#111827',
    muted: '#6B7280',
    accent: '#2E75B6',
    onAccent: '#FFFFFF',
  },
  {
    id: 'modern',
    name: 'Modern',
    bg: '#FAF6EF',
    hero: '#F0E8DA',
    heroText: '#292524',
    card: '#FFFFFF',
    border: 'rgba(41, 37, 36, 0.12)',
    text: '#292524',
    muted: '#78716C',
    accent: '#d4732a',
    onAccent: '#FFFFFF',
  },
  {
    id: 'bold',
    name: 'Bold',
    bg: '#FFFFFF',
    hero: '#dc2626',
    heroText: '#FEF2F2',
    card: '#FEF2F2',
    border: 'rgba(153, 27, 27, 0.14)',
    text: '#1F2937',
    muted: '#6B7280',
    accent: '#dc2626',
    onAccent: '#FFFFFF',
  },
  {
    id: 'linkpage',
    name: 'Link Page',
    bg: '#111827',
    hero: '#1F2937',
    heroText: '#F9FAFB',
    card: '#1F2937',
    border: 'rgba(247, 242, 231, 0.14)',
    text: '#F9FAFB',
    muted: '#9CA3AF',
    accent: '#b45309',
    onAccent: '#FFFFFF',
  },
]

const MENU = [
  { name: 'Grazing Table', desc: 'Cheeses, charcuterie, seasonal fruit', price: 'from £8.50 pp' },
  { name: 'Buffet Classics', desc: 'Hot mains, salads & sides', price: 'from £12 pp' },
  { name: 'Canapé Evening', desc: '8 canapés per guest, served', price: 'from £18 pp' },
]

export default function HeroDemo() {
  const [theme, setTheme] = useState(THEMES[0])
  const [name, setName] = useState('The Willow Pantry')

  const displayName = name.trim() || 'Your Business'
  const slug = slugify(displayName) || 'your-business'

  return (
    <div className="relative">
      <div className="absolute -top-4 left-5 z-10 mk-pill-tag">Try the site editor</div>

      <div className="mk-browser">
        <div className="mk-browser-bar">
          <span className="mk-browser-dot" />
          <span className="mk-browser-dot" />
          <span className="mk-browser-dot" />
          <span className="mk-browser-url" aria-live="polite">
            caterfy.com/{slug}
          </span>
        </div>

        <div
          className="mk-mini"
          style={
            {
              '--d-bg': theme.bg,
              '--d-hero': theme.hero,
              '--d-hero-text': theme.heroText,
              '--d-card': theme.card,
              '--d-border': theme.border,
              '--d-text': theme.text,
              '--d-muted': theme.muted,
              '--d-accent': theme.accent,
              '--d-on-accent': theme.onAccent,
            } as React.CSSProperties
          }
        >
          {/* Mini site header */}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[13px] font-bold truncate max-w-[55%]">{displayName}</span>
            <span className="mk-mini-muted text-[10px] tracking-wide">Menu · Gallery · Contact</span>
          </div>

          {/* Mini hero */}
          <div className="mk-mini-hero mx-5 rounded-lg px-5 py-6 text-center">
            <p className="text-[17px] font-bold leading-snug">{displayName}</p>
            <p className="text-[11px] mt-1 opacity-75">Seasonal grazing tables &amp; sharing feasts · Bristol</p>
            <span className="mk-mini-btn mt-3">Request a quote</span>
          </div>

          {/* Mini menu */}
          <div className="px-5 py-4 space-y-2">
            <p className="mk-mini-accent text-[10px] font-semibold tracking-[0.14em] uppercase">Sample menus</p>
            {MENU.map((item) => (
              <div key={item.name} className="mk-mini-card flex items-center justify-between gap-3 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">{item.name}</p>
                  <p className="mk-mini-muted text-[10.5px] leading-tight mt-0.5 truncate">{item.desc}</p>
                </div>
                <span className="mk-mini-accent mk-mono text-[10.5px] whitespace-nowrap">{item.price}</span>
              </div>
            ))}
          </div>

          <p className="mk-mini-muted pb-3 text-center text-[9px] tracking-[0.14em] uppercase">Powered by Caterfy</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="mk-demo-name" className="mk-demo-label block mb-2">
            Your business name
          </label>
          <input
            id="mk-demo-name"
            type="text"
            className="mk-demo-input"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your business name"
          />
        </div>

        <div>
          <p className="mk-demo-label mb-2">Template</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a site template">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="mk-swatch"
                aria-pressed={theme.id === t.id}
                aria-label={`Preview the ${t.name} template`}
                onClick={() => setTheme(t)}
              >
                <span className="mk-swatch-dot" style={{ background: t.accent }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
