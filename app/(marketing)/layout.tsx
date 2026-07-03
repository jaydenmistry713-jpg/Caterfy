import MarketingNav from '@/components/marketing/nav'
import MarketingFooter from '@/components/marketing/footer'
import './marketing.css'

// Brand fonts (Young Serif / Figtree / IBM Plex Mono) are loaded globally in
// the root layout and exposed as CSS variables, which .mk-root consumes.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk-root flex flex-col flex-1">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
