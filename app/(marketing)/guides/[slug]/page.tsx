import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { GUIDES, getGuide } from '@/lib/guides'
import { SITE_URL } from '@/lib/site'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return { title: 'Not Found' }
  return {
    title: `${guide.title} — Caterfy`,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, type: 'article' },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updated,
    author: { '@type': 'Organization', name: 'Caterfy', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Caterfy', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--ink-soft)' }}>
        <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
        All guides
      </Link>

      <p className="mk-eyebrow mt-8">
        {guide.audience === 'caterer' ? 'For caterers' : 'For customers'} · {guide.minutes} min read
      </p>
      <h1 className="mk-display mt-4 text-3xl sm:text-[2.6rem] leading-tight">{guide.title}</h1>
      <p className="mt-4 text-lg" style={{ color: 'var(--ink-soft)' }}>{guide.description}</p>

      <div className="mt-10 space-y-10">
        {guide.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mk-display text-2xl" style={{ color: 'var(--ink)' }}>{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3.5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{p}</p>
            ))}
            {s.bullets && (
              <ul className="mt-4 space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3" style={{ color: 'var(--ink)' }}>
                    <Check className="h-4 w-4 mt-1.5 flex-shrink-0" strokeWidth={2} style={{ color: 'var(--marigold-deep)' }} />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-14 mk-card p-8 text-center">
        <h2 className="mk-display text-2xl" style={{ color: 'var(--ink)' }}>
          Put your catering business on one page
        </h2>
        <p className="mt-2 max-w-md mx-auto text-[15px]" style={{ color: 'var(--ink-soft)' }}>
          Orders, quotes, invoices and payments included. £10/month flat, no commission.
        </p>
        <Link href="/signup" className="mk-btn mk-btn-gold mt-6">
          Start your free trial
          <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
        </Link>
        <p className="mk-mono mt-4 text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--ink-soft)' }}>
          14 days free · No card required
        </p>
      </div>
    </article>
  )
}
