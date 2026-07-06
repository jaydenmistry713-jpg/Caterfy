import { Metadata } from 'next'
import ResetPasswordForm from './reset-password-form'

export const metadata: Metadata = {
  title: 'Choose a new password — Caterfy',
  robots: { index: false },
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--ink)]">Choose a new password</h1>
        <p className="text-[color:var(--ink-soft)] mt-2 text-sm">
          You&rsquo;re signed in via your reset link — set a new password below.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}
