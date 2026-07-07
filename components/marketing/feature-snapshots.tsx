import {
  Check, Clock, CreditCard, Landmark, Smartphone, HandCoins, Star,
} from 'lucide-react'

// Tentary-style product visuals for the landing-page feature cards: each is a
// CSS-built "snapshot" of real Caterfy UI (order card, checkout payment
// options, invoice, lifecycle automation) floating over a soft decorative
// stage. Purely decorative — every stage is aria-hidden and uses real product
// terminology so the snapshots read as genuine screenshots.

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={`mk-skelrow ${className ?? ''}`}>
      <span className="mk-skel-dot" />
      <span className="mk-skel" style={{ width: '34%' }} />
      <span className="mk-skel ml-auto" style={{ width: '16%' }} />
    </div>
  )
}

/* ---------- Look professional: mini caterer site ---------- */

export function SiteSnapshot() {
  return (
    <div className="mk-stage" aria-hidden="true" style={{ background: '#EDE4CF' }}>
      <span className="mk-blob" style={{ width: 250, height: 250, left: -80, top: -90, background: 'rgba(232, 163, 61, 0.28)' }} />
      <span className="mk-blob" style={{ width: 210, height: 210, right: -60, bottom: -80, background: 'rgba(24, 42, 32, 0.10)' }} />

      <div className="mk-snap absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[310px] max-w-[92%] overflow-hidden">
        <div
          className="flex items-center gap-1.5 px-3 py-2"
          style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--border-light)' }}
        >
          <span className="mk-browser-dot" />
          <span className="mk-browser-dot" />
          <span className="mk-browser-dot" />
          <span className="mk-browser-url">caterfy.com/the-willow-pantry</span>
        </div>
        <div className="px-4 py-3" style={{ background: 'var(--basil)' }}>
          <p className="mk-display text-[15px]" style={{ color: 'var(--cream)' }}>The Willow Pantry</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--cream)', opacity: 0.65 }}>
            Grazing tables &amp; seasonal feasts · Bristol
          </p>
        </div>
        <div className="px-4 py-3 space-y-2 bg-white">
          <div className="flex items-center justify-between text-[11.5px] font-semibold">
            <span>Signature grazing table</span>
            <span style={{ color: 'var(--marigold-deep)' }}>£9.50 pp</span>
          </div>
          <div className="flex items-center justify-between text-[11.5px] font-semibold">
            <span>Afternoon tea for two</span>
            <span style={{ color: 'var(--marigold-deep)' }}>£24.00</span>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <span
              className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold"
              style={{ background: 'var(--marigold)', color: 'var(--basil)' }}
            >
              Order now
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
              <Star className="h-3 w-3" style={{ color: 'var(--marigold-deep)' }} fill="currentColor" strokeWidth={0} />
              4.9 · 23 reviews
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Take orders: order card + paid invoice ---------- */

export function OrdersSnapshot() {
  return (
    <div className="mk-stage" aria-hidden="true" style={{ background: '#E7EBDE' }}>
      <span className="mk-blob" style={{ width: 230, height: 230, right: -70, top: -90, background: 'rgba(232, 163, 61, 0.24)' }} />
      <span className="mk-blob" style={{ width: 180, height: 180, left: -60, bottom: -60, background: 'rgba(210, 91, 67, 0.14)' }} />

      <SkeletonRow className="absolute left-8 right-8 -top-4" />

      <div className="mk-snap absolute left-1/2 top-6 -translate-x-1/2 w-[320px] max-w-[92%]">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="mk-mono text-[9px] tracking-[0.18em] uppercase font-medium" style={{ color: 'var(--marigold-deep)' }}>
            New order
          </span>
          <span className="mk-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>#CF-2481</span>
        </div>
        <div className="px-4 pt-1.5 pb-3">
          <p className="text-[13.5px] font-bold">Sophie Turner</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            Wedding · Sat 12 Sep · 80 guests
          </p>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px dashed var(--border-light)' }}>
          <p className="text-[12px]">
            <span style={{ color: 'var(--ink-soft)' }}>Total </span>
            <strong>£760.00</strong>
          </p>
          <div className="flex gap-1.5">
            <span className="mk-snap-btn mk-snap-btn-basil">Accept</span>
            <span className="mk-snap-btn mk-snap-btn-ghost">Decline</span>
          </div>
        </div>
      </div>

      <div className="mk-snap absolute right-4 bottom-2.5 w-[190px] rotate-2 px-3.5 py-2.5 hidden min-[400px]:block">
        <div className="flex items-center justify-between gap-2">
          <span className="mk-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--ink-soft)' }}>
            Invoice #0042
          </span>
          <span className="mk-chip mk-chip-green">Paid</span>
        </div>
        <div className="flex justify-between mt-1.5 pt-1.5 text-[11.5px] font-bold" style={{ borderTop: '1px solid var(--border-light)' }}>
          <span>Total</span>
          <span>£760.00</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Get paid: checkout payment options ---------- */

const PAYMENT_ROWS = [
  { icon: CreditCard, label: 'Visa & Mastercard' },
  { icon: Smartphone, label: 'Apple Pay & Google Pay' },
  { icon: Landmark, label: 'Bank transfer' },
  { icon: HandCoins, label: 'Pay on the day' },
]

export function PaymentsSnapshot() {
  return (
    <div className="mk-stage" aria-hidden="true" style={{ background: '#F4E5C8' }}>
      <span className="mk-blob" style={{ width: 260, height: 260, right: -90, bottom: -110, background: 'rgba(210, 91, 67, 0.16)' }} />
      <span className="mk-blob" style={{ width: 200, height: 200, left: -70, top: -80, background: 'rgba(24, 42, 32, 0.10)' }} />

      <div className="absolute left-1/2 -top-9 -translate-x-1/2 w-[290px] max-w-[92%] space-y-2">
        <SkeletonRow />
        {PAYMENT_ROWS.map((row) => (
          <div key={row.label} className="mk-snap-row">
            <span className="mk-snap-icon">
              <row.icon className="h-3.5 w-3.5" strokeWidth={1.7} />
            </span>
            {row.label}
            <span className="mk-check">
              <Check className="h-3 w-3" strokeWidth={3.2} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Get found: lifecycle emails run themselves ---------- */

export function GrowthSnapshot() {
  return (
    <div className="mk-stage" aria-hidden="true" style={{ background: '#F2E2D6' }}>
      <span className="mk-blob" style={{ width: 240, height: 240, left: -80, top: -100, background: 'rgba(232, 163, 61, 0.26)' }} />
      <span className="mk-blob" style={{ width: 190, height: 190, right: -60, bottom: -70, background: 'rgba(24, 42, 32, 0.09)' }} />

      <SkeletonRow className="absolute left-8 right-8 -top-4" />

      <div className="mk-snap absolute left-1/2 top-9 -translate-x-1/2 flex items-center gap-3 px-4 py-3 w-[330px] max-w-[94%]">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
          style={{ background: '#FAECD2', color: '#96660F' }}
        >
          <Clock className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold truncate">Emma Clarke</p>
          <p className="text-[10.5px] truncate" style={{ color: 'var(--ink-soft)' }}>Event was yesterday</p>
        </div>
        <span className="mk-chip mk-chip-amber ml-auto">Review request sent</span>
      </div>

      <div className="mk-snap absolute right-5 bottom-4 -rotate-2 px-3.5 py-2.5">
        <div className="flex items-center gap-0.5" style={{ color: 'var(--marigold-deep)' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-3 w-3" fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <p className="text-[10.5px] font-semibold mt-1">New 5-star review</p>
      </div>
    </div>
  )
}
