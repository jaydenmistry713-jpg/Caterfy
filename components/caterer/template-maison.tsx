import Image from 'next/image'
import OrderButton from './order-button'
import SendMessageForm from './send-message-form'
import StickyOrderBar from './sticky-order-bar'
import { CERTIFICATIONS } from './certification-badges'
import { resolveMaisonColors, hexToRgba } from './maison-palette'
import { poweredByUrl } from '@/lib/site'

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  gallery: any[]
  reviews: any[]
}

// "Maison" — editorial, high-end template. Typography (Fraunces + Inter),
// layout and neutrals are locked; the caterer picks a curated palette
// (accent × band × paper) in the editor. Every text slot has a designed
// fallback so a sparse profile still renders complete.

const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Inter', system-ui, sans-serif"
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600&display=swap'

// Gallery slots cycle through an editorial rhythm: two wide, three tall.
const GALLERY_SLOTS = [
  { cls: 'col-span-12 md:col-span-7', ar: '16/10' },
  { cls: 'col-span-12 md:col-span-5', ar: '16/10' },
  { cls: 'col-span-12 md:col-span-4', ar: '4/5' },
  { cls: 'col-span-12 md:col-span-4', ar: '4/5' },
  { cls: 'col-span-12 md:col-span-4', ar: '4/5' },
]

function priceUnitSuffix(unit: string | null): string {
  if (unit === 'per person') return ' pp'
  if (unit === 'per meal') return ' per meal'
  return ''
}

// Split the tagline so the last two words get the italic accent treatment.
function splitHeadline(text: string): { plain: string; accent: string } {
  const words = text.trim().split(/\s+/)
  if (words.length <= 2) return { plain: '', accent: words.join(' ') }
  return {
    plain: words.slice(0, -2).join(' ') + ' ',
    accent: words.slice(-2).join(' '),
  }
}

