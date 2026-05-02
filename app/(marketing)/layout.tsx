import MarketingNav from '@/components/marketing/nav'
import MarketingFooter from '@/components/marketing/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  )
}
