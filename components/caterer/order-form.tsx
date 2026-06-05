'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/lib/utils/use-toast'
import { generateOrderReference } from '@/lib/utils'
import { CheckCircle, Tag, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  price_unit: string
  quantity: number
}

interface Props {
  caterer: any
  menuItems: any[]
  packages: any[]
  orderType: 'fixed' | 'quote'
  onClose: () => void
  accentColor: string
}

export default function OrderForm({ caterer, menuItems, packages, orderType, onClose, accentColor }: Props) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [showExtraDetails, setShowExtraDetails] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountValidating, setDiscountValidating] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; label: string } | null>(null)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_date: '',
    event_time: '',
    event_location: '',
    event_type: '',
    guest_count: '',
    special_requests: '',
    dietary_requirements: '',
    additional_comments: '',
    payment_method: 'card',
  })

  function adjustQuantity(item: any, delta: number) {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        const newQty = existing.quantity + delta
        if (newQty <= 0) return prev.filter((i) => i.id !== item.id)
        if (delta > 0 && item.stock_limit != null && newQty > item.stock_limit) return prev
        return prev.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i)
      }
      if (delta > 0) {
        if (item.stock_limit != null && item.stock_limit < 1) return prev
        return [...prev, { id: item.id, name: item.name, price: item.price, price_unit: item.price_unit || 'flat', quantity: 1 }]
      }
      return prev
    })
  }

  function getQty(id: string) {
    return selectedItems.find((i) => i.id === id)?.quantity || 0
  }

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal - (appliedDiscount?.amount || 0)

  async function applyDiscount() {
    if (!discountCode.trim()) return
    setDiscountValidating(true)
    try {
      const res = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), caterer_id: caterer.id, order_total: subtotal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const label = data.discount_type === 'percent'
        ? `${data.discount_value}% off`
        : `£${Number(data.discount_value).toFixed(2)} off`
      setAppliedDiscount({ code: discountCode.trim().toUpperCase(), amount: data.discount_amount, label })
      toast({ title: `Discount applied: ${label}`, variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Invalid code', description: err.message, variant: 'destructive' })
    } finally {
      setDiscountValidating(false)
    }
  }

  async function submitOrder() {
    setLoading(true)
    try {
      const reference = generateOrderReference()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caterer_id: caterer.id,
          reference_number: reference,
          order_type: orderType,
          ...form,
          guest_count: form.guest_count ? parseInt(form.guest_count) : null,
          items: orderType === 'fixed' ? selectedItems.map(({ id, name, quantity, price, price_unit }) => ({ item_id: id, name, quantity, price, price_unit })) : null,
          subtotal: orderType === 'fixed' ? subtotal : null,
          total: orderType === 'fixed' ? total : null,
          discount_code: appliedDiscount?.code || null,
          discount_amount: appliedDiscount?.amount || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit order')

      setRefNumber(reference)
      setSubmitted(true)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order submitted!</h3>
            <p className="text-gray-500 mb-2">Your reference number is:</p>
            <p className="text-2xl font-mono font-bold text-gray-900 mb-4">{refNumber}</p>
            {form.payment_method === 'bank_transfer' && caterer.bank_transfer_details ? (
              <div className="mt-2 text-left bg-gray-50 rounded-lg p-3 w-full">
                <p className="text-sm font-medium text-gray-900 mb-1">Bank transfer details:</p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">{caterer.bank_transfer_details}</pre>
              </div>
            ) : form.payment_method === 'offline' ? (
              <p className="text-sm text-gray-500">The caterer will contact you to arrange payment once your order is confirmed.</p>
            ) : (
              <p className="text-sm text-gray-500">A confirmation email has been sent to {form.customer_email}.</p>
            )}
            <Button onClick={onClose} className="mt-6" style={{ backgroundColor: accentColor }}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {orderType === 'quote' ? 'Request a Quote' : `Order from ${caterer.business_name}`}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2 mb-4">
          {(orderType === 'fixed' ? [1, 2, 3] : [1, 2]).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-gray-900' : 'bg-gray-200'}`}
              style={{ backgroundColor: step >= s ? accentColor : undefined }}
            />
          ))}
        </div>

        {/* Step 1: Select items (fixed only) */}
        {orderType === 'fixed' && step === 1 && (
          <div className="space-y-4">
            <p className="font-medium text-gray-900">Select items</p>

            {packages.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Packages</p>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-sm">{pkg.name}</p>
                      <p className="text-xs text-gray-500">£{Number(pkg.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustQuantity(pkg, -1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-100">−</button>
                      <span className="w-5 text-center text-sm">{getQty(pkg.id)}</span>
                      <button onClick={() => adjustQuantity(pkg, 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-100">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {menuItems.length > 0 && (() => {
              const categories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category || 'Other')))]
              const visible = categoryFilter === 'All' ? menuItems : menuItems.filter((i) => (i.category || 'Other') === categoryFilter)
              return (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Menu items</p>
                  {categories.length > 2 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            categoryFilter === cat
                              ? 'border-transparent text-white'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'
                          }`}
                          style={categoryFilter === cat ? { backgroundColor: accentColor } : undefined}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                  {visible.map((item) => {
                    const qty = getQty(item.id)
                    const atLimit = item.stock_limit != null && qty >= item.stock_limit
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">£{Number(item.price).toFixed(2)} {item.price_unit}</p>
                          {item.stock_limit != null && (
                            <p className="text-xs text-orange-500">{item.stock_limit - qty} remaining</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => adjustQuantity(item, -1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-100">−</button>
                          <span className="w-5 text-center text-sm">{qty}</span>
                          <button
                            onClick={() => adjustQuantity(item, 1)}
                            disabled={atLimit}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >+</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {selectedItems.length > 0 && (
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between items-center text-green-700 text-sm">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />{appliedDiscount.code} ({appliedDiscount.label})
                      <button onClick={() => setAppliedDiscount(null)} className="ml-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    </span>
                    <span>−£{appliedDiscount.amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={selectedItems.length === 0} style={{ backgroundColor: accentColor }}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 (fixed): checkout-style contact details */}
        {orderType === 'fixed' && step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Full name *</Label>
                <Input className="mt-1" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input className="mt-1" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input className="mt-1" type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Date *</Label>
                <Input className="mt-1" type="date" min={new Date().toISOString().split('T')[0]} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
            </div>

            {/* Optional event details toggle */}
            <button
              type="button"
              onClick={() => setShowExtraDetails((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1"
            >
              {showExtraDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showExtraDetails ? 'Hide extra details' : 'Add event details (optional)'}
            </button>

            {showExtraDetails && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label>Event time</Label>
                  <Input className="mt-1" type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
                </div>
                <div>
                  <Label>Number of guests</Label>
                  <Input className="mt-1" type="number" min="1" value={form.guest_count} onChange={(e) => setForm({ ...form, guest_count: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Venue / delivery address</Label>
                  <Input className="mt-1" placeholder="Address or venue name" value={form.event_location} onChange={(e) => setForm({ ...form, event_location: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Dietary requirements</Label>
                  <Input className="mt-1" value={form.dietary_requirements} onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })} placeholder="e.g. Vegan, nut-free, halal..." />
                </div>
                <div className="col-span-2">
                  <Label>Notes for the caterer</Label>
                  <Textarea className="mt-1" rows={2} value={form.additional_comments} onChange={(e) => setForm({ ...form, additional_comments: e.target.value })} />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!form.customer_name || !form.customer_email || !form.customer_phone || !form.event_date}
                style={{ backgroundColor: accentColor }}
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 1 (quote): full event details */}
        {orderType === 'quote' && step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Full name *</Label>
                <Input className="mt-1" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input className="mt-1" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input className="mt-1" type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              </div>
              <div>
                <Label>Event date *</Label>
                <Input className="mt-1" type="date" min={new Date().toISOString().split('T')[0]} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div>
                <Label>Number of guests *</Label>
                <Input className="mt-1" type="number" min="1" value={form.guest_count} onChange={(e) => setForm({ ...form, guest_count: e.target.value })} placeholder="Approx." />
              </div>
              <div>
                <Label>Event type *</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {['Wedding', 'Corporate / Business', 'Birthday party', 'Private party', 'Funeral / Wake', 'Baby shower', 'Graduation', 'Holiday party', 'Dinner party', 'Brunch / Breakfast', 'Other'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Event location</Label>
                <Input className="mt-1" placeholder="Address or venue" value={form.event_location} onChange={(e) => setForm({ ...form, event_location: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Describe your requirements *</Label>
                <Textarea className="mt-1" rows={3} value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} placeholder="What food are you looking for? Any themes, serving styles, or special requests?" />
              </div>
              <div className="col-span-2">
                <Label>Dietary requirements</Label>
                <Input className="mt-1" value={form.dietary_requirements} onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })} placeholder="e.g. Vegan, nut-free, halal..." />
              </div>
            </div>

            <div className="flex justify-between">
              <div />
              <Button
                onClick={() => setStep(2)}
                disabled={!form.customer_name || !form.customer_email || !form.customer_phone || !form.event_date}
                style={{ backgroundColor: accentColor }}
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment (fixed) or Review (quote) */}
        {step === (orderType === 'fixed' ? 3 : 2) && (
          <div className="space-y-4">
            {orderType === 'fixed' && (
              <div>
                <p className="font-medium text-gray-900 mb-3">Payment method</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={form.payment_method === 'card'}
                      onChange={() => setForm({ ...form, payment_method: 'card' })}
                    />
                    <div>
                      <p className="font-medium text-sm">Pay by card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Apple Pay, Google Pay</p>
                    </div>
                  </label>
                  {caterer.bank_transfer_details && (
                    <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="bank_transfer"
                        checked={form.payment_method === 'bank_transfer'}
                        onChange={() => setForm({ ...form, payment_method: 'bank_transfer' })}
                      />
                      <div>
                        <p className="font-medium text-sm">Bank transfer</p>
                        <p className="text-xs text-gray-500">Transfer directly to the caterer's account — details provided after your order is confirmed</p>
                      </div>
                    </label>
                  )}
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="offline"
                      checked={form.payment_method === 'offline'}
                      onChange={() => setForm({ ...form, payment_method: 'offline' })}
                    />
                    <div>
                      <p className="font-medium text-sm">Pay later</p>
                      <p className="text-xs text-gray-500">Arrange payment directly with the caterer</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Discount code (fixed orders only) */}
            {orderType === 'fixed' && (
              <div>
                <Label>Discount code</Label>
                {appliedDiscount ? (
                  <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <Tag className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{appliedDiscount.code} — {appliedDiscount.label} (−£{appliedDiscount.amount.toFixed(2)})</span>
                    <button onClick={() => { setAppliedDiscount(null); setDiscountCode('') }} className="text-green-500 hover:text-green-700">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
                      disabled={subtotal === 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyDiscount}
                      disabled={!discountCode.trim() || discountValidating || subtotal === 0}
                    >
                      {discountValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-900 mb-2">Order Summary</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="text-gray-500">Name:</span> {form.customer_name}</p>
                <p><span className="text-gray-500">Email:</span> {form.customer_email}</p>
                <p><span className="text-gray-500">Date:</span> {new Date(form.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {form.event_type && <p><span className="text-gray-500">Event:</span> {form.event_type}</p>}
                {form.guest_count && <p><span className="text-gray-500">Guests:</span> {form.guest_count}</p>}
                {orderType === 'fixed' && (
                  <div className="pt-1 space-y-0.5">
                    {appliedDiscount && (
                      <>
                        <p className="text-gray-500">Subtotal: £{subtotal.toFixed(2)}</p>
                        <p className="text-green-700">Discount: −£{appliedDiscount.amount.toFixed(2)}</p>
                      </>
                    )}
                    <p className="font-semibold text-gray-900">Total: £{total.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(orderType === 'fixed' ? 2 : 1)}>← Back</Button>
              <Button onClick={submitOrder} disabled={loading} style={{ backgroundColor: accentColor }}>
                {loading ? 'Submitting...' : orderType === 'quote' ? 'Submit Request' : 'Place Order'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
