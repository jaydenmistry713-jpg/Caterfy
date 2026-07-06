import { Metadata } from 'next'
import { Suspense } from 'react'
import VerifyEmailContent from './verify-email-content'

export const metadata: Metadata = {
  title: 'Check your email — Caterfy',
  robots: { index: false },
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
