import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency: 'GBP' | 'USD' = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Human-readable suffix shown after a price on public pages.
// 'flat' shows nothing (just the price); everything else is spelled out in full.
export function formatPriceUnit(unit?: string | null): string {
  switch (unit) {
    case 'per person':
      return 'per person'
    case 'per item':
      return 'per item'
    case 'per meal':
      return 'per meal'
    case 'flat':
    case '':
    case null:
    case undefined:
      return ''
    default:
      return unit
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40)
}

export function generateOrderReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'CAT-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count).padStart(5, '0')}`
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const RESERVED_SLUGS = new Set([
  'admin', 'login', 'signup', 'dashboard', 'api', 'settings', 'help',
  'support', 'about', 'contact', 'terms', 'privacy', 'menu', 'order',
  'search', 'directory', 'mistuzzo', 'browse', 'explore', 'find',
  'caterers', 'home', 'index', 'app', 'account', 'profile', 'billing',
  'payments', 'invoices', 'orders', 'reviews', 'gallery', 'services',
  'pricing', 'blog', 'news', 'faq', 'legal', 'cookies', 'sitemap',
  'guides', 'review', 'order-status', 'verify-email', 'forgot-password',
  'reset-password', 'availability', 'analytics', 'discount-codes',
  'site-editor', 'robots', 'og-image', 'demo',
])

export function validateSlug(slug: string): string | null {
  if (slug.length < 3) return 'Slug must be at least 3 characters'
  if (slug.length > 40) return 'Slug must be 40 characters or fewer'
  if (!/^[a-z]/.test(slug)) return 'Slug must start with a letter'
  if (!/^[a-z0-9-]+$/.test(slug)) return 'Slug can only contain lowercase letters, numbers, and hyphens'
  if (RESERVED_SLUGS.has(slug)) return 'This URL is reserved'
  return null
}

export const GOOGLE_FONTS = [
  'Playfair Display', 'Merriweather', 'Cormorant Garamond', 'EB Garamond',
  'Lora', 'Inter', 'Poppins', 'Raleway', 'Nunito', 'Montserrat',
  'Open Sans', 'Roboto', 'Oswald', 'Bebas Neue', 'Anton',
  'Dancing Script', 'Pacifico', 'Great Vibes', 'Sacramento', 'Satisfy',
]
