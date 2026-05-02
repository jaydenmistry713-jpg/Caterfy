import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import CatererNav from './caterer-nav'
import StarRating from './star-rating'
import OrderButton from './order-button'
import { formatDate } from '@/lib/utils'

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  gallery: any[]
  reviews: any[]
}

export default function CatererPageModern({ caterer, menuItems, packages, gallery, reviews }: Props) {
  const page = caterer.page
  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null

  const primaryColor = page?.primary_color || '#1a1a2e'
  const accentColor = page?.accent_color || '#2E75B6'
  const headingStyle = { fontFamily: page?.heading_font || 'inherit' }

  const sections = [
    ...(page?.about ? [{ id: 'about', label: 'About' }] : []),
    ...((menuItems.length || packages.length) ? [{ id: 'menu', label: 'Menu' }] : []),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(reviews.length ? [{ id: 'reviews', label: 'Reviews' }] : []),
    { id: 'contact', label: 'Contact' },
    { id: 'order', label: 'Order' },
  ]

  const categories = Array.from(new Set(menuItems.map((i) => i.category || 'Menu')))

  return (
    <div style={{ fontFamily: page?.body_font || 'inherit', backgroundColor: page?.background_color || '#fff' }}>
      <CatererNav businessName={caterer.business_name} logoUrl={page?.logo_url} primaryColor={primaryColor} sections={sections} />

      {/* Hero with overlay */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        {page?.hero_image_url ? (
          <Image src={page.hero_image_url} alt={caterer.business_name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: primaryColor }} />
        )}
        <div className="absolute inset-0" style={{ background: `${primaryColor}cc` }} />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold text-white mb-4" style={headingStyle}>{caterer.business_name}</h1>
          {page?.tagline && <p className="text-xl text-white/80 max-w-2xl">{page.tagline}</p>}
          <div className="flex items-center justify-center gap-4 mt-6 text-white/70 text-sm">
            {caterer.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{caterer.location.name}</span>}
            {avgRating && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />{avgRating.toFixed(1)} ({reviews.length})</span>}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {page?.about && (
          <section id="about" className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" style={{ ...headingStyle, color: primaryColor }}>About</h2>
            <p className="text-gray-600 leading-relaxed">{page.about}</p>
          </section>
        )}

        {(menuItems.length > 0 || packages.length > 0) && (
          <section id="menu">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ ...headingStyle, color: primaryColor }}>Menu & Services</h2>
            {packages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                      <span className="font-bold text-lg" style={{ color: accentColor }}>£{Number(pkg.price).toFixed(2)}</span>
                    </div>
                    {pkg.description && <p className="text-sm text-gray-500">{pkg.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {categories.map((cat) => {
              const items = menuItems.filter((i) => (i.category || 'Menu') === cat)
              return (
                <div key={cat} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-gray-100">
                        {item.image_url && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                          <p className="text-sm font-semibold mt-1" style={{ color: accentColor }}>
                            £{Number(item.price).toFixed(2)} {item.price_unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {gallery.length > 0 && (
          <section id="gallery">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ ...headingStyle, color: primaryColor }}>Gallery</h2>
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {gallery.map((img) => (
                <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden">
                  <Image src={img.image_url} alt={img.caption || ''} width={400} height={300} className="w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section id="reviews">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ ...headingStyle, color: primaryColor }}>Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map((r) => (
                <div key={r.id} className="p-5 rounded-xl bg-gray-50">
                  <StarRating rating={r.rating} />
                  {r.review_text && <p className="text-gray-700 mt-2 text-sm">{r.review_text}</p>}
                  <p className="text-xs text-gray-400 mt-3">{r.customer_name} · {formatDate(r.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="contact">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ ...headingStyle, color: primaryColor }}>Contact</h2>
          {caterer.show_contact_publicly && (
            <div className="text-center space-y-2">
              {caterer.phone && <p className="text-gray-600">{caterer.phone}</p>}
              {caterer.email && <p className="text-gray-600">{caterer.email}</p>}
              {caterer.location && <p className="text-gray-600">{caterer.location.name}</p>}
            </div>
          )}
        </section>

        <section id="order" className="text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ ...headingStyle, color: primaryColor }}>Ready to book?</h2>
          <div className="flex justify-center">
            <OrderButton caterer={caterer} menuItems={menuItems} packages={packages} accentColor={accentColor} />
          </div>
        </section>

        {page?.terms_conditions && (
          <section>
            <h2 className="text-xl font-bold mb-4 text-center" style={{ ...headingStyle, color: primaryColor }}>Terms & Conditions</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap max-w-2xl mx-auto">{page.terms_conditions}</p>
          </section>
        )}
      </div>
    </div>
  )
}
