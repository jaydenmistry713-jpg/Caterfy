'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import OrderForm from './order-form'

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
    <div>
      <div className="flex gap-3 flex-wrap">
        {hasFixedItems && (
          <Button
            size="lg"
            onClick={() => setShowOrderForm(true)}
            style={{ backgroundColor: accentColor, borderColor: accentColor }}
          >
            Order Now
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowQuoteForm(true)}
          style={{ borderColor: accentColor, color: accentColor }}
        >
          Request Quote
        </Button>
      </div>

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
