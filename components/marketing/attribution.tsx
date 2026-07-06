'use client'

import { useEffect } from 'react'

// First-touch attribution: on the first marketing-page visit, remember where
// the visitor came from (UTM params or referrer). The signup form reads this
// and stores it on the caterer record so every account has a source.
export const FIRST_TOUCH_KEY = 'caterfy_first_touch'

export default function Attribution() {
  useEffect(() => {
    try {
      if (localStorage.getItem(FIRST_TOUCH_KEY)) return
      const p = new URLSearchParams(window.location.search)
      const source =
        p.get('utm_source') ||
        (document.referrer ? new URL(document.referrer).hostname : 'direct')
      const parts = [source, p.get('utm_medium'), p.get('utm_campaign')].filter(Boolean)
      localStorage.setItem(FIRST_TOUCH_KEY, parts.join(' / ').slice(0, 200))
    } catch {}
  }, [])
  return null
}
