import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="h-8 w-8 text-gray-700" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
      <p className="text-gray-500 mb-6">
        We've sent a verification link to your email address. Click the link to activate your account.
      </p>
      <p className="text-sm text-gray-400">
        Already verified?{' '}
        <Link href="/login" className="text-gray-900 underline">Log in</Link>
      </p>
    </div>
  )
}
