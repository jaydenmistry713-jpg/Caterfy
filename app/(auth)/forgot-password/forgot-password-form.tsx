'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/lib/utils/use-toast'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      toast({ title: 'Could not send reset email', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
          <p className="font-medium text-[color:var(--ink)]">Check your email</p>
          <p className="text-sm text-[color:var(--ink-soft)] mt-2">
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
            Don&rsquo;t forget to check your spam folder.
          </p>
          <Link href="/login" className="inline-block mt-5 text-sm underline text-[color:var(--ink)]">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Remembered it?{' '}
            <Link href="/login" className="text-gray-900 font-medium underline">Log in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
