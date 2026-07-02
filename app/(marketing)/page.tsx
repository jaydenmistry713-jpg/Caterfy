import Link from 'next/link'
import {
  Palette, Inbox, FileText, Receipt, CreditCard, UtensilsCrossed,
  Tag, Star, Calendar, MapPin, Mail, Check, ArrowRight,
} from 'lucide-react'
import HeroDemo from '@/components/marketing/hero-demo'
import Reveal from '@/components/marketing/reveal'
import CountUp from '@/components/marketing/count-up'

const TRUST_NAMES = [
  'The Willow Pantry', 'Saffron & Sage', 'Bramble Feast Co.', 'Little Fig Kitchen',
  'The Sunday Spread', 'Elder & Rye', 'Pepperpot Catering', 'Maple & Thyme',
  'Copper Pot Kitchen', 'The Gilded Grape',
]

const FEATURES = [
  {
    icon: Inbox,
    eyebrow: 'Orders',
    title: 'Every order in one inbox',
    copy: 'No more scrolling back through DMs to find who wanted what, when. Fixed-price orders and quote requests land in one place — accept or decline in a click and the customer is emailed automatically.',
  },
  {
    icon: FileText,
    eyebrow: 'Quotes',
    title: 'Quotes without the back-and-forth',
    copy: 'Build an itemised quote in the dashboard and send it. Your customer accepts online — no PDFs, no "did you get my email?", no chasing.',
  },
  {
    icon: Receipt,
    eyebrow: 'Invoices',
    title: 'Invoices out of your notes app',
    copy: 'Generate an invoice from any order, or write one from scratch. Your bank transfer details are included automatically, and it goes out by email.',
  },
  {
    icon: CreditCard,
    eyebrow: 'Payments',
    title: 'Card, bank transfer or pay later',
    copy: 'Take card payments straight to your bank via Stripe, share your bank details at checkout, or let customers pay on the day — however you already work.',
  },
  {
    icon: UtensilsCrossed,
    eyebrow: 'Menu & Services',
    title: 'Menus that are not screenshots',
    copy: 'Proper menus with categories, packages, photos and per-person pricing. Set stock limits and the order form enforces them for you.',
  },
  {
    icon: Tag,
    eyebrow: 'Discount Codes',
    title: 'Run offers without a spreadsheet',
    copy: 'Percentage or fixed-amount codes with expiry dates, minimum spends and usage caps — validated automatically at checkout.',
  },
  {
    icon: Star,
    eyebrow: 'Reviews',
    title: 'Reviews you do not have to beg for',
    copy: 'Customers get a review link after their event, and reviews appear on your site. Respond publicly to every one from the dashboard.',
  },
  {
    icon: Calendar,
    eyebrow: 'Availability',
    title: 'Never explain you are fully booked',
    copy: 'Block out dates you cannot cater and the order form stops customers booking them. No awkward decline messages needed.',
  },
  {
    icon: MapPin,
    eyebrow: 'Directory',
    title: 'Get found, not just built',
    copy: 'Every Caterfy site is listed in our directory, searchable by location and cuisine — so new customers find you while you cook.',
  },
  {
    icon: Mail,
    eyebrow: 'Automated Emails',
    title: 'Confirmations sent while you cook',
    copy: 'Order confirmations, acceptance emails, quote notifications and review requests all go out automatically. You stay at the stove.',
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
            <p className="mk-mono mk-enter mk-enter-5 mt-6 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--ink-soft)' }}>
              14-day free trial &middot; No setup fee &middot; Cancel anytime
            </p>
          </div>

          <div className="mk-enter mk-enter-4 lg:pl-4">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* ---------- Trust strip ---------- */}
      <section className="py-12" style={{ background: 'var(--basil)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mk-mono text-center text-[10px] tracking-[0.22em] uppercase mb-7" style={{ color: 'var(--cream)', opacity: 0.55 }}>
            Built for independent food businesses
          </p>
        </div>
        <div className="mk-marquee" aria-hidden="true">
          <div className="mk-marquee-track">
            {[...TRUST_NAMES, ...TRUST_NAMES].map((name, i) => (
              <span key={i} className="mk-display text-2xl whitespace-nowrap" style={{ color: 'var(--cream)', opacity: 0.62 }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 lg:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="mk-eyebrow">Everything in one place</p>
            <h2 className="mk-display mt-4 text-3xl sm:text-5xl max-w-2xl">
              Stop stitching together six different apps.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Flagship: site editor, wide card */}
            <Reveal className="sm:col-span-2">
              <div className="mk-card h-full p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="mk-icon-tile">
                      <Palette className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <p className="mk-eyebrow">Site Editor</p>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">
                    A website you would actually send to a wedding planner
                  </h3>
                  <p className="mt-3 max-w-xl" style={{ color: 'var(--ink-soft)' }}>
                    Pick a template, set your colours, add your photos and menu — live at
                    caterfy.com/your-name the same afternoon. Gallery, reviews and an order
                    form built in, so it works as hard as you do. No web designer, no
                    &pound;800 invoice, no &ldquo;I&rsquo;ll update it when I get a minute&rdquo;.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Classic', 'Modern', 'Bold', 'Link Page'].map((t, i) => (
                    <span
                      key={t}
                      className="mk-mono text-[10px] tracking-[0.18em] uppercase rounded-full px-3.5 py-1.5"
                      style={
                        i === 2
                          ? { background: 'var(--tomato)', color: 'var(--cream)' }
                          : { background: 'var(--cream-2)', color: 'var(--ink-soft)' }
                      }
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            {FEATURES.map((f, i) => (
              <Reveal key={f.eyebrow} delay={(i % 3) * 70}>
                <div className="mk-card h-full p-7">
                  <div className="flex items-center gap-4">
                    <span className="mk-icon-tile">
                      <f.icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <p className="mk-eyebrow">{f.eyebrow}</p>
                  </div>
                  <h3 className="mt-5 text-lg font-bold leading-snug">{f.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                    {f.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
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
              No tiers, no add-ons, no commission on your orders. Your customers pay you —
              Caterfy just costs less than a takeaway each month.
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
              <p className="mk-mono mt-4 text-center text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--cream)', opacity: 0.55 }}>
                No setup fee &middot; Cancel anytime
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

      {/* ---------- Testimonial ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24" style={{ background: 'var(--cream-2)' }}>
        <Reveal className="max-w-3xl mx-auto text-center">
          <p className="mk-display text-7xl leading-none select-none" aria-hidden="true" style={{ color: 'var(--marigold)' }}>
            &ldquo;
          </p>
          <blockquote className="mk-display text-2xl sm:text-[2rem] leading-snug -mt-4">
            I used to spend Sunday nights copying orders out of Instagram into a notebook.
            Now everything is already in one place — I just cook.
          </blockquote>
          <p className="mk-mono mt-7 text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--ink-soft)' }}>
            Priya &middot; Saffron &amp; Sage, Birmingham
          </p>
        </Reveal>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
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
              <p className="mk-mono mt-5 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--cream)', opacity: 0.55 }}>
                No setup fee &middot; Cancel anytime
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
