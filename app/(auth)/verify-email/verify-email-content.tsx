'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'

export default function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  async function resend() {
    if (!email || cooldown > 0) return
    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard?welcome=true`,
        },
      })
      if (error) throw error
      toast({ title: 'Verification email resent', variant: 'success' })
      setCooldown(60)
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) clearInterval(timer)
          return c - 1
        })
      }, 1000)
    } catch (err: any) {
      toast({ title: 'Could not resend', description: err.message, variant: 'destructive' })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="w-16 h-16 bg-[color:var(--cream-2)] rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="h-8 w-8 text-[color:var(--basil)]" />
      </div>
      <h1 className="text-2xl font-bold text-[color:var(--ink)] mb-3">Check your email</h1>
      <p className="text-[color:var(--ink-soft)] mb-2">
        We&rsquo;ve sent a verification link{email ? <> to <strong className="text-[color:var(--ink)]">{email}</strong></> : ' to your email address'}.
        Click it to activate your account.
      </p>
      <p className="text-sm text-[color:var(--ink-soft)] mb-6">
        Nothing arrived after a couple of minutes? Check your spam folder.
      </p>

      {email && (
        <button
          onClick={resend}
          disabled={resending || cooldown > 0}
          className="text-sm font-medium underline text-[color:var(--ink)] disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : resending ? 'Resending…' : 'Resend verification email'}
        </button>
      )}

      <p className="text-sm text-[color:var(--ink-soft)] mt-6">
        Already verified?{' '}
        <Link href="/login" className="text-[color:var(--ink)] underline">Log in</Link>
      </p>
    </div>
  )
}
