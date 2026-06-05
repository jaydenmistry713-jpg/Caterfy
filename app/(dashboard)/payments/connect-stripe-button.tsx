'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/utils/use-toast'
import { AlertCircle, Info } from 'lucide-react'

interface Props {
  caterererId: string
}

export default function ConnectStripeButton({ caterererId }: Props) {
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

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
    <div className="space-y-4">
      {/* Fee info */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2 text-sm text-blue-900">
        <div className="flex gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
          <div className="space-y-1.5">
            <p><strong>Stripe processing fee:</strong> 1.2% + 20p per transaction (UK cards). This is charged by Stripe on each card payment and deducted before the payout reaches your account.</p>
            <p><strong>Catering quote requests</strong> do not take payment upfront — you agree the price with the customer directly before any charge is made.</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex gap-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
        <p>Only enable card payments if you are confident you can fulfil an order. Accepting and then cancelling orders after a customer has paid may result in refund fees and disputes.</p>
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span className="text-sm text-gray-700">
          I understand the Stripe processing fees, that catering quotes don't take upfront payment, and that I should only accept orders I can fulfil.
        </span>
      </label>

      <div>
        <Button onClick={handleConnect} disabled={loading || !agreed}>
          {loading ? 'Connecting...' : 'Connect Stripe'}
        </Button>
        <p className="text-xs text-gray-400 mt-2">You'll be redirected to Stripe and then back here automatically.</p>
      </div>
    </div>
  )
}
