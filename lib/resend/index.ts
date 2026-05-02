import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'Caterfy <hello@caterfy.com>'
export const ORDERS_EMAIL = 'Caterfy Orders <orders@caterfy.com>'
