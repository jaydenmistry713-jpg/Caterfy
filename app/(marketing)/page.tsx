import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import HeroDemo from '@/components/marketing/hero-demo'
import {
  SiteSnapshot, OrdersSnapshot, PaymentsSnapshot, GrowthSnapshot,
} from '@/components/marketing/feature-snapshots'
import Reveal from '@/components/marketing/reveal'
import CountUp from '@/components/marketing/count-up'

// Category words, not business names — reads as "that's me", with zero
// fake-social-proof risk. Swap for real founding-member names later.
const TRUST_CATEGORIES = [
  'Weddings', 'Grazing tables', 'Corporate lunches', 'Buffets', 'Private chefs',
  'Street food', 'Afternoon tea', 'Home bakers', 'Hog roasts', 'Party platters',
]

// The full feature set, chunked into the four jobs a caterer hires Caterfy
// for. Same facts as the old 11-card grid, ~60% less reading. Each card leads
// with a CSS-built snapshot of the real product UI (feature-snapshots.tsx).
const CLUSTERS = [
  {
    Visual: SiteSnapshot,
    eyebrow: 'Look professional',
    title: 'Your own catering website',
    bullets: [
      '4 templates, your colours, your photos — live at caterfy.com/your-name',
      'Proper menus with categories, packages & per-person pricing — not screenshots',
      'Gallery, reviews and an order form built in',
      'No designer, no code, no £800 invoice',
    ],
  },
  {
    Visual: OrdersSnapshot,
    eyebrow: 'Take orders',
    title: 'All your orders & quotes in one dashboard',
    bullets: [
      'Fixed-price orders and quote requests in one dashboard',
      'Send itemised quotes customers accept online — no chasing',
      'Block out dates you can’t cater; the order form enforces them',
      'Accept or decline in a click — the customer is emailed automatically',
    ],
  },
  {
    Visual: PaymentsSnapshot,
    eyebrow: 'Get paid',
    title: 'Collect payments however you like',
    bullets: [
      'Card payments straight to your bank via Stripe',
      'Bank transfer or pay-on-the-day — your call',
      'Invoices generated from any order, sent by email',
      'Discount codes with expiry dates and usage caps',
    ],
  },
  {
    Visual: GrowthSnapshot,
    eyebrow: 'Get found',
    title: 'Automatic reviews, emails & a directory listing',
    bullets: [
      'Listed in the Caterfy directory by location & cuisine',
      'Review requests sent after every event — reply from your dashboard',
      'Confirmations, acceptances and reminders sent while you cook',
    ],
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Pick a template',
    copy: 'Choose Classic, Modern, Bold or Link Page, set your accent colour, and claim caterfy.com/your-name. No designer, no code.',
  },
  {
    num: '02',
    title: 'Add your menu',
    copy: 'Items, packages and from-prices — with photos, categories, dietary info and stock limits if you need them.',
  },
  {
    num: '03',
    title: 'Share your link',
    copy: 'Take orders and quote requests the same day. Get paid by card, bank transfer, or on the day — your call.',
  },
]

const PLAN_FEATURES = [
  'Professional website — 4 templates',
  'Orders & quote requests',
  'Invoices & discount codes',
  'Card, bank transfer & pay-later payments',
  'Directory listing by location & cuisine',
  'Reviews, gallery & analytics',
  'Automated customer emails',
]

