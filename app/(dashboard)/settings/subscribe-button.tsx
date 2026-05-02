'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/utils/use-toast'

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="bg-green-600 hover:bg-green-700">
      {loading ? 'Redirecting...' : 'Subscribe — £10/month'}
    </Button>
  )
}
