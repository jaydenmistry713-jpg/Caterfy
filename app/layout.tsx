import type { Metadata } from 'next'
import Script from 'next/script'
import { Young_Serif, Figtree, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Brand fonts, loaded once for the whole app (marketing + dashboard + auth…)
const youngSerif = Young_Serif({ weight: '400', subsets: ['latin'], variable: '--font-young-serif', display: 'swap' })
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })
const plexMono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-plex-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Caterfy — Find & Book Catering Services',
  description: 'Discover professional caterers for weddings, corporate events, and more. Build your catering website for just £10/month.',
  keywords: 'catering, caterers, food, events, wedding catering, corporate catering',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${youngSerif.variable} ${figtree.variable} ${plexMono.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster />
        {/* Google Analytics — only loads when NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
