'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/utils/use-toast'

interface Props {
  caterererId: string
}

export default function ConnectStripeButton({ caterererId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caterererId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Connect Stripe'}
    </Button>
  )
}
