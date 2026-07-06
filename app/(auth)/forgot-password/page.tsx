import { Metadata } from 'next'
import ForgotPasswordForm from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset your password — Caterfy',
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--ink)]">Reset your password</h1>
        <p className="text-[color:var(--ink-soft)] mt-2 text-sm">
          Enter the email you signed up with and we&rsquo;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
