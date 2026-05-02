'use client'

import { useState } from 'react'
import { Review } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { Star, MessageSquare } from 'lucide-react'

interface Props {
  reviews: Review[]
  caterererId: string
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function ReviewsList({ reviews: initialReviews, caterererId }: Props) {
  const [reviews, setReviews] = useState(initialReviews)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [saving, setSaving] = useState(false)

  async function submitResponse(reviewId: string) {
    if (!responseText.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('reviews')
      .update({
        caterer_response: responseText,
        caterer_responded_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('caterer_id', caterererId)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setReviews((prev) =>
        prev.map((r) => r.id === reviewId ? { ...r, caterer_response: responseText } : r)
      )
      toast({ title: 'Response posted', variant: 'success' })
      setRespondingTo(null)
      setResponseText('')
    }
    setSaving(false)
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">No reviews yet. They'll appear here after your first completed events.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{review.customer_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarDisplay rating={review.rating} />
                  <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                  {review.event_type && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {review.event_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {review.review_text && (
              <p className="text-gray-700 mt-2">{review.review_text}</p>
            )}

            {review.caterer_response ? (
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Your response:</p>
                <p className="text-sm text-gray-700">{review.caterer_response}</p>
              </div>
            ) : respondingTo === review.id ? (
              <div className="mt-3">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a public response..."
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => submitResponse(review.id)} disabled={saving}>
                    {saving ? 'Posting...' : 'Post response'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRespondingTo(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setRespondingTo(review.id); setResponseText('') }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Respond
              </button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
