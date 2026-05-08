'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Send } from 'lucide-react'

interface Props {
  caterer: any
  accentColor: string
  dark?: boolean
}

export default function SendMessageForm({ caterer, accentColor, dark = false }: Props) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caterer_id: caterer.id,
          sender_name: form.name,
          sender_email: form.email,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className={`flex flex-col items-center gap-3 py-6 text-center ${dark ? 'text-white/80' : 'text-gray-600'}`}>
        <CheckCircle className="h-8 w-8 text-green-500" />
        <p className="font-medium">Message sent!</p>
        <p className="text-sm opacity-70">
          We&apos;ve sent a confirmation to {form.email}. {caterer.business_name} will be in touch soon.
        </p>
      </div>
    )
  }

  const inputClass = dark
    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50'
    : ''

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label className={dark ? 'text-white/70' : ''}>Your name *</Label>
          <Input
            className={`mt-1 ${inputClass}`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label className={dark ? 'text-white/70' : ''}>Email address *</Label>
          <Input
            className={`mt-1 ${inputClass}`}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <Label className={dark ? 'text-white/70' : ''}>Message *</Label>
        <Textarea
          className={`mt-1 ${inputClass}`}
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Ask about availability, menus, or anything else..."
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading || !form.name || !form.email || !form.message}
        className="flex items-center gap-2"
        style={{ backgroundColor: accentColor }}
      >
        <Send className="h-4 w-4" />
        {loading ? 'Sending...' : 'Send Message'}
      </Button>
      <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>
        You&apos;ll receive a copy of your message by email.
      </p>
    </form>
  )
}
