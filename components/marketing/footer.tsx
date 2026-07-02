import Link from 'next/link'

const links = [
  { href: '/directory', label: 'Browse caterers' },
  { href: '/faq', label: 'FAQs' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
]

export default function MarketingFooter() {
  return (
    <footer style={{ background: 'var(--basil)', color: 'var(--cream)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="mk-display text-xl" style={{ color: 'var(--cream)' }}>
          Caterfy
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-opacity hover:opacity-100"
              style={{ color: 'var(--cream)', opacity: 0.7 }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mk-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--cream)', opacity: 0.5 }}>
          © {new Date().getFullYear()} Caterfy
        </p>
      </div>
    </footer>
  )
}
