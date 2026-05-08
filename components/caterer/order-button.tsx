'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import OrderForm from './order-form'
import { ShoppingBag, FileText } from 'lucide-react'

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  accentColor: string
}

export default function OrderButton({ caterer, menuItems, packages, accentColor }: Props) {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)

  const hasFixedItems = menuItems.length > 0 || packages.length > 0
  const acceptingOrders = caterer.is_accepting_orders
  const mode = caterer.business_mode || 'full'

  const showItems = mode !== 'catering_only' && hasFixedItems
  const showQuote = mode !== 'items_only'

  if (!acceptingOrders) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <p className="text-gray-500">This caterer is not currently accepting orders.</p>
        {caterer.show_contact_publicly && caterer.phone && (
          <p className="text-sm text-gray-400 mt-1">Contact them directly: {caterer.phone}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {showItems && (
        <button
          onClick={() => setShowOrderForm(true)}
          className="flex items-start gap-4 p-4 rounded-xl border-2 text-left hover:shadow-md transition-shadow"
          style={{ borderColor: accentColor }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: accentColor }}>
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Order items</p>
            <p className="text-sm text-gray-500 mt-0.5">Browse and order directly from the menu</p>
          </div>
        </button>
      )}

      {showQuote && (
        <button
          onClick={() => setShowQuoteForm(true)}
          className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Request a catering quote</p>
            <p className="text-sm text-gray-500 mt-0.5">Tell us about your event and we&apos;ll get back to you</p>
          </div>
        </button>
      )}

      {(showOrderForm || showQuoteForm) && (
        <OrderForm
          caterer={caterer}
          menuItems={menuItems}
          packages={packages}
          orderType={showOrderForm ? 'fixed' : 'quote'}
          onClose={() => { setShowOrderForm(false); setShowQuoteForm(false) }}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}
