'use client'

import { loadStripe, type Stripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'

// Single Stripe.js instance for the whole app (loaded lazily on first use).
let stripePromise: Promise<Stripe | null> | null = null
function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
  }
  return stripePromise
}

export default function InlineCardCheckout({ clientSecret }: { clientSecret: string }) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <p className="text-sm text-red-600 text-center py-4">
        Card payment is temporarily unavailable. Please choose another payment method.
      </p>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
