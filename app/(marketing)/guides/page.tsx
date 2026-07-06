import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Guides for caterers — Caterfy',
  description:
    'Practical guides for independent caterers: starting a food business in the UK, taking orders online, pricing, hygiene ratings and more.',
  alternates: { canonical: '/guides' },
}

export default function GuidesIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
      <p className="mk-eyebrow">Guides</p>
      <h1 className="mk-display mt-4 text-3xl sm:text-5xl">
        Practical guides for independent caterers
      </h1>
      <p className="mt-4 max-w-xl" style={{ color: 'var(--ink-soft)' }}>
        No fluff — the registration, pricing and order-taking questions caterers
        actually ask, answered properly.
      </p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="mk-card block p-7 no-underline">
            <p className="mk-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: 'var(--marigold-deep)' }}>
              {g.audience === 'caterer' ? 'For caterers' : 'For customers'} · {g.minutes} min read
            </p>
            <h2 className="mt-3 text-xl font-bold leading-snug" style={{ color: 'var(--ink)' }}>
              {g.title}
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              {g.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--basil)' }}>
              Read guide <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 mk-card p-8 text-center">
        <h2 className="mk-display text-2xl" style={{ color: 'var(--ink)' }}>
          Ready to take orders properly?
        </h2>
        <p className="mt-2 max-w-md mx-auto text-[15px]" style={{ color: 'var(--ink-soft)' }}>
          Your menu, orders, quotes, invoices and payments on one page — £10/month, no commission.
        </p>
        <Link href="/signup" className="mk-btn mk-btn-gold mt-6">
          Start your free trial
          <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
        </Link>
        <p className="mk-mono mt-4 text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--ink-soft)' }}>
          14 days free · No card required
        </p>
      </div>
    </div>
  )
}
