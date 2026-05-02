import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Use onboarding@resend.dev until a custom domain is verified in Resend.
// Once verified, set RESEND_FROM_DOMAIN=caterfy.com in Netlify env vars.
const domain = process.env.RESEND_FROM_DOMAIN
export const FROM_EMAIL = domain ? `Caterfy <hello@${domain}>` : 'Caterfy <onboarding@resend.dev>'
export const ORDERS_EMAIL = domain ? `Caterfy Orders <orders@${domain}>` : 'Caterfy <onboarding@resend.dev>'
