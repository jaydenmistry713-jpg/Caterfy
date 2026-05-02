import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PRICES = {
  UK: { amount: 1000, currency: 'gbp' }, // £10.00
  US: { amount: 1200, currency: 'usd' }, // $12.00
}
