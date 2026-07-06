import type { Metadata } from 'next'
import { Young_Serif, Figtree, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import CookieConsent from '@/components/ui/cookie-consent'
import { SITE_URL, SUPPORT_EMAIL } from '@/lib/site'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Brand fonts, loaded once for the whole app (marketing + dashboard + auth…)
const youngSerif = Young_Serif({ weight: '400', subsets: ['latin'], variable: '--font-young-serif', display: 'swap' })
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })
const plexMono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-plex-mono', display: 'swap' })

const TITLE = 'Caterfy — Websites, orders & payments for independent caterers'
const DESCRIPTION =
  'Get a professional catering website with built-in orders, quotes, invoices and payments. £10/month flat, no commission, 14-day free trial — no card required.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s',
  },
  description: DESCRIPTION,
  keywords: [
    'catering website builder', 'catering order form', 'catering software',
    'website for catering business', 'catering invoices', 'caterers', 'catering',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Caterfy',
    url: '/',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Caterfy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
}

// Organization + WebSite structured data, site-wide
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Caterfy',
      url: SITE_URL,
      email: SUPPORT_EMAIL,
      logo: `${SITE_URL}/icon.png`,
      description: 'Websites, orders and payments for independent caterers.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Caterfy',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${youngSerif.variable} ${figtree.variable} ${plexMono.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
        {/* Cookie banner + consent-gated Google Analytics */}
        <CookieConsent gaId={GA_ID} />
      </body>
    </html>
  )
}
