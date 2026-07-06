'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'

// Consent-gated Google Analytics (UK PECR/GDPR): GA only loads after the
// visitor accepts. The choice is stored in localStorage and the banner never
// shows again either way.
const CONSENT_KEY = 'caterfy_cookie_consent' // 'granted' | 'denied'

export default function CookieConsent({ gaId }: { gaId?: string }) {
  // 'unresolved' until hydration so the server and first client render match
  const [choice, setChoice] = useState<'unresolved' | 'granted' | 'denied' | 'unset'>('unresolved')

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    setChoice(stored === 'granted' || stored === 'denied' ? stored : 'unset')
  }, [])

  function decide(value: 'granted' | 'denied') {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {}
    setChoice(value)
  }

  return (
    <>
      {gaId && choice === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {choice === 'unset' && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 rounded-2xl p-5 shadow-xl"
          style={{ background: 'var(--basil, #182A20)', color: 'var(--cream, #F7F2E7)' }}
        >
          <p className="text-sm font-semibold">Cookies</p>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ opacity: 0.85 }}>
            We&rsquo;d like to use analytics cookies to understand how people use Caterfy.
            No advertising, no selling data.{' '}
            <Link href="/cookies" className="underline">Cookie policy</Link>
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => decide('granted')}
              className="flex-1 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: 'var(--marigold, #E8A33D)', color: 'var(--basil, #182A20)' }}
            >
              Accept
            </button>
            <button
              onClick={() => decide('denied')}
              className="flex-1 rounded-full px-4 py-2 text-sm font-semibold border"
              style={{ borderColor: 'rgba(247,242,231,0.35)', color: 'var(--cream, #F7F2E7)' }}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  )
}
