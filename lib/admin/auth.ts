import crypto from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'caterfy_admin'

// The admin cookie holds an HMAC of the admin password keyed by a server secret.
// An attacker can't forge it without knowing ADMIN_PASSWORD, and it never exposes
// the password itself. Set ADMIN_PASSWORD in your env (Netlify + .env.local).
function serverSecret() {
  return process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'caterfy-admin-fallback'
}

export function adminToken() {
  const pw = process.env.ADMIN_PASSWORD || ''
  return crypto.createHmac('sha256', serverSecret()).update(pw).digest('hex')
}

export function isAdminConfigured() {
  return !!process.env.ADMIN_PASSWORD
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

export function verifyAdminPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return false
  return safeEqual(input, pw)
}

export async function isAdminAuthenticated() {
  if (!isAdminConfigured()) return false
  const store = await cookies()
  const value = store.get(ADMIN_COOKIE)?.value
  if (!value) return false
  return safeEqual(value, adminToken())
}
