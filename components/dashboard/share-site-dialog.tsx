'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { track } from '@/lib/analytics'
import { Copy, Check, MessageCircle, Download, AtSign } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  businessName: string
  catererId: string
}

// The publish-&-share moment: copy link, WhatsApp share, Instagram-bio hint,
// QR download and an A5 "Scan to order" poster. Sharing marks
// caterers.link_shared_at so the dashboard checklist can tick it off.
export default function ShareSiteDialog({ open, onOpenChange, slug, businessName, catererId }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const siteUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`

  useEffect(() => {
    if (!open) return
    QRCode.toDataURL(siteUrl, {
      width: 480,
      margin: 1,
      color: { dark: '#182A20', light: '#FDFAF2' },
    }).then(setQrDataUrl, () => setQrDataUrl(null))
  }, [open, siteUrl])

  // Fire-and-forget: record that the caterer has shared their link at least once
  function markShared(method: string) {
    track('share_link', { method })
    const supabase = createClient()
    supabase
      .from('caterers')
      .update({ link_shared_at: new Date().toISOString() })
      .eq('id', catererId)
      .then(() => {}, () => {})
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(siteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      markShared('copy')
      toast({ title: 'Link copied!', variant: 'success' })
    } catch {
      toast({ title: 'Could not copy — long-press the link to copy it manually', variant: 'destructive' })
    }
  }

  function whatsappHref() {
    const text = `${businessName} is taking orders online — menu, prices and booking here: ${siteUrl}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  function downloadQr() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${slug}-qr.png`
    a.click()
    markShared('qr')
  }

  // A5-proportioned poster (1748×2480 ≈ 150dpi) drawn on a canvas: brand
  // colours, business name, "Scan to order", QR, URL.
  async function downloadPoster() {
    if (!qrDataUrl) return
    const W = 1748
    const H = 2480
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#182A20'
    ctx.fillRect(0, 0, W, H)

    // Eyebrow
    ctx.fillStyle = '#E8A33D'
    ctx.font = '600 44px Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('S C A N   T O   O R D E R', W / 2, 320)

    // Business name (wraps onto two lines if long)
    ctx.fillStyle = '#F7F2E7'
    ctx.font = '400 130px Georgia, serif'
    const words = businessName.split(' ')
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > W - 300 && line) {
        lines.push(line)
        line = w
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    lines.slice(0, 2).forEach((l, i) => {
      ctx.fillText(l, W / 2, 520 + i * 150)
    })

    // QR tile
    const qrImg = new Image()
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve()
      qrImg.onerror = () => reject()
      qrImg.src = qrDataUrl
    })
    const qrSize = 900
    const qrX = (W - qrSize) / 2
    const qrY = 900
    ctx.fillStyle = '#FDFAF2'
    const r = 40
    ctx.beginPath()
    ctx.roundRect(qrX - 60, qrY - 60, qrSize + 120, qrSize + 120, r)
    ctx.fill()
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // URL + footer
    ctx.fillStyle = '#E8A33D'
    ctx.font = '600 56px Consolas, monospace'
    ctx.fillText(siteUrl.replace(/^https?:\/\//, ''), W / 2, qrY + qrSize + 200)
    ctx.fillStyle = 'rgba(247, 242, 231, 0.55)'
    ctx.font = '400 40px Georgia, serif'
    ctx.fillText('Menu · Prices · Online ordering', W / 2, qrY + qrSize + 290)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${slug}-poster.png`
    a.click()
    markShared('poster')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your site 🎉</DialogTitle>
          <DialogDescription>
            Your page is live. Every share is free marketing — here&rsquo;s everything you need.
          </DialogDescription>
        </DialogHeader>

        {/* Link + copy */}
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
            {siteUrl}
          </div>
          <Button onClick={copyLink} size="sm" className="flex-shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {/* Share actions */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markShared('whatsapp')}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageCircle className="h-4 w-4" />
            Share on WhatsApp
          </a>
          <button
            onClick={downloadQr}
            disabled={!qrDataUrl}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download QR code
          </button>
        </div>

        {/* QR preview + poster */}
        {qrDataUrl && (
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {/* QR preview is generated client-side as a data URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code for your site" className="h-24 w-24 rounded-lg" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">&ldquo;Scan to order&rdquo; poster</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Print it for your market stall, packaging or events.
              </p>
              <button onClick={downloadPoster} className="mt-2 text-sm font-medium underline text-gray-900">
                Download A5 poster
              </button>
            </div>
          </div>
        )}

        {/* Instagram hint */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
          <AtSign className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-medium text-gray-700">Instagram tip:</span> paste your link
            into your bio (Edit profile → Links), then reply to every &ldquo;how do I
            order?&rdquo; DM with it — one message instead of twenty.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
