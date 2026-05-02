'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Palette,
  Images, Star, Calendar, BarChart2, CreditCard, FileText, Settings, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { href: '/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  caterer: any
}

export default function DashboardSidebar({ caterer }: Props) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="text-xl font-bold text-gray-900">Caterfy</Link>
        {caterer && (
          <p className="text-sm text-gray-500 mt-1 truncate">{caterer.business_name}</p>
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
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {caterer?.slug && (
        <div className="p-4 border-t border-gray-200">
          <Link
            href={`/${caterer.slug}`}
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View my site
          </Link>
        </div>
      )}
    </aside>
  )
}
