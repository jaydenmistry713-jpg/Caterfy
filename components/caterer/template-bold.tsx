import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import CatererNav from './caterer-nav'
import StarRating from './star-rating'
import OrderButton from './order-button'
import CertificationBadges from './certification-badges'
import SendMessageForm from './send-message-form'
import StickyOrderBar from './sticky-order-bar'
import { formatDate, formatPriceUnit } from '@/lib/utils'
import { poweredByUrl } from '@/lib/site'

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  gallery: any[]
  reviews: any[]
}

export default function CatererPageBold({ caterer, menuItems, packages, gallery, reviews }: Props) {
  const page = caterer.page
  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null

  const primaryColor = page?.primary_color || '#e63946'
  const accentColor = page?.accent_color || '#2E75B6'
  const headingStyle = { fontFamily: page?.heading_font || 'inherit' }
  const categories = Array.from(new Set(menuItems.map((i) => i.category || 'Menu')))

  const sections = [
    ...(page?.about ? [{ id: 'about', label: 'About' }] : []),
    ...((menuItems.length || packages.length) ? [{ id: 'menu', label: 'Menu' }] : []),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(reviews.length ? [{ id: 'reviews', label: 'Reviews' }] : []),
    { id: 'order', label: 'Order' },
  ]

  return (
    <div style={{ fontFamily: page?.body_font || 'inherit' }}>
      <CatererNav businessName={caterer.business_name} logoUrl={page?.logo_url} primaryColor={primaryColor} sections={sections} />

      {/* Bold hero — uses the hero image as a backdrop when one is set */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ backgroundColor: primaryColor }}>
        {page?.hero_image_url && (
          <>
            <Image src={page.hero_image_url} alt={caterer.business_name} fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: primaryColor, opacity: 0.72 }} />
          </>
        )}
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-6xl sm:text-8xl font-black text-white mb-4" style={headingStyle}>
            {caterer.business_name}
          </h1>
          {page?.tagline && <p className="text-2xl text-white/80">{page.tagline}</p>}
          <div className="flex items-center gap-4 mt-6">
            {caterer.location && (
              <span className="flex items-center gap-1 text-white/70 text-sm">
                <MapPin className="h-4 w-4" />{caterer.location.name}
              </span>
            )}
            {avgRating && (
              <span className="flex items-center gap-1 text-white/70 text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />{avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <CertificationBadges certifications={page?.template_data?.certifications || []} dark />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {page?.about && (
          <section id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {page?.hero_image_url && (
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image src={page.hero_image_url} alt={caterer.business_name} fill className="object-cover" />
              </div>
            )}
            <div>
              <h2 className="text-4xl font-black mb-6" style={{ ...headingStyle, color: primaryColor }}>About Us</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{page.about}</p>
            </div>
          </section>
        )}

        {(menuItems.length > 0 || packages.length > 0) && (
          <section id="menu">
            <h2 className="text-4xl font-black mb-10" style={{ ...headingStyle, color: primaryColor }}>Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="rounded-2xl overflow-hidden border-2" style={{ borderColor: primaryColor }}>
                  <div className="p-1 flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
                    <p className="text-white text-xs font-bold uppercase px-2">Package</p>
                    {pkg.is_popular && <p className="text-xs font-bold uppercase px-2 text-white/90">★ Popular</p>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-xl text-gray-900 mb-1">{pkg.name}</h3>
                    {pkg.description && <p className="text-sm text-gray-500 mb-3">{pkg.description}</p>}
                    <p className="text-3xl font-black" style={{ color: primaryColor }}>£{Number(pkg.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {menuItems.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
                  {item.image_url && (
                    <div className="relative aspect-video">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    <p className="font-black text-xl mt-2" style={{ color: primaryColor }}>
                      £{Number(item.price).toFixed(2)}
                      {formatPriceUnit(item.price_unit) && <span className="text-sm font-normal text-gray-400"> {formatPriceUnit(item.price_unit)}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section id="gallery">
            <h2 className="text-4xl font-black mb-8" style={{ ...headingStyle, color: primaryColor }}>Gallery</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {gallery.map((img) => (
                <div key={img.id} className="relative w-72 h-72 flex-shrink-0 rounded-2xl overflow-hidden snap-start">
                  <Image src={img.image_url} alt={img.caption || ''} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section id="reviews">
            <h2 className="text-4xl font-black mb-8" style={{ ...headingStyle, color: primaryColor }}>Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 6).map((r) => (
                <div key={r.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <StarRating rating={r.rating} />
                  {r.review_text && <p className="text-gray-700 mt-2">{r.review_text}</p>}
                  <p className="text-xs text-gray-400 mt-3 font-semibold uppercase">{r.customer_name}</p>
                  {r.caterer_response && (
                    <div className="mt-3 pl-3 border-l-2 border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Response from {caterer.business_name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{r.caterer_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="order" className="rounded-3xl p-10 text-white" style={{ backgroundColor: primaryColor }}>
          <h2 className="text-4xl font-black mb-4 text-center" style={headingStyle}>Ready to book?</h2>
          <p className="text-white/80 mb-8 text-center">Get in touch or place your order today.</p>
          <div className="flex justify-center mb-10">
            <OrderButton caterer={caterer} menuItems={menuItems} packages={packages} accentColor="#fff" />
          </div>
          <div className="max-w-lg mx-auto">
            <SendMessageForm caterer={caterer} accentColor="#fff" dark />
          </div>
        </section>

        {page?.terms_conditions && (
          <section>
            <h2 className="text-2xl font-black mb-4" style={{ ...headingStyle, color: primaryColor }}>Terms & Conditions</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{page.terms_conditions}</p>
          </section>
        )}
      </div>

      <footer className="py-6 text-center border-t border-gray-100">
        <a href={poweredByUrl(caterer.slug)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Powered by Caterfy — websites for independent caterers
        </a>
      </footer>
      {page?.template_data?.sticky_bar && (
        <StickyOrderBar accentColor={accentColor} phone={caterer.phone} showPhone={caterer.show_contact_publicly} />
      )}
    </div>
  )
}