export default function CatererPageMaison({ caterer, menuItems, packages, gallery, reviews }: Props) {
  const page = caterer.page
  const c = resolveMaisonColors(page?.template_data)

  const headline = splitHeadline(page?.tagline || 'Seasonal feasts, laid by hand.')

  const eventTypes: string[] = (caterer.caterer_event_types || [])
    .map((e: any) => e.event_type?.name)
    .filter(Boolean)
  const cuisines: string[] = (caterer.caterer_cuisines || [])
    .map((x: any) => x.cuisine?.name)
    .filter(Boolean)
  const dietary: string[] = (caterer.caterer_dietary_options || [])
    .map((d: any) => d.dietary_option?.name)
    .filter(Boolean)
  const certs: string[] = (page?.template_data?.certifications || [])
    .map((k: string) => CERTIFICATIONS[k])
    .filter(Boolean)

  const heroSub = eventTypes.length
    ? `Catering for ${eventTypes.slice(0, 3).join(', ').toLowerCase()} — and every gathering in between${caterer.location ? `, across ${caterer.location.name} and beyond` : ''}.`
    : `Menus built around your event, your guests and your budget${caterer.location ? ` — based in ${caterer.location.name}` : ''}.`

  // About: first sentence becomes the large serif lede, the rest the body.
  const about: string = page?.about || ''
  const sentenceEnd = about.indexOf('. ')
  const lede = sentenceEnd > 0 ? about.slice(0, sentenceEnd + 1) : about
  const aboutBody = sentenceEnd > 0 ? about.slice(sentenceEnd + 2) : ''

  const categories: string[] = Array.from(new Set(menuItems.map((i) => i.category || 'Menu')))
  const colA = categories.filter((_, i) => i % 2 === 0)
  const colB = categories.filter((_, i) => i % 2 === 1)

  const shownPackages = packages.slice(0, 3)

  // Pull quote: prefer a 5★ review whose length suits the large treatment.
  const withText = reviews.filter((r) => r.review_text)
  const pullQuote =
    withText.find((r) => r.rating === 5 && r.review_text.length >= 60 && r.review_text.length <= 200) ||
    withText.sort((a, b) => b.rating - a.rating)[0]
  const moreReviews = withText.filter((r) => r !== pullQuote).slice(0, 4)

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null

  const label = (color: string) => ({
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    color,
  })

  const navSections = [
    ...((menuItems.length || shownPackages.length) ? [{ id: 'menu', label: 'Menu' }] : []),
    ...(shownPackages.length ? [{ id: 'occasions', label: 'Occasions' }] : []),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
  ]

  const menuCategory = (cat: string) => {
    const items = menuItems.filter((i) => (i.category || 'Menu') === cat)
    return (
      <div key={cat} className="mb-14">
        <h3
          className="pb-3.5 mb-2"
          style={{ ...label(c.ink), letterSpacing: '0.2em', borderBottom: `1px solid ${c.hairline}` }}
        >
          {cat}
        </h3>
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-baseline gap-3 pt-4 pb-1">
              <span className="text-xl" style={{ fontFamily: SERIF }}>
                {item.name}
              </span>
              <span
                className="flex-1 -translate-y-1"
                style={{ borderBottom: `1px dotted ${hexToRgba(c.ink, 0.35)}` }}
              />
              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: c.accent }}>
                £{Number(item.price).toFixed(2)}{priceUnitSuffix(item.price_unit)}
              </span>
            </div>
            {item.description && (
              <p className="text-sm max-w-[46ch]" style={{ color: c.soft }}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ background: c.paper, color: c.ink, fontFamily: SANS }}>
      <link rel="stylesheet" href={FONT_HREF} />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: hexToRgba(c.paper, 0.92),
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${c.hairlineSoft}`,
        }}
      >
        <div className="max-w-[1180px] mx-auto px-7 h-[68px] flex items-center justify-between">
          <a href="#" className="text-[13px] font-semibold uppercase" style={{ letterSpacing: '0.28em' }}>
            {caterer.business_name}
          </a>
          <div className="flex items-center gap-8">
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="hidden md:block text-[13px] font-medium transition-colors hover:opacity-100"
                style={{ color: c.soft }}
              >
                {s.label}
              </a>
            ))}
            <a
              href="#order"
              className="rounded-full px-5 py-2 text-[13px] font-semibold transition-colors"
              style={{ border: `1px solid ${c.ink}` }}
            >
              Enquire
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-[1180px] mx-auto px-7 pt-16 sm:pt-24">
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
          {caterer.location && <span style={label(c.accent)}>{caterer.location.name}{cuisines.length ? ` · ${cuisines[0]}` : ''}</span>}
          {certs.slice(0, 2).map((cert) => (
            <span key={cert} style={label(c.soft)}>✓ {cert}</span>
          ))}
          {avgRating && <span style={label(c.soft)}>★ {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>}
        </div>
        <h1
          className="text-[clamp(44px,7.2vw,92px)]"
          style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.04, letterSpacing: '-0.015em', maxWidth: '14ch' }}
        >
          {headline.plain}
          <em style={{ color: c.accent, fontWeight: 380 }}>{headline.accent}</em>
        </h1>
        <div className="flex flex-wrap items-end justify-between gap-9 mt-11">
          <p className="max-w-[400px] text-[17px]" style={{ color: c.soft }}>
            {heroSub}
          </p>
          <div className="flex flex-wrap gap-3.5 items-center">
            <a
              href="#order"
              className="inline-flex items-center gap-2 rounded-full px-7 py-[15px] text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: c.accent }}
            >
              Plan your event →
            </a>
            {menuItems.length > 0 && (
              <a
                href="#menu"
                className="inline-flex items-center rounded-full px-7 py-[15px] text-sm font-semibold transition-colors"
                style={{ border: `1px solid ${c.hairline}` }}
              >
                View menus
              </a>
            )}
          </div>
        </div>
        {page?.hero_image_url && (
          <>
            <figure className="mt-16 rounded overflow-hidden relative" style={{ aspectRatio: '21/9' }}>
              <Image src={page.hero_image_url} alt={caterer.business_name} fill className="object-cover" priority />
            </figure>
            <div className="flex flex-wrap justify-between gap-2 pt-3.5 px-1 text-xs" style={{ color: c.soft, letterSpacing: '0.06em' }}>
              <span>{caterer.business_name}{caterer.location ? ` — ${caterer.location.name}` : ''}</span>
              {eventTypes.length > 0 && <span>{eventTypes.slice(0, 3).join(' · ')}</span>}
            </div>
          </>
        )}
      </header>

      {/* About */}
      {about && (
        <section id="about" className="max-w-[1180px] mx-auto px-7 pt-24 sm:pt-32">
          <div className="grid md:grid-cols-[5fr_6fr] gap-11 md:gap-16 items-start">
            <div>
              <span style={label(c.accent)}>Our kitchen</span>
              <p
                className="mt-4 text-[clamp(22px,2.4vw,30px)]"
                style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.45 }}
              >
                {lede}
              </p>
              {aboutBody && (
                <p className="mt-6 max-w-[52ch]" style={{ color: c.soft }}>
                  {aboutBody}
                </p>
              )}
            </div>
            {gallery.length >= 2 && (
              <div className="grid grid-cols-2 gap-4">
                <figure className="rounded overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
                  <Image src={gallery[0].image_url} alt={gallery[0].caption || ''} fill className="object-cover" />
                </figure>
                <figure className="rounded overflow-hidden relative mt-14" style={{ aspectRatio: '3/4' }}>
                  <Image src={gallery[1].image_url} alt={gallery[1].caption || ''} fill className="object-cover" />
                </figure>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Menu */}
      {menuItems.length > 0 && (
        <section id="menu" className="max-w-[1180px] mx-auto px-7 pt-24 sm:pt-32">
          <div className="mb-12">
            <span style={label(c.accent)}>The menu</span>
            <h2
              className="mt-4 text-[clamp(32px,4vw,52px)]"
              style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.1, letterSpacing: '-0.01em' }}
            >
              Short, seasonal,<br />made from scratch.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-x-20">
            <div>{colA.map(menuCategory)}</div>
            <div>{colB.map(menuCategory)}</div>
          </div>
        </section>
      )}

      {/* Packages */}
      {shownPackages.length > 0 && (
        <section id="occasions" className="max-w-[1180px] mx-auto px-7 pt-24 sm:pt-32">
          <div className="mb-12">
            <span style={label(c.accent)}>Gatherings</span>
            <h2
              className="mt-4 text-[clamp(32px,4vw,52px)]"
              style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.1 }}
            >
              {shownPackages.length === 1 ? 'One way' : shownPackages.length === 2 ? 'Two ways' : 'Three ways'} to feed a crowd.
            </h2>
          </div>
          <div
            className="grid md:grid-cols-3"
            style={{ borderTop: `1px solid ${c.hairline}`, borderBottom: `1px solid ${c.hairline}` }}
          >
            {shownPackages.map((pkg, i) => (
              <div
                key={pkg.id}
                className="relative py-11 px-1 md:px-9 md:first:pl-1"
                style={i > 0 ? { borderLeft: `1px solid ${c.hairline}` } : undefined}
              >
                {pkg.is_popular && (
                  <span
                    className="absolute top-11 right-1 md:right-8 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase"
                    style={{ letterSpacing: '0.16em', background: c.band, color: c.paper }}
                  >
                    Most requested
                  </span>
                )}
                <span className="text-xs font-semibold" style={{ letterSpacing: '0.18em', color: c.accent }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3.5 text-[26px]" style={{ fontFamily: SERIF }}>
                  {pkg.name}
                </h3>
                <p className="mt-1.5 text-[34px]" style={{ fontFamily: SERIF }}>
                  £{Number(pkg.price).toFixed(2).replace(/\.00$/, '')}
                  {pkg.max_guests && (
                    <span className="text-sm" style={{ fontFamily: SANS, color: c.soft }}>
                      {' '}· up to {pkg.max_guests} guests
                    </span>
                  )}
                </p>
                {pkg.description && (
                  <p className="mt-5 text-sm leading-relaxed" style={{ color: c.soft }}>
                    {pkg.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="max-w-[1180px] mx-auto px-7 pt-24 sm:pt-32">
          <div className="mb-12">
            <span style={label(c.accent)}>Recent tables</span>
            <h2
              className="mt-4 text-[clamp(32px,4vw,52px)]"
              style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.1 }}
            >
              Proof, not promises.
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-4">
            {gallery.map((img, i) => {
              const slot = GALLERY_SLOTS[i % GALLERY_SLOTS.length]
              return (
                <figure
                  key={img.id}
                  className={`${slot.cls} rounded overflow-hidden relative group`}
                  style={{ aspectRatio: slot.ar }}
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || ''}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </figure>
              )
            })}
          </div>
        </section>
      )}

      {/* Reviews */}
      {pullQuote && (
        <section id="reviews" className="max-w-[820px] mx-auto px-7 pt-24 sm:pt-32 text-center">
          <div style={{ color: c.accent, fontSize: 15, letterSpacing: 6 }}>
            {'★'.repeat(pullQuote.rating)}
          </div>
          <blockquote
            className="mt-6 text-[clamp(24px,3vw,36px)]"
            style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 350, lineHeight: 1.4 }}
          >
            “{pullQuote.review_text}”
          </blockquote>
          <p className="mt-6 text-[13px] uppercase" style={{ color: c.soft, letterSpacing: '0.1em' }}>
            {pullQuote.customer_name}
            {pullQuote.event_type ? ` · ${pullQuote.event_type}` : ''}
          </p>
          {moreReviews.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 mt-16 text-left">
              {moreReviews.map((r) => (
                <div key={r.id}>
                  <div style={{ color: c.accent, fontSize: 12, letterSpacing: 4 }}>{'★'.repeat(r.rating)}</div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: c.soft }}>
                    “{r.review_text.length > 160 ? r.review_text.slice(0, 157) + '…' : r.review_text}”
                  </p>
                  <p className="mt-2 text-[11px] uppercase" style={{ color: c.soft, letterSpacing: '0.1em', opacity: 0.8 }}>
                    {r.customer_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Details band */}
      <div className="mt-24 sm:mt-32" style={{ background: c.band, color: c.paper }}>
        <div className="max-w-[1180px] mx-auto px-7 py-20 grid md:grid-cols-3 gap-9 md:gap-14">
          <div>
            <h4 className="mb-4" style={label(hexToRgba(c.paper, 0.55))}>Serving</h4>
            <p className="text-[21px]" style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.5 }}>
              {caterer.location
                ? `${caterer.location.name} and the surrounding area. Further afield by arrangement.`
                : 'Ask us about your area — we travel for the right table.'}
            </p>
          </div>
          <div>
            <h4 className="mb-4" style={label(hexToRgba(c.paper, 0.55))}>Occasions</h4>
            <p className="text-[21px]" style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.5 }}>
              {eventTypes.length
                ? `${eventTypes.slice(0, 4).join(', ')} — and the odd very good party.`
                : 'Weddings, private dinners, corporate lunches and the odd very good party.'}
            </p>
          </div>
          <div>
            <h4 className="mb-4" style={label(hexToRgba(c.paper, 0.55))}>Dietary</h4>
            <p className="text-[21px]" style={{ fontFamily: SERIF, fontWeight: 350, lineHeight: 1.5 }}>
              {dietary.length
                ? `${dietary.slice(0, 4).join(', ')} — planned with you, never an afterthought.`
                : 'Dietary requirements planned with you — never an afterthought.'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact + Order */}
      <section id="order" className="max-w-[1180px] mx-auto px-7 pt-24 sm:pt-32 pb-28 text-center">
        <span style={label(c.accent)}>Enquiries</span>
        <h2
          className="mt-5 text-[clamp(38px,5.5vw,68px)]"
          style={{ fontFamily: SERIF, fontWeight: 350, letterSpacing: '-0.01em' }}
        >
          Let’s plan <em style={{ color: c.accent }}>your table.</em>
        </h2>
        <p className="mt-4 max-w-md mx-auto" style={{ color: c.soft }}>
          Tell us the date, the place and how many you’re feeding — we’ll do the rest.
        </p>
        <div className="flex justify-center mt-9">
          <OrderButton caterer={caterer} menuItems={menuItems} packages={packages} accentColor={c.accent} />
        </div>
        {caterer.show_contact_publicly && (caterer.phone || caterer.email) && (
          <p className="mt-7 text-[13px] uppercase" style={{ color: c.soft, letterSpacing: '0.12em' }}>
            {[caterer.phone, caterer.email].filter(Boolean).join(' · ')}
          </p>
        )}
        <div id="contact" className="max-w-lg mx-auto mt-16 text-left">
          <SendMessageForm caterer={caterer} accentColor={c.accent} />
        </div>
        {page?.terms_conditions && (
          <div className="max-w-2xl mx-auto mt-20 text-left">
            <h3 className="mb-3 text-center" style={label(c.soft)}>Terms &amp; Conditions</h3>
            <p className="text-sm whitespace-pre-wrap" style={{ color: c.soft }}>
              {page.terms_conditions}
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${c.hairlineSoft}` }}>
        <div className="max-w-[1180px] mx-auto px-7 py-7 flex flex-wrap justify-between gap-3 text-xs" style={{ color: c.soft }}>
          <span>© {new Date().getFullYear()} {caterer.business_name}</span>
          <a href={poweredByUrl(caterer.slug)} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Powered by Caterfy
          </a>
        </div>
      </footer>

      {page?.template_data?.sticky_bar && (
        <StickyOrderBar accentColor={c.accent} phone={caterer.phone} showPhone={caterer.show_contact_publicly} />
      )}
    </div>
  )
}
