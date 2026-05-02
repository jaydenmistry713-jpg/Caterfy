import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DirectorySearch from '@/components/customer/directory-search'
import { createClient } from '@/lib/supabase/server'
import CatererCard from '@/components/customer/caterer-card'
import { Star, Globe, ShoppingBag, TrendingUp } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredCaterers } = await supabase
    .from('caterers')
    .select(`
      *,
      location:locations(*),
      page:caterer_pages(*),
      caterer_cuisines(cuisine:cuisines(*))
    `)
    .eq('subscription_status', 'active')
    .limit(6)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Find the perfect caterer<br />for your event
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Browse professional caterers for weddings, corporate events, parties and more.
          </p>
          <DirectorySearch />
          <p className="mt-4 text-sm text-gray-400">
            Are you a caterer?{' '}
            <Link href="/signup" className="text-white underline underline-offset-2">
              Build your site from £10/month →
            </Link>
          </p>
        </div>
      </section>

      {/* Featured caterers */}
      {featuredCaterers && featuredCaterers.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Caterers</h2>
              <Link href="/directory" className="text-sm text-gray-600 hover:text-gray-900 underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCaterers.map((caterer: any) => (
                <CatererCard key={caterer.id} caterer={caterer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works for customers */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Search', desc: 'Filter by location, cuisine, event type and dietary requirements.' },
              { step: '2', title: 'Choose', desc: 'Browse caterer profiles, menus, photos and reviews.' },
              { step: '3', title: 'Book', desc: 'Place an order or request a custom quote directly.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For caterers CTA */}
      <section id="pricing" className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Are you a caterer?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Get a professional website, reach new customers, and manage orders — all in one place.
          </p>
          <div className="bg-white/10 rounded-2xl p-8 inline-block mb-8">
            <div className="text-5xl font-bold mb-2">£10<span className="text-2xl font-normal text-gray-300">/month</span></div>
            <p className="text-gray-300 mb-6">14-day free trial · No setup fee · Cancel anytime</p>
            <ul className="text-left space-y-2 mb-8 text-sm">
              {[
                'Professional website with 3 templates',
                'Built-in directory listing',
                'Order & quote management',
                'Online payments via Stripe',
                'Gallery, reviews & analytics',
                'Custom domain support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild size="xl" className="bg-white text-gray-900 hover:bg-gray-100 w-full">
              <Link href="/signup">Start your free trial</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <Globe className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Works on any device</p>
            </div>
            <div>
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">No platform fees</p>
            </div>
            <div>
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Built for caterers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
