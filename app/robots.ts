import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/mistuzzo',
          '/dashboard',
          '/orders',
          '/menu',
          '/site-editor',
          '/gallery',
          '/reviews',
          '/availability',
          '/analytics',
          '/payments',
          '/invoices',
          '/discount-codes',
          '/settings',
          '/verify-email',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
