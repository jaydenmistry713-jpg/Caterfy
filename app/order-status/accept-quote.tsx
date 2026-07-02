'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

interface QuoteLine { description: string; amount: number }

interface Props {
  referenceNumber: string
  lineItems: QuoteLine[]
  total: number
  notes?: string | null
}

export default function AcceptQuote({ referenceNumber, lineItems, total, notes }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function accept() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/quotes/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_number: referenceNumber }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not accept the quote')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-4 border-t border-gray-100">
      <p className="text-sm font-medium text-gray-700 mb-2">Your quote</p>
      <div className="rounded-lg border border-gray-200 overflow-hidden mb-3">
        {lineItems.map((l, i) => (
          <div key={i} className="flex justify-between text-sm px-3 py-2 border-b border-gray-100">
            <span className="text-gray-600">{l.description}</span>
            <span className="text-gray-900">£{Number(l.amount).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm px-3 py-2 font-semibold bg-gray-50">
          <span>Total</span>
          <span>£{Number(total).toFixed(2)}</span>
        </div>
      </div>
      {notes && <p className="text-sm text-gray-500 mb-3">{notes}</p>}
      <button
        onClick={accept}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        Accept quote
      </button>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Accepting confirms this quote and lets the caterer contact you to arrange payment and finalise your event.
      </p>
      {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
    </div>
  )
}
