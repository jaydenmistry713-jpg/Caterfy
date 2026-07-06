// Canonical site URL + support contact, shared across pages, emails and links.
// NEXT_PUBLIC_APP_URL should be set to the production domain in Netlify.
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://caterfy.netlify.app'
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'hello@caterfy.com'

// UTM-tagged link used by "Powered by Caterfy" footers on caterer sites.
export function poweredByUrl(slug?: string | null) {
  const params = new URLSearchParams({
    utm_source: 'powered-by',
    utm_medium: 'caterer-site',
    ...(slug ? { utm_campaign: slug } : {}),
  })
  return `${SITE_URL}/?${params.toString()}`
}
