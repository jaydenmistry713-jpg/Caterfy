'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X, ExternalLink,
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Palette,
  Images, Star, Calendar, BarChart2, CreditCard, FileText, Settings, Tag } from 'lucide-react'
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
  { href: '/discount-codes', icon: Tag, label: 'Discount Codes' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  caterer: any
}

export default function DashboardTopbar({ caterer }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="bg-[color:var(--surface)] border-b border-[color:var(--border-light)] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-[color:var(--cream-2)] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-[color:var(--ink)]" />
          </button>
          <div className="lg:hidden font-display text-xl text-[color:var(--basil)]">Caterfy</div>
        </div>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {caterer && (
            <span className="hidden sm:block text-sm text-[color:var(--ink-soft)]">{caterer.email}</span>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[color:var(--surface)] flex flex-col shadow-xl">
            <div className="p-5 border-b border-[color:var(--border-light)] flex items-center justify-between">
              <div>
                <p className="font-display text-xl text-[color:var(--basil)]">Caterfy</p>
                {caterer?.business_name && (
                  <p className="text-sm text-[color:var(--ink-soft)] truncate">{caterer.business_name}</p>
                )}
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[color:var(--cream-2)]">
                <X className="h-5 w-5 text-[color:var(--ink-soft)]" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      active ? 'bg-[color:var(--basil)] text-[color:var(--cream)]' : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--cream-2)] hover:text-[color:var(--ink)]'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {caterer?.slug && (
              <div className="p-4 border-t border-[color:var(--border-light)]">
                <Link
                  href={`/${caterer.slug}`}
                  target="_blank"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View my site
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
