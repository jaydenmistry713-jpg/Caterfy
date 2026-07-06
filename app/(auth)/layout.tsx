import Link from 'next/link'
import { Check } from 'lucide-react'

const REASSURANCES = ['14-day free trial', 'No card required', 'Cancel anytime']

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-theme min-h-screen flex flex-col">
      <nav className="py-4 px-6 border-b border-[color:var(--border-light)] bg-[color:var(--surface)]">
        <Link href="/" className="font-display text-2xl text-[color:var(--basil)]">Caterfy</Link>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {REASSURANCES.map((r) => (
            <span key={r} className="inline-flex items-center gap-1.5 text-xs text-[color:var(--ink-soft)]">
              <Check className="h-3.5 w-3.5 text-[color:var(--marigold-deep)]" strokeWidth={2.5} />
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
