'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Palette,
  Images, Star, Calendar, BarChart2, CreditCard, FileText, Settings, ExternalLink, Tag, LifeBuoy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORT_EMAIL } from '@/lib/site'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menu & Services' },
  { href: '/site-editor', icon: Palette, label: 'Site Editor' },
  { href: '/gallery', icon: Images, label: 'Gallery' },
  { href: '/reviews', icon: Star, label: 'Reviews' },
  { href: '/availability', icon: Calendar, label: 'Availability' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
  { href: '/invoices', icon: FileText, label: 'Invoices' },
  { href: '/discount-codes', icon: Tag, label: 'Discount Codes' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  caterer: any
}

export default function DashboardSidebar({ caterer }: Props) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[color:var(--surface)] border-r border-[color:var(--border-light)] min-h-screen sticky top-0">
      <div className="p-6 border-b border-[color:var(--border-light)]">
        <Link href="/" className="font-display text-2xl text-[color:var(--basil)]">Caterfy</Link>
        {caterer && (
          <p className="text-sm text-[color:var(--ink-soft)] mt-1 truncate">{caterer.business_name}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-[color:var(--basil)] text-[color:var(--cream)]'
                  : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--cream-2)] hover:text-[color:var(--ink)]'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[color:var(--border-light)] space-y-2">
        {caterer?.slug && (
          <Link
            href={`/${caterer.slug}`}
            target="_blank"
            className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View my site
          </Link>
        )}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors"
        >
          <LifeBuoy className="h-4 w-4" />
          Need help? Email us
        </a>
      </div>
    </aside>
  )
}
