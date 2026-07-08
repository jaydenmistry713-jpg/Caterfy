'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { Landmark } from 'lucide-react'

interface Props {
  caterererId: string
  initialDetails?: string | null
  initialShowOnInvoice?: boolean
}

// Bank-transfer account details editor. Lives on the Payments page (moved here
// from Settings → Payments) so all of a caterer's money settings sit together.
export default function BankDetailsForm({ caterererId, initialDetails, initialShowOnInvoice }: Props) {
  const [bankDetails, setBankDetails] = useState(initialDetails || '')
  const [showBankOnInvoice, setShowBankOnInvoice] = useState(initialShowOnInvoice ?? true)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from('caterers').update({
        bank_transfer_details: bankDetails.trim() || null,
        show_bank_details_on_invoice: showBankOnInvoice,
      }).eq('id', caterererId)
      if (error) throw error
      toast({ title: 'Bank details saved!', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Bank transfer details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Let customers pay you directly by bank transfer. When a customer picks bank transfer at
          checkout, these details are shown once their order is confirmed. They can also appear
          automatically on invoices.
        </p>
        <div>
          <Label htmlFor="bank_details">Account details</Label>
          <p className="text-xs text-gray-400 mb-1">e.g. Account name, sort code, account number — one per line</p>
          <Textarea
            id="bank_details"
            className="mt-1 font-mono text-sm"
            rows={4}
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
            placeholder={'Account name: Spice & Co.\nSort code: 12-34-56\nAccount number: 12345678'}
          />
        </div>
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="font-medium text-gray-900 text-sm">Show on invoices</p>
            <p className="text-xs text-gray-500">Include these details automatically on all invoices sent to customers</p>
          </div>
          <button
            onClick={() => setShowBankOnInvoice((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showBankOnInvoice ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showBankOnInvoice ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Bank Details'}
        </Button>
      </CardContent>
    </Card>
  )
}
