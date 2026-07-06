'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { slugify } from '@/lib/utils'
import { toast } from '@/lib/utils/use-toast'
import { track } from '@/lib/analytics'
import { FIRST_TOUCH_KEY } from '@/components/marketing/attribution'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', businessName: '' })

  const slugPreview = slugify(form.businessName)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const slug = slugify(form.businessName)

      // First-touch source captured on the marketing pages → stored on signup
      let signupSource: string | null = null
      try {
        signupSource = localStorage.getItem(FIRST_TOUCH_KEY)
      } catch {}

      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard?welcome=true`,
          data: {
            business_name: form.businessName,
            slug,
            ...(signupSource ? { signup_source: signupSource } : {}),
          },
        },
      })

      if (error) throw error

      track('sign_up', { method: 'email' })
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: any) {
      toast({ title: 'Signup failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              placeholder="Joe's Kitchen"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
              className="mt-1"
            />
            {slugPreview.length >= 3 && (
              <p className="text-xs mt-1.5 text-gray-500">
                Your site will live at{' '}
                <span className="font-medium text-gray-900">caterfy.com/{slugPreview}</span>
                {' '}(you can change this later)
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Start your free trial'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            14 days free &middot; No card required &middot; Cancel anytime
          </p>

          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-900 font-medium underline">Log in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
