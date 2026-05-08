import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Mail, Star } from 'lucide-react'
import CatererNav from './caterer-nav'
import StarRating from './star-rating'
import OrderButton from './order-button'
import ExpandableMenuItem from './expandable-menu-item'
import CertificationBadges from './certification-badges'
import SendMessageForm from './send-message-form'
import { formatDate } from '@/lib/utils'

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  gallery: any[]
  reviews: any[]
}

export default function CatererPageClassic({ caterer, menuItems, packages, gallery, reviews }: Props) {
  const page = caterer.page
  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null

  const headingStyle = { fontFamily: page?.heading_font || 'inherit' }
  const bodyStyle = { fontFamily: page?.body_font || 'inherit' }
  const primaryColor = page?.primary_color || '#000000'
  const accentColor = page?.accent_color || '#2E75B6'
  const bgColor = page?.background_color || '#FFFFFF'

  const categories = Array.from(new Set(menuItems.map((i) => i.category || 'Menu')))

  const sections = [
    ...(page?.about ? [{ id: 'about', label: 'About' }] : []),
    ...((menuItems.length || packages.length) ? [{ id: 'menu', label: 'Menu' }] : []),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(reviews.length ? [{ id: 'reviews', label: 'Reviews' }] : []),
    { id: 'contact', label: 'Contact' },
    { id: 'order', label: 'Order' },
  ]

  return (
    <div style={{ backgroundColor: bgColor, ...bodyStyle }}>
      <CatererNav
        businessName={caterer.business_name}
        logoUrl={page?.logo_url}
        primaryColor={primaryColor}
        sections={sections}
      />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end">
        {page?.hero_image_url ? (
          <Image src={page.hero_image_url} alt={caterer.business_name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: primaryColor }} />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-8 sm:p-12 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={headingStyle}>
            {caterer.business_name}
          </h1>
          {page?.tagline && (
            <p className="text-xl text-white/90">{page.tagline}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            {caterer.location && (
              <span className="flex items-center gap-1 text-white/80 text-sm">
                <MapPin className="h-4 w-4" />{caterer.location.name}
              </span>
            )}
            {avgRating && (
              <span className="flex items-center gap-1 text-white/80 text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                {avgRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            )}
          </div>
          <CertificationBadges certifications={page?.template_data?.certifications || []} dark />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* About */}
        {page?.about && (
          <section id="about">
            <h2 className="text-3xl font-bold mb-6" style={{ ...headingStyle, color: primaryColor }}>
              About Us
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{page.about}</p>
          </section>
        )}

        {/* Menu */}
        {(menuItems.length > 0 || packages.length > 0) && (
          <section id="menu">
            <h2 className="text-3xl font-bold mb-8" style={{ ...headingStyle, color: primaryColor }}>
              Menu & Services
            </h2>

            {packages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Packages</h3>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="flex justify-between items-start border-b border-gray-100 pb-4">
                      <div>
                        <p className="font-semibold text-gray-900">{pkg.name}</p>
                        {pkg.description && <p className="text-sm text-gray-500 mt-0.5">{pkg.description}</p>}
                        {(pkg.min_guests || pkg.max_guests) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {pkg.min_guests && `${pkg.min_guests}`}{pkg.min_guests && pkg.max_guests && '–'}{pkg.max_guests && `${pkg.max_guests}`} guests
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 ml-4">£{Number(pkg.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categories.map((cat) => {
              const items = menuItems.filter((i) => (i.category || 'Menu') === cat)
              return (
                <div key={cat} className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">{cat}</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <ExpandableMenuItem key={item.id} item={item} variant="classic" />
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section id="gallery">
            <h2 className="text-3xl font-bold mb-8" style={{ ...headingStyle, color: primaryColor }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={img.image_url} alt={img.caption || ''} fill className="object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section id="reviews">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ ...headingStyle, color: primaryColor }}>Reviews</h2>
              {avgRating && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                  <StarRating rating={Math.round(avgRating)} />
                  <p className="text-sm text-gray-500">{reviews.length} reviews</p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {review.customer_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.customer_name}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size={3} />
                        <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {review.review_text && <p className="text-gray-700 ml-13">{review.review_text}</p>}
                  {review.caterer_response && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200 ml-13">
                      <p className="text-xs text-gray-500 mb-1">Response from {caterer.business_name}:</p>
                      <p className="text-sm text-gray-600">{review.caterer_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact">
          <h2 className="text-3xl font-bold mb-6" style={{ ...headingStyle, color: primaryColor }}>
            Contact
          </h2>
          {caterer.show_contact_publicly && (
            <div className="space-y-3 mb-6">
              {caterer.phone && (
                <a href={`tel:${caterer.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                  <Phone className="h-5 w-5" style={{ color: accentColor }} />
                  {caterer.phone}
                </a>
              )}
              {caterer.email && (
                <a href={`mailto:${caterer.email}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                  <Mail className="h-5 w-5" style={{ color: accentColor }} />
                  {caterer.email}
                </a>
              )}
              {caterer.location && (
                <p className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5" style={{ color: accentColor }} />
                  {caterer.location.name}
                </p>
              )}
            </div>
          )}
          <SendMessageForm caterer={caterer} accentColor={accentColor} />
        </section>

        {/* Order */}
        <section id="order">
          <h2 className="text-3xl font-bold mb-6" style={{ ...headingStyle, color: primaryColor }}>
            Place an Order
          </h2>
          <OrderButton
            caterer={caterer}
            menuItems={menuItems}
            packages={packages}
            accentColor={accentColor}
          />
        </section>

        {/* Terms */}
        {page?.terms_conditions && (
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ ...headingStyle, color: primaryColor }}>
              Terms & Conditions
            </h2>
            <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
              {page.terms_conditions}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-100">
        <a href="https://caterfy.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Powered by Caterfy
        </a>
      </footer>

      {/* Sticky order button (mobile) */}
      <div className="fixed bottom-4 right-4 z-40 flex gap-2 md:hidden">
        <a
          href="#order"
          className="px-5 py-3 rounded-full text-white font-semibold shadow-lg text-sm"
          style={{ backgroundColor: accentColor }}
        >
          Order Now
        </a>
      </div>
    </div>
  )
}
