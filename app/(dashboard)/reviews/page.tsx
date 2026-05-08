import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReviewsList from './reviews-list'

export default async function ReviewsPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('caterer_id', user.id)
    .order('created_at', { ascending: false })

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">
            {reviews?.length || 0} reviews{avgRating ? ` · ${avgRating} avg. rating` : ''}
          </p>
        </div>
      </div>
      <ReviewsList reviews={reviews || []} caterererId={user.id} />
    </div>
  )
}
