import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from './review-form'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Leave a Review — Caterfy' }

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function ReviewPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500">Invalid review link.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id, customer_name, caterer_id, status, caterer:caterers(business_name)')
    .eq('id', orderId)
    .single()

  if (!order || !['accepted', 'completed'].includes(order.status)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">This review link is not valid or the order isn't eligible for a review.</p>
        </div>
      </div>
    )
  }

  // Check if review already exists
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', orderId)
    .single()

  if (existing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Review already submitted</h1>
          <p className="text-gray-500">Thank you for your feedback!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            How was {(order as any).caterer?.business_name}?
          </h1>
          <p className="text-gray-500">Hi {order.customer_name} — share your experience to help others.</p>
        </div>
        <ReviewForm
          orderId={order.id}
          catererId={order.caterer_id}
          customerName={order.customer_name}
        />
      </div>
    </div>
  )
}
