'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Star, CheckCircle } from 'lucide-react'
import { toast } from '@/lib/utils/use-toast'

interface Props {
  orderId: string
  catererId: string
  customerName: string
}

export default function ReviewForm({ orderId, catererId, customerName }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { toast({ title: 'Please select a rating', variant: 'destructive' }); return }
    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          caterer_id: catererId,
          customer_name: customerName,
          rating,
          review_text: reviewText.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-500">Your review has been published.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Your rating</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${s <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Your review <span className="text-gray-400">(optional)</span></p>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Describe your experience..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{reviewText.length}/1000</p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting || !rating}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Your review will be published immediately and displayed publicly.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