// Objection-handling at the point of decision. Content mirrors /faq.
const LANDING_FAQS = [
  {
    q: 'Do I need a card to try it?',
    a: 'No. The 14-day trial is completely free and we don’t ask for payment details. Subscribe only if you want to keep your site after the trial.',
  },
  {
    q: 'Do you take commission on my orders?',
    a: 'Never. Your customers pay you directly. Caterfy is a flat £10/month, whatever you sell.',
  },
  {
    q: 'Can customers pay me by bank transfer or cash?',
    a: 'Yes. You choose which payment options to offer: card (via your own Stripe account), bank transfer with your details shown at checkout, or pay-on-the-day.',
  },
  {
    q: 'What happens after the trial?',
    a: '£10/month, cancel anytime from your dashboard. If you cancel or lapse, your data is kept safe and you can pick up where you left off.',
  },
  {
    q: 'Do I need any tech skills?',
    a: 'If you can post on Instagram, you can build this. Pick a template, type your menu, upload photos — the wizard walks you through it.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          <div>
            <p className="mk-eyebrow mk-enter mk-enter-1">For independent caterers</p>
            <h1 className="mk-display mk-enter mk-enter-2 mt-5 text-[2.6rem] sm:text-6xl lg:text-[4.2rem]">
              Less admin,<br />
              more <em style={{ color: 'var(--tomato)' }}>catering</em>.
            </h1>
            <p className="mk-enter mk-enter-3 mt-6 text-lg max-w-xl" style={{ color: 'var(--ink-soft)' }}>
              Orders buried in your DMs. Invoices in your notes app. Menus sent as
              screenshots. Caterfy puts your whole business on one professional page —
              orders, quotes, invoices and payments included.
            </p>
            <div className="mk-enter mk-enter-4 mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="mk-btn mk-btn-gold">
                Start your free trial
                <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
              </Link>
              <Link href="/#how-it-works" className="mk-btn mk-btn-ghost">
                See how it works
              </Link>
            </div>
            <p className="mk-mono mk-enter mk-enter-5 mt-6 text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--ink-soft)' }}>
              14-day free trial &middot; No card required &middot; Cancel anytime
            </p>
          </div>

          <div className="mk-enter mk-enter-4 lg:pl-4">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* ---------- Trust strip (categories, not invented names) ---------- */}
      <section className="py-12" style={{ background: 'var(--basil)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mk-mono text-center text-[10px] tracking-[0.22em] uppercase mb-7" style={{ color: 'var(--cream)', opacity: 0.55 }}>
            Built for independent food businesses of every kind
          </p>
        </div>
        <div className="mk-marquee" aria-hidden="true">
          <div className="mk-marquee-track">
            {[...TRUST_CATEGORIES, ...TRUST_CATEGORIES].map((name, i) => (
              <span key={i} className="mk-display text-2xl whitespace-nowrap" style={{ color: 'var(--cream)', opacity: 0.62 }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features: 4 job clusters ---------- */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 lg:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="mk-eyebrow">Everything in one place</p>
            <h2 className="mk-display mt-4 text-3xl sm:text-5xl max-w-2xl">
              Stop stitching together six different apps.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {CLUSTERS.map((c, i) => (
              <Reveal key={c.eyebrow} delay={(i % 2) * 90}>
                <div className="mk-card h-full p-4 sm:p-5">
                  <c.Visual />
                  <div className="px-2 pt-6 pb-3 sm:px-3">
                    <p className="mk-eyebrow">{c.eyebrow}</p>
                    <h3 className="mt-4 text-2xl font-bold leading-snug">{c.title}</h3>
                    <ul className="mt-5 space-y-3">
                      {c.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                          <Check className="h-4 w-4 mt-1 flex-shrink-0" strokeWidth={2} style={{ color: 'var(--marigold-deep)' }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-8 text-center text-sm" style={{ color: 'var(--ink-soft)' }}>
              Plus stock limits, food-certification badges, a contact form, order tracking and more —{' '}
              <Link href="/faq" className="underline font-medium" style={{ color: 'var(--ink)' }}>
                see everything included
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 lg:py-28 scroll-mt-16" style={{ background: 'var(--basil)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="mk-eyebrow mk-eyebrow-dark">How it works</p>
            <h2 className="mk-display mt-4 text-3xl sm:text-5xl max-w-2xl" style={{ color: 'var(--cream)' }}>
              Live before your next event.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 90}>
                <div className="mk-card-dark h-full p-8">
                  <p className="mk-mono text-sm" style={{ color: 'var(--marigold)' }}>
                    {step.num}
                  </p>
                  <h3 className="mt-4 text-xl font-bold" style={{ color: 'var(--cream)' }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--cream)', opacity: 0.72 }}>
                    {step.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-20 lg:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center">
            <p className="mk-eyebrow justify-center">Simple pricing</p>
            <h2 className="mk-display mt-4 text-3xl sm:text-5xl">One plan. Everything included.</h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ color: 'var(--ink-soft)' }}>
              No tiers, no add-ons, no commission on your orders. A web designer charges
              &pound;500+ once. Squarespace is &pound;17/month and doesn&rsquo;t take orders.
              Caterfy is &pound;10, flat.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div
              className="mt-12 max-w-lg mx-auto p-8 sm:p-10"
              style={{ background: 'var(--basil)', borderRadius: 24, border: '1px solid var(--border-dark)' }}
            >
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <p className="mk-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--marigold)' }}>
                    Caterfy
                  </p>
                  <p className="mk-display mt-2 text-6xl" style={{ color: 'var(--cream)' }}>
                    &pound;10
                    <span className="mk-mono text-base align-baseline" style={{ opacity: 0.6 }}> /month</span>
                  </p>
                </div>
                <p className="mk-mono text-[10px] tracking-[0.18em] uppercase pb-2" style={{ color: 'var(--cream)', opacity: 0.55 }}>
                  $12/month in the US
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px]" style={{ color: 'var(--cream)' }}>
                    <Check className="h-4 w-4 mt-1 flex-shrink-0" strokeWidth={1.7} style={{ color: 'var(--marigold)' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mk-btn mk-btn-gold w-full mt-9">
                Start your 14-day free trial
              </Link>
              <p className="mk-mono mt-4 text-center text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--cream)', opacity: 0.6 }}>
                No card required &middot; Cancel anytime
              </p>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={80}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
              {[
                { value: <CountUp to={10} prefix="£" />, label: 'a month, flat' },
                { value: <CountUp to={14} />, label: 'day free trial' },
                { value: <CountUp to={4} />, label: 'site templates' },
                { value: <CountUp to={0} suffix="%" />, label: 'commission on orders' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="mk-display text-4xl" style={{ color: 'var(--marigold-deep)' }}>
                    {stat.value}
                  </p>
                  <p className="mk-mono mt-2 text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--ink-soft)' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24" style={{ background: 'var(--cream-2)' }}>
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center">
            <p className="mk-eyebrow justify-center">Before you ask</p>
            <h2 className="mk-display mt-4 text-3xl sm:text-4xl">Fair questions, straight answers.</h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10">
              {LANDING_FAQS.map((f) => (
                <details key={f.q} className="mk-faq">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-soft)' }}>
              More questions answered on the{' '}
              <Link href="/faq" className="underline font-medium" style={{ color: 'var(--ink)' }}>
                full FAQ page
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Founder note ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="mk-eyebrow justify-center">A note from the founder</p>
          <p className="mk-display mt-6 text-xl sm:text-2xl leading-relaxed">
            Caterfy exists because too many brilliant caterers run their whole business
            out of a notes app and a DM inbox. The food is professional — the tools
            should be too. That&rsquo;s the entire idea.
          </p>
          <p className="mk-mono mt-6 text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--ink-soft)' }}>
            Independently built &middot; No investors to feed &middot; No commission, ever
          </p>
        </Reveal>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28 pt-4">
        <Reveal className="max-w-5xl mx-auto">
          <div
            className="relative overflow-hidden px-6 py-16 sm:px-16 sm:py-20 text-center"
            style={{ background: 'var(--basil)', borderRadius: 24 }}
          >
            {/* Steam lines */}
            <svg
              className="mk-steam absolute inset-0 w-full h-full"
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <path d="M160 420 C140 340, 185 300, 165 220 C145 150, 185 100, 170 -20" />
              <path d="M400 420 C420 330, 375 290, 395 210 C415 140, 380 90, 400 -20" />
              <path d="M640 420 C620 350, 665 300, 645 230 C625 160, 660 100, 645 -20" />
              <path d="M280 420 C295 350, 260 310, 278 240 C295 175, 265 110, 280 -20" />
            </svg>

            <div className="relative">
              <h2 className="mk-display text-3xl sm:text-5xl" style={{ color: 'var(--cream)' }}>
                Ready when you are.
              </h2>
              <p className="mt-4 max-w-md mx-auto" style={{ color: 'var(--cream)', opacity: 0.75 }}>
                Set up in an afternoon. Your site, your menu, your orders — sorted before
                the next prep day.
              </p>
              <Link href="/signup" className="mk-btn mk-btn-gold mt-8">
                Start your 14-day free trial
                <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
              </Link>
              <p className="mk-mono mt-5 text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--cream)', opacity: 0.6 }}>
                No card required &middot; Cancel anytime
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
