// Netlify scheduled function: triggers the daily lifecycle cron at 09:00 UTC.
// Requires CRON_SECRET to be set in Netlify env vars (same value the API
// route checks). URL is Netlify's built-in env var for the site's address.
export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_APP_URL
  if (!base || !process.env.CRON_SECRET) {
    console.error('lifecycle-cron: missing URL or CRON_SECRET env var')
    return new Response('misconfigured', { status: 500 })
  }
  const res = await fetch(`${base}/api/cron/daily`, {
    headers: { 'x-cron-key': process.env.CRON_SECRET },
  })
  const body = await res.text()
  console.log('lifecycle-cron:', res.status, body)
  return new Response(body, { status: res.status })
}

export const config = {
  schedule: '0 9 * * *',
}
