import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-theme min-h-screen flex flex-col">
      <nav className="py-4 px-6 border-b border-[color:var(--border-light)] bg-[color:var(--surface)]">
        <Link href="/" className="font-display text-2xl text-[color:var(--basil)]">Caterfy</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
