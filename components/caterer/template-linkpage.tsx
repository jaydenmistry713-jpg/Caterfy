'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Phone, Mail, Share2, User, List } from 'lucide-react'
import OrderButton from './order-button'
import { CERTIFICATIONS } from './certification-badges'
import SendMessageForm from './send-message-form'

interface LinkPageData {
  chips?: string[]
  badge1?: string
  badge2?: string
  instagram?: string
  cta_label?: string
  extras?: string
  faqs?: { q: string; a: string }[]
  certifications?: string[]
}

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  gallery: any[]
  reviews: any[]
}

function LpMenuItem({ item, accent, off, muted, last }: { item: any; accent: string; off: string; muted: string; last: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const hasDesc = !!item.description
  return (
    <div
      onClick={() => hasDesc && setExpanded((v) => !v)}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: last ? 'none' : `1px solid rgba(255,255,255,0.04)`, gap: 12, cursor: hasDesc ? 'pointer' : 'default' }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: off }}>{item.name}</span>
          {hasDesc && (
            <ChevronDown size={12} style={{ color: muted, flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          )}
        </div>
        {expanded && item.description && (
          <span style={{ fontSize: 11, color: muted, marginTop: 4, display: 'block', lineHeight: 1.6 }}>{item.description}</span>
        )}
      </div>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: accent, flexShrink: 0 }}>
        £{parseFloat(item.price).toFixed(2)}
        {item.price_unit && item.price_unit !== 'flat' && (
          <span style={{ fontSize: 10, color: muted }}> /{item.price_unit === 'per person' ? 'pp' : 'ea'}</span>
        )}
      </span>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return `rgba(212,115,42,${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function CatererPageLinkPage({ caterer, menuItems, packages, gallery, reviews }: Props) {
  const page = caterer.page
  const td = (page?.template_data || {}) as LinkPageData
  const accent = page?.accent_color || '#d4732a'
  const accentDim = hexToRgba(accent, 0.12)
  const accentBorder = hexToRgba(accent, 0.3)

  const [openAccs, setOpenAccs] = useState<Set<string>>(new Set())

  function toggleAcc(id: string) {
    setOpenAccs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  const categories = Array.from(new Set(menuItems.map((i: any) => i.category || 'Menu'))) as string[]

  const extras = td.extras
    ? td.extras.split('\n').filter(Boolean).map((line: string) => {
        const parts = line.split('|')
        return { name: parts[0]?.trim() || '', price: parts[1]?.trim() || '' }
      })
    : []

  const faqs = td.faqs || []
  const chips = td.chips || []

  const bg = '#0c0b09'
  const bg2 = '#141210'
  const card = '#1a1815'
  const border = 'rgba(255,255,255,0.07)'
  const borderMid = 'rgba(255,255,255,0.12)'
  const off = '#ede8e2'
  const mid = '#8a8278'
  const muted = '#504d48'

  return (
    <>
      <style>{`
        .lp-photo-strip { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .lp-photo-strip::-webkit-scrollbar { display: none; }
        .lp-acc-body { transition: max-height 0.4s ease; overflow: hidden; }
        .lp-acc-open { max-height: 800px; }
        .lp-acc-closed { max-height: 0; }
        .lp-link-card:hover { background: #221f1b !important; border-color: rgba(255,255,255,0.12) !important; }
        .lp-btn-primary:hover { opacity: 0.88; transform: scale(0.98); }
        .lp-svc-card:hover .lp-svc-img { filter: brightness(0.8) !important; transform: scale(1.02) !important; }
        .lp-tray-card:hover { background: #221f1b !important; border-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      <div style={{ background: bg, color: off, fontFamily: 'system-ui, sans-serif', fontWeight: 300, overflowX: 'hidden', paddingBottom: 80, minHeight: '100vh' }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>

          {/* HERO BANNER */}
          <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
            {page?.hero_image_url ? (
              <Image src={page.hero_image_url} alt={caterer.business_name} fill className="object-cover" style={{ filter: 'brightness(0.55)' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: card }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(12,11,9,0.2) 0%, rgba(12,11,9,0.85) 100%)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: `2px solid ${accent}`, overflow: 'hidden', background: card, flexShrink: 0, boxShadow: `0 0 0 3px ${bg}`, position: 'relative' }}>
                {page?.logo_url ? (
                  <Image src={page.logo_url} alt="Logo" fill className="object-cover" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted }}>
                    <User size={28} />
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 600, color: '#ffffff', lineHeight: 1, display: 'block' }}>
                  {caterer.business_name}
                </span>
                {page?.tagline && (
                  <span style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, display: 'block', marginTop: 3 }}>
                    {page.tagline}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PROFILE INFO */}
          {(page?.about || chips.length > 0) && (
            <div style={{ padding: '16px 20px 20px', borderBottom: `1px solid ${border}` }}>
              {page?.about && (
                <p style={{ fontSize: 13, color: mid, lineHeight: 1.75, marginBottom: chips.length > 0 ? 14 : 0 }}>
                  {page.about}
                  {caterer.location?.name && (
                    <> Based in <strong style={{ color: off }}>{caterer.location.name}</strong>.</>
                  )}
                </p>
              )}
              {chips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {chips.map((chip: string, i: number) => (
                    <span key={i} style={{ border: `1px solid ${borderMid}`, color: mid, fontSize: 11, padding: '4px 10px', borderRadius: 20 }}>
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BADGES */}
          {(td.badge1 || td.badge2) && (
            <div style={{ display: 'flex', gap: 8, margin: '16px 16px 8px' }}>
              {td.badge1 && (
                <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: mid }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {td.badge1}
                </div>
              )}
              {td.badge2 && (
                <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: mid }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {td.badge2}
                </div>
              )}
            </div>
          )}

          {/* CERTIFICATIONS */}
          {(td.certifications || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '16px 16px 4px' }}>
              {(td.certifications as string[]).map((cert) =>
                CERTIFICATIONS[cert] ? (
                  <span key={cert} style={{ border: `1px solid rgba(255,255,255,0.15)`, color: 'rgba(237,232,226,0.7)', fontSize: 10, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: accent }}>✓</span>{CERTIFICATIONS[cert]}
                  </span>
                ) : null
              )}
            </div>
          )}

          {/* QUICK ACTIONS */}
          <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, padding: '22px 20px 10px', display: 'block', fontWeight: 400 }}>
            Quick Actions
          </span>

          <a
            href="#order"
            className="lp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 16px 8px', background: accent, color: '#fff', padding: '15px 18px', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'opacity .2s, transform .15s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <List size={16} />
              </div>
              {td.cta_label || 'Order Now'}
            </div>
            <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
          </a>

          {caterer.phone && (
            <a href={`tel:${caterer.phone}`} className="lp-link-card" style={{ display: 'flex', alignItems: 'center', gap: 14, background: card, border: `1px solid ${border}`, padding: '14px 16px', borderRadius: 12, textDecoration: 'none', color: off, margin: '0 16px 8px', transition: 'background .2s, border-color .2s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${border}`, background: bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: mid }}>
                <Phone size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: off, display: 'block', marginBottom: 2 }}>Call Us</span>
                <span style={{ fontSize: 11, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{caterer.phone}</span>
              </div>
              <ChevronDown size={14} style={{ color: muted, transform: 'rotate(-90deg)', flexShrink: 0 }} />
            </a>
          )}

          {caterer.email && (
            <a href={`mailto:${caterer.email}`} className="lp-link-card" style={{ display: 'flex', alignItems: 'center', gap: 14, background: card, border: `1px solid ${border}`, padding: '14px 16px', borderRadius: 12, textDecoration: 'none', color: off, margin: '0 16px 8px', transition: 'background .2s, border-color .2s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${border}`, background: bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: mid }}>
                <Mail size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: off, display: 'block', marginBottom: 2 }}>Email a Booking</span>
                <span style={{ fontSize: 11, color: muted }}>Events, private catering &amp; quotes</span>
              </div>
              <ChevronDown size={14} style={{ color: muted, transform: 'rotate(-90deg)', flexShrink: 0 }} />
            </a>
          )}

          {td.instagram && (
            <a href={`https://instagram.com/${td.instagram}`} target="_blank" rel="noopener noreferrer" className="lp-link-card" style={{ display: 'flex', alignItems: 'center', gap: 14, background: card, border: `1px solid ${border}`, padding: '14px 16px', borderRadius: 12, textDecoration: 'none', color: off, margin: '0 16px 8px', transition: 'background .2s, border-color .2s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${border}`, background: bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: mid }}>
                <Share2 size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: off, display: 'block', marginBottom: 2 }}>Follow on Instagram</span>
                <span style={{ fontSize: 11, color: muted }}>@{td.instagram}</span>
              </div>
              <ChevronDown size={14} style={{ color: muted, transform: 'rotate(-90deg)', flexShrink: 0 }} />
            </a>
          )}

          {/* GALLERY STRIP */}
          {gallery.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, padding: '22px 20px 10px', display: 'block' }}>
                Gallery
              </span>
              <div className="lp-photo-strip" style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '0 16px', marginBottom: 4 }}>
                {gallery.map((img: any) => (
                  <div key={img.id} style={{ flex: '0 0 140px', height: 160, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <Image src={img.image_url} alt={img.caption || 'Gallery'} fill className="object-cover" />
                    {img.caption && (
                      <span style={{ position: 'absolute', bottom: 8, left: 10, right: 10, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(237,232,226,0.8)', zIndex: 1 }}>
                        {img.caption}
                      </span>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(12,11,9,0.7))', borderRadius: 10 }} />
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: border, margin: '16px 20px' }} />
            </>
          )}

          {/* PACKAGES — tray grid */}
          {packages.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, padding: '22px 20px 10px', display: 'block' }}>
                Packages
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(packages.length, 3)}, 1fr)`, gap: 8, margin: '0 16px 8px' }}>
                {packages.slice(0, 3).map((pkg: any, i: number) => {
                  const isFeatured = i === 1 && packages.length >= 3
                  return (
                    <div
                      key={pkg.id}
                      className="lp-tray-card"
                      style={{
                        background: isFeatured ? 'linear-gradient(160deg,#1e1a16,#1a1512)' : card,
                        border: `1px solid ${isFeatured ? accentBorder : border}`,
                        borderRadius: 12,
                        padding: '16px 10px 14px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'background .2s, border-color .2s',
                      }}
                    >
                      {isFeatured && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: accent, color: '#fff', fontSize: 8, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '3px 0', textAlign: 'center' }}>
                          Popular
                        </div>
                      )}
                      <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: muted, display: 'block', marginBottom: 7, fontWeight: 400, marginTop: isFeatured ? 16 : 0 }}>
                        {pkg.name}
                      </span>
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 600, color: isFeatured ? accent : '#ffffff', display: 'block', marginBottom: 7, lineHeight: 1 }}>
                        £{parseFloat(pkg.price).toFixed(2)}
                      </span>
                      <span style={{ fontSize: 10, color: muted, lineHeight: 1.6 }}>
                        {pkg.description || (pkg.min_guests ? `${pkg.min_guests}–${pkg.max_guests} guests` : '')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* EXTRAS */}
          {extras.length > 0 && (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, margin: '0 16px 8px', overflow: 'hidden' }}>
              {extras.map((extra: { name: string; price: string }, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < extras.length - 1 ? `1px solid ${border}` : 'none', fontSize: 13 }}>
                  <span style={{ color: mid }}>{extra.name}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: accent }}>{extra.price}</span>
                </div>
              ))}
            </div>
          )}

          {(packages.length > 0 || extras.length > 0) && (
            <div style={{ height: 1, background: border, margin: '16px 20px' }} />
          )}

          {/* MENU ACCORDIONS */}
          {categories.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, padding: '22px 20px 10px', display: 'block' }}>
                Menu
              </span>
              {categories.map((cat: string) => {
                const items = menuItems.filter((i: any) => (i.category || 'Menu') === cat)
                const accId = `menu-${cat}`
                const isOpen = openAccs.has(accId)
                return (
                  <div key={cat} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, margin: '0 16px 8px', overflow: 'hidden' }}>
                    <div
                      onClick={() => toggleAcc(accId)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', userSelect: 'none', gap: 12 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 500, color: off }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${border}`, background: bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mid, flexShrink: 0 }}>
                          <List size={15} />
                        </div>
                        {cat}
                      </div>
                      <ChevronDown size={14} style={{ color: muted, flexShrink: 0, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </div>
                    <div className={`lp-acc-body ${isOpen ? 'lp-acc-open' : 'lp-acc-closed'}`}>
                      <div style={{ height: 1, background: border }} />
                      <div style={{ padding: 14 }}>
                        {items.map((item: any, idx: number) => (
                          <LpMenuItem key={item.id} item={item} accent={accent} off={off} muted={muted} last={idx === items.length - 1} />
                        ))}
                      </div>
                      <div style={{ padding: '0 12px 12px' }}>
                        <a href="#order" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: accentDim, border: `1px solid ${accentBorder}`, color: accent, padding: '11px 16px', borderRadius: 9, textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>
                          Order from this menu
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div style={{ height: 1, background: border, margin: '16px 20px' }} />
            </>
          )}

          {/* REVIEWS */}
          {reviews.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, padding: '22px 20px 10px', display: 'block' }}>
                Reviews{avgRating ? ` · ${avgRating} ★` : ''}
              </span>
              {reviews.slice(0, 4).map((review: any) => (
                <div key={review.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '18px 16px', margin: '0 16px 8px' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} style={{ color: accent, fontSize: 12 }}>★</span>
                    ))}
                  </div>
                  {review.review_text && (
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontStyle: 'italic', lineHeight: 1.75, color: 'rgba(237,232,226,0.82)', marginBottom: 16 }}>
                      &ldquo;{review.review_text}&rdquo;
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${accentBorder}`, background: accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: accent, flexShrink: 0 }}>
                      {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: off, display: 'block', marginBottom: 1 }}>{review.customer_name}</span>
                      {review.event_type && <span style={{ fontSize: 11, color: muted }}>{review.event_type}</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ height: 1, background: border, margin: '16px 20px' }} />
            </>
          )}

          {/* FAQS */}
          {faqs.length > 0 && (
            <>
              <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, padding: '22px 20px 10px', display: 'block' }}>
                FAQ
              </span>
              {faqs.map((faq: { q: string; a: string }, i: number) => {
                const accId = `faq-${i}`
                const isOpen = openAccs.has(accId)
                return (
                  <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, margin: '0 16px 8px', overflow: 'hidden' }}>
                    <div onClick={() => toggleAcc(accId)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: off, flex: 1, paddingRight: 12 }}>{faq.q}</span>
                      <ChevronDown size={14} style={{ color: muted, flexShrink: 0, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </div>
                    <div className={`lp-acc-body ${isOpen ? 'lp-acc-open' : 'lp-acc-closed'}`}>
                      <div style={{ height: 1, background: border }} />
                      <div style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: 13, color: mid, lineHeight: 1.7 }}>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div style={{ height: 1, background: border, margin: '16px 20px' }} />
            </>
          )}

          {/* SEND MESSAGE */}
          <div style={{ padding: '8px 16px 16px' }}>
            <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, display: 'block', marginBottom: 12 }}>
              Send a Message
            </span>
            <SendMessageForm caterer={caterer} accentColor={accent} dark />
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 20px 16px' }} />

          {/* ORDER */}
          <div id="order" style={{ padding: '24px 16px 16px' }}>
            <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: muted, display: 'block', marginBottom: 16 }}>
              Place an Order
            </span>
            <OrderButton caterer={caterer} menuItems={menuItems} packages={packages} accentColor={accent} />
          </div>

          {/* FOOTER */}
          <footer style={{ textAlign: 'center', padding: '20px 16px 8px', fontSize: 11, color: muted, lineHeight: 1.8 }}>
            <a href="https://caterfy.com" target="_blank" rel="noopener noreferrer" style={{ color: muted, textDecoration: 'none' }}>
              Powered by Caterfy
            </a>
          </footer>
        </div>

        {/* STICKY BAR */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 460, background: 'rgba(12,11,9,0.96)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${border}`, padding: '10px 16px', display: 'flex', gap: 8, zIndex: 100 }}>
          <a href="#order" style={{ flex: 1, padding: '12px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: accent, color: '#fff' }}>
            Order Now
          </a>
          {caterer.phone && (
            <a href={`tel:${caterer.phone}`} style={{ flex: 1, padding: '12px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: `1px solid ${border}`, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: card, color: off }}>
              <Phone size={14} /> Call
            </a>
          )}
        </div>
      </div>
    </>
  )
}
