// Thin GA4 event helper. No-ops when GA hasn't loaded (no consent, no ID, SSR).
export function track(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (typeof gtag === 'function') gtag('event', event, params || {})
}
