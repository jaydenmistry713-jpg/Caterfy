import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="app-theme min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="font-mono-brand text-xs tracking-[0.2em] uppercase text-[color:var(--marigold-deep)] mb-4">
        Error 404
      </p>
      <h1 className="font-display text-6xl text-[color:var(--basil)] mb-4">Nothing on the menu here</h1>
      <p className="text-xl text-[color:var(--ink-soft)] mb-8">This page doesn&rsquo;t exist.</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/directory">Browse caterers</Link>
        </Button>
      </div>
    </div>
  )
}
