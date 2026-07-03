'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { deleteStoredImages, objectPathFromPublicUrl } from '@/lib/supabase/storage'
import { toast } from '@/lib/utils/use-toast'
import { GOOGLE_FONTS, validateSlug, slugify } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink, Upload, X, Plus, Trash2, Sparkles } from 'lucide-react'
import SiteEditorOnboarding from './site-editor-onboarding'
import { CERTIFICATIONS } from '@/components/caterer/certification-badges'

const TEMPLATES = [
  { id: 'classic', name: 'Classic', desc: 'Clean and professional with full-width hero' },
  { id: 'modern', name: 'Modern', desc: 'Contemporary with masonry gallery and centered layout' },
  { id: 'bold', name: 'Bold', desc: 'High-impact with card menu and colour-block design' },
  { id: 'linkpage', name: 'Link Page', desc: 'Dark, mobile-first with sticky bar and social links' },
]

// Relative luminance (0 = black, 1 = white) for a #rrggbb hex colour
function luminance(hex: string): number {
  const h = (hex || '').replace('#', '')
  if (h.length !== 6) return 1
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

interface Props {
  caterererId: string
  caterer: any
  page: any
}

export default function SiteEditorForm({ caterererId, caterer, page }: Props) {
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const isMounted = useRef(false)
  const [heroUrl, setHeroUrl] = useState<string>(page?.hero_image_url || '')
  const [logoUrl, setLogoUrl] = useState<string>(page?.logo_url || '')
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const heroRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  const [showOnboarding, setShowOnboarding] = useState(!page?.tagline && !page?.about && !page?.logo_url)
  const [activeTab, setActiveTab] = useState('template')

  async function uploadImage(
    file: File,
    path: string,
    setUrl: (url: string) => void,
    setLoading: (v: boolean) => void,
    currentUrl?: string
  ) {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large (max 5MB)', variant: 'destructive' })
      return
    }
    setLoading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fullPath = `${path}/${caterererId}.${ext}`
    const { error } = await supabase.storage.from('caterer-images').upload(fullPath, file, { upsert: true })
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('caterer-images').getPublicUrl(fullPath)
    setUrl(publicUrl)
    setLoading(false)
    // If we replaced an image that had a different file name (e.g. .png -> .jpg),
    // the old object won't have been overwritten — delete it so it isn't orphaned.
    if (currentUrl && objectPathFromPublicUrl(currentUrl) !== fullPath) {
      deleteStoredImages([currentUrl])
    }
    toast({ title: 'Image uploaded', variant: 'success' })
  }

  const [form, setForm] = useState({
    template: page?.template || 'classic',
    tagline: page?.tagline || '',
    about: page?.about || '',
    primary_color: page?.primary_color || '#000000',
    secondary_color: page?.secondary_color || '#666666',
    accent_color: page?.accent_color || '#2E75B6',
    heading_font: page?.heading_font || 'Inter',
    body_font: page?.body_font || 'Inter',
    background_color: page?.background_color || '#FFFFFF',
    terms_conditions: page?.terms_conditions || '',
  })

  const td = page?.template_data || {}
  const [selectedCerts, setSelectedCerts] = useState<string[]>(td.certifications || [])
  const [templateData, setTemplateData] = useState({
    chips: (td.chips || []).join(', '),
    badge1: td.badge1 || '',
    badge2: td.badge2 || '',
    instagram: td.instagram || '',
    cta_label: td.cta_label || '',
    extras: td.extras || '',
    faqs: (td.faqs || []) as { q: string; a: string }[],
    hero_overlay: typeof td.hero_overlay === 'number' ? td.hero_overlay : 40,
    sticky_bar: td.sticky_bar ?? false,
  })

  // Contact visibility lives on the caterer record but is edited here for convenience
  const [showContact, setShowContact] = useState<boolean>(caterer?.show_contact_publicly ?? true)

  const [slug, setSlug] = useState(caterer?.slug || '')
  const [slugError, setSlugError] = useState<string | null>(null)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    setDirty(true)
  }, [form, heroUrl, logoUrl, slug, selectedCerts, templateData, showContact])

  function handleSlugChange(val: string) {
    const cleaned = slugify(val)
    setSlug(cleaned)
    setSlugError(validateSlug(cleaned))
  }

  function addFaq() {
    setTemplateData({ ...templateData, faqs: [...templateData.faqs, { q: '', a: '' }] })
  }

  function removeFaq(i: number) {
    setTemplateData({ ...templateData, faqs: templateData.faqs.filter((_, j) => j !== i) })
  }

  function updateFaq(i: number, field: 'q' | 'a', value: string) {
    const next = [...templateData.faqs]
    next[i] = { ...next[i], [field]: value }
    setTemplateData({ ...templateData, faqs: next })
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()

    try {
      const pageData = {
        ...form,
        hero_image_url: heroUrl || null,
        logo_url: logoUrl || null,
        template_data: {
          chips: templateData.chips.split(',').map((s: string) => s.trim()).filter(Boolean),
          badge1: templateData.badge1 || null,
          badge2: templateData.badge2 || null,
          instagram: templateData.instagram || null,
          cta_label: templateData.cta_label || null,
          extras: templateData.extras || null,
          faqs: templateData.faqs.filter((f) => f.q && f.a),
          certifications: selectedCerts,
          hero_overlay: templateData.hero_overlay,
          sticky_bar: templateData.sticky_bar,
        },
      }
      if (page) {
        const { error } = await supabase.from('caterer_pages').update(pageData).eq('caterer_id', caterererId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('caterer_pages').insert({ ...pageData, caterer_id: caterererId })
        if (error) throw error
      }

      // Persist caterer-level settings edited here (slug + contact visibility)
      const catererUpdate: any = { show_contact_publicly: showContact }
      if (slug !== caterer?.slug) {
        const err = validateSlug(slug)
        if (err) { toast({ title: err, variant: 'destructive' }); setSaving(false); return }
        catererUpdate.slug = slug
      }
      const { error: catErr } = await supabase.from('caterers').update(catererUpdate).eq('id', caterererId)
      if (catErr) throw catErr

      // Clean up storage: if the saved hero/logo was removed or swapped out,
      // delete the previously-saved file so it isn't left orphaned.
      const orphaned: string[] = []
      if (page?.hero_image_url && page.hero_image_url !== heroUrl) orphaned.push(page.hero_image_url)
      if (page?.logo_url && page.logo_url !== logoUrl) orphaned.push(page.logo_url)
      if (orphaned.length) deleteStoredImages(orphaned)

      toast({ title: 'Site saved!', variant: 'success' })
      setDirty(false)
    } catch (err: any) {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {showOnboarding && (
        <SiteEditorOnboarding
          caterererId={caterererId}
          initialSlug={caterer?.slug || ''}
          onComplete={(tmpl, accent, tgln, newSlug) => {
            setForm((f) => ({ ...f, template: tmpl, accent_color: accent, tagline: tgln }))
            if (newSlug) setSlug(newSlug)
            setShowOnboarding(false)
            setActiveTab('content')
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      <div className="space-y-6">
        {caterer?.slug && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-1 text-sm text-gray-600">
              Your site URL: <span className="font-medium text-gray-900">caterfy.com/{caterer.slug}</span>
            </div>
            <Link href={`/${caterer.slug}`} target="_blank" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
              <ExternalLink className="h-4 w-4" />Preview
            </Link>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          {/* Template selection */}
          <TabsContent value="template">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm({ ...form, template: t.id })}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    form.template === t.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {/* Classic */}
                  {t.id === 'classic' && (
                    <div className="h-28 rounded-lg mb-3 bg-gray-100 overflow-hidden flex flex-col border border-gray-200">
                      <div className="h-2.5 bg-white border-b border-gray-200 flex items-center px-1.5 gap-1">
                        <div className="w-8 h-1 bg-gray-400 rounded" />
                        <div className="ml-auto flex gap-1"><div className="w-3 h-0.5 bg-gray-300 rounded" /><div className="w-3 h-0.5 bg-gray-300 rounded" /></div>
                      </div>
                      <div className="h-9 bg-gray-300 flex items-end px-2 pb-1"><div className="w-16 h-1.5 bg-white/80 rounded" /></div>
                      <div className="flex-1 px-2 pt-1.5 space-y-1">
                        <div className="w-12 h-1 bg-gray-400 rounded" />
                        <div className="w-20 h-0.5 bg-gray-300 rounded" />
                        <div className="mt-1 space-y-0.5">
                          <div className="flex gap-1 items-center"><div className="w-1 h-1 bg-gray-400 rounded-full" /><div className="w-14 h-0.5 bg-gray-300 rounded" /></div>
                          <div className="flex gap-1 items-center"><div className="w-1 h-1 bg-gray-400 rounded-full" /><div className="w-10 h-0.5 bg-gray-300 rounded" /></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Modern */}
                  {t.id === 'modern' && (
                    <div className="h-28 rounded-lg mb-3 bg-gray-100 overflow-hidden flex flex-col border border-gray-200">
                      <div className="h-2.5 bg-gray-900 flex items-center px-1.5 gap-1">
                        <div className="w-8 h-1 bg-white/60 rounded" />
                        <div className="ml-auto flex gap-1"><div className="w-3 h-0.5 bg-white/40 rounded" /><div className="w-3 h-0.5 bg-white/40 rounded" /></div>
                      </div>
                      <div className="h-10 bg-gray-700 flex flex-col items-center justify-center gap-0.5">
                        <div className="w-20 h-1.5 bg-white/80 rounded" />
                        <div className="w-12 h-0.5 bg-white/50 rounded" />
                      </div>
                      <div className="flex-1 px-2 pt-1.5 flex flex-col items-center space-y-1">
                        <div className="w-12 h-1 bg-gray-400 rounded" />
                        <div className="grid grid-cols-3 gap-0.5 mt-0.5 w-full">
                          <div className="h-3 bg-gray-300 rounded" />
                          <div className="h-3 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Bold */}
                  {t.id === 'bold' && (
                    <div className="h-28 rounded-lg mb-3 bg-gray-100 overflow-hidden flex flex-col border border-gray-200">
                      <div className="h-2.5 bg-red-600 flex items-center px-1.5 gap-1">
                        <div className="w-8 h-1 bg-white/80 rounded" />
                        <div className="ml-auto flex gap-1"><div className="w-3 h-0.5 bg-white/60 rounded" /><div className="w-3 h-0.5 bg-white/60 rounded" /></div>
                      </div>
                      <div className="h-8 bg-red-500 flex items-center px-2">
                        <div className="w-16 h-1.5 bg-white/90 rounded" />
                      </div>
                      <div className="flex-1 px-2 pt-1.5 space-y-1">
                        <div className="flex gap-1.5">
                          <div className="w-8 h-5 bg-gray-300 rounded" />
                          <div className="flex-1 space-y-0.5 pt-0.5"><div className="w-full h-0.5 bg-gray-400 rounded" /><div className="w-3/4 h-0.5 bg-gray-300 rounded" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-0.5">
                          <div className="h-3 bg-white border border-gray-300 rounded shadow-sm" />
                          <div className="h-3 bg-white border border-gray-300 rounded shadow-sm" />
                          <div className="h-3 bg-white border border-gray-300 rounded shadow-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Link Page */}
                  {t.id === 'linkpage' && (
                    <div className="h-28 rounded-lg mb-3 bg-gray-900 overflow-hidden flex flex-col border border-gray-700">
                      <div className="h-9 bg-gray-700 flex items-end px-2 pb-1.5 gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-500 border border-orange-400/60 flex-shrink-0" />
                        <div className="ml-auto text-right">
                          <div className="w-14 h-1.5 bg-white/70 rounded mb-0.5" />
                          <div className="w-8 h-1 bg-orange-400/60 rounded" />
                        </div>
                      </div>
                      <div className="flex-1 px-2 pt-1.5 space-y-1.5 bg-gray-900">
                        <div className="space-y-0.5">
                          <div className="w-full h-0.5 bg-gray-700 rounded" />
                          <div className="w-4/5 h-0.5 bg-gray-700 rounded" />
                        </div>
                        <div className="w-full h-3 rounded-md bg-orange-500/70" />
                        <div className="flex gap-1">
                          <div className="h-2.5 flex-1 bg-gray-800 rounded border border-gray-700" />
                          <div className="h-2.5 flex-1 bg-gray-800 rounded border border-gray-700" />
                        </div>
                      </div>
                      <div className="h-4 bg-gray-950 border-t border-gray-800 flex items-center px-2 gap-1">
                        <div className="flex-1 h-2 bg-orange-500/60 rounded" />
                        <div className="flex-1 h-2 bg-gray-800 rounded border border-gray-700" />
                      </div>
                    </div>
                  )}
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Content */}
          <TabsContent value="content">
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Post-onboarding nudge */}
                {!heroUrl && !form.about && (
                  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
                    <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <p className="font-medium">Complete your profile</p>
                      <p className="text-xs text-blue-700 mt-0.5">Add a hero image and about text so customers know who you are. These appear at the top of your public page.</p>
                    </div>
                  </div>
                )}

                {/* Hero image */}
                <div>
                  <Label>Hero image</Label>
                  <p className="text-xs text-gray-500 mb-2">The large banner image shown at the top of your site — use a high-quality photo of your food or an event you've catered. (JPG, PNG, WebP, max 5MB)</p>
                  <div className="flex items-start gap-4">
                    {heroUrl ? (
                      <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image src={heroUrl} alt="Hero" fill className="object-cover" />
                        <button onClick={() => setHeroUrl('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 flex-shrink-0" onClick={() => heroRef.current?.click()}>
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={() => heroRef.current?.click()} disabled={uploadingHero}>
                      {uploadingHero ? 'Uploading...' : heroUrl ? 'Change image' : 'Upload image'}
                    </Button>
                    <input ref={heroRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'hero', setHeroUrl, setUploadingHero, heroUrl) }} />
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <Label>Logo</Label>
                  <p className="text-xs text-gray-500 mb-2">Displayed in your site header. Use a transparent PNG for best results.</p>
                  <div className="flex items-start gap-4">
                    {logoUrl ? (
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                        <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" />
                        <button onClick={() => setLogoUrl('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 flex-shrink-0" onClick={() => logoRef.current?.click()}>
                        <Upload className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}>
                      {uploadingLogo ? 'Uploading...' : logoUrl ? 'Change logo' : 'Upload logo'}
                    </Button>
                    <input ref={logoRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'logos', setLogoUrl, setUploadingLogo, logoUrl) }} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline / Slogan</Label>
                  <Input id="tagline" className="mt-1" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Authentic Caribbean catering for every occasion" />
                </div>
                <div>
                  <Label htmlFor="about">About Your Business</Label>
                  <Textarea id="about" className="mt-1" rows={5} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="Tell customers about your catering business..." />
                </div>
                <div>
                  <Label htmlFor="terms">Terms &amp; Conditions</Label>
                  <p className="text-xs text-gray-500 mb-1">Include your cancellation policy. This will be displayed on your site.</p>
                  <Textarea id="terms" className="mt-1" rows={6} value={form.terms_conditions} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} placeholder="e.g. Orders cancelled within 48 hours of event will be charged 50%..." />
                </div>

                {/* Certifications */}
                <div>
                  <Label>Food certifications &amp; accreditations</Label>
                  <p className="text-xs text-gray-500 mb-3">Displayed as badges in the hero section of your site.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(CERTIFICATIONS).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCerts.includes(key)}
                          onChange={() =>
                            setSelectedCerts((prev) =>
                              prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Link Page specific fields */}
                {form.template === 'linkpage' && (
                  <div className="space-y-5 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Link Page Settings</p>

                    <div>
                      <Label>Profile Tags</Label>
                      <p className="text-xs text-gray-500 mb-1">Comma-separated tags shown below your bio (e.g. Event Catering, Delivery Available)</p>
                      <Input value={templateData.chips} onChange={(e) => setTemplateData({ ...templateData, chips: e.target.value })} placeholder="Event Catering, Delivery Available, 3mi Radius" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Badge 1</Label>
                        <Input className="mt-1" value={templateData.badge1} onChange={(e) => setTemplateData({ ...templateData, badge1: e.target.value })} placeholder="Food Hygiene Certified" />
                      </div>
                      <div>
                        <Label>Badge 2</Label>
                        <Input className="mt-1" value={templateData.badge2} onChange={(e) => setTemplateData({ ...templateData, badge2: e.target.value })} placeholder="West African Cuisine" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Instagram Handle</Label>
                        <div className="flex items-center mt-1">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">@</span>
                          <Input className="rounded-l-none" value={templateData.instagram} onChange={(e) => setTemplateData({ ...templateData, instagram: e.target.value })} placeholder="yourbusiness" />
                        </div>
                      </div>
                      <div>
                        <Label>Primary Button Label</Label>
                        <Input className="mt-1" value={templateData.cta_label} onChange={(e) => setTemplateData({ ...templateData, cta_label: e.target.value })} placeholder="Order Now" />
                      </div>
                    </div>

                    <div>
                      <Label>Extras / Add-ons</Label>
                      <p className="text-xs text-gray-500 mb-1">One per line: Name | Price (e.g. × 4 Chicken Wings | £3.00)</p>
                      <Textarea value={templateData.extras} onChange={(e) => setTemplateData({ ...templateData, extras: e.target.value })} rows={4} placeholder={'× 4 Chicken Wings | £3.00\n× 4 Spring Rolls | £3.50\n× 4 Meat Pies | £5.50'} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>FAQs</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                          <Plus className="h-4 w-4 mr-1" /> Add FAQ
                        </Button>
                      </div>
                      {templateData.faqs.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No FAQs yet. Click Add FAQ to get started.</p>
                      )}
                      {templateData.faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-3 mb-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input value={faq.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} placeholder="Question" className="flex-1" />
                            <button onClick={() => removeFaq(i)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <Textarea value={faq.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} placeholder="Answer" rows={2} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modern: hero image darkening so overlaid text stays readable */}
                {form.template === 'modern' && heroUrl && (
                  <div className="pt-4 border-t border-gray-100">
                    <Label>Hero image darkening ({templateData.hero_overlay}%)</Label>
                    <p className="text-xs text-gray-500 mb-2">The Modern template overlays your business name on the hero image. Lower this to show more of the photo; raise it if text is hard to read.</p>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={templateData.hero_overlay}
                      onChange={(e) => setTemplateData({ ...templateData, hero_overlay: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Sticky order bar — available on all templates (built-in on Link Page) */}
                {form.template !== 'linkpage' && (
                  <div className="pt-4 border-t border-gray-100 flex items-start justify-between gap-4">
                    <div>
                      <Label>Sticky order bar</Label>
                      <p className="text-xs text-gray-500 mt-0.5">Shows a bar fixed to the bottom of the screen with quick "Order now" / "Call" buttons as visitors scroll. (The Link Page template always has this.)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTemplateData({ ...templateData, sticky_bar: !templateData.sticky_bar })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${templateData.sticky_bar ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${templateData.sticky_bar ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                )}

                {/* Contact visibility (stored on the caterer record) */}
                <div className="pt-4 border-t border-gray-100 flex items-start justify-between gap-4">
                  <div>
                    <Label>Show contact details publicly</Label>
                    <p className="text-xs text-gray-500 mt-0.5">When on, your phone and email are shown on your public page and order-status pages.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowContact((v) => !v)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${showContact ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showContact ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="branding">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { key: 'primary_color', label: 'Primary colour' },
                    { key: 'secondary_color', label: 'Secondary colour' },
                    { key: 'accent_color', label: 'Accent colour' },
                    { key: 'background_color', label: 'Background colour' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contrast guard: warn when text colours would be invisible on the background */}
                {(luminance(form.background_color) > 0.85 && luminance(form.primary_color) > 0.85) && (
                  <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <span>⚠️</span>
                    <p>Your <strong>primary</strong> (text) colour is nearly as light as your <strong>background</strong>, so text may be unreadable. Pick a darker primary colour or a darker background.</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
                  <strong>Where each colour is used:</strong> Primary = main text &amp; headings. Secondary = muted/supporting text.
                  Accent = buttons, links, prices &amp; highlights. Background = page background.
                  Not every template uses all four — Bold leans on Primary for its colour blocks, and the Link Page is dark and driven almost entirely by the Accent colour.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Heading font</Label>
                    <Select value={form.heading_font} onValueChange={(v) => setForm({ ...form, heading_font: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{GOOGLE_FONTS.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span></SelectItem>)}</SelectContent>
                    </Select>
                    <p className="mt-2 text-lg text-gray-800" style={{ fontFamily: `'${form.heading_font}', sans-serif` }}>The quick brown fox</p>
                  </div>
                  <div>
                    <Label>Body font</Label>
                    <Select value={form.body_font} onValueChange={(v) => setForm({ ...form, body_font: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{GOOGLE_FONTS.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span></SelectItem>)}</SelectContent>
                    </Select>
                    <p className="mt-2 text-sm text-gray-700" style={{ fontFamily: `'${form.body_font}', sans-serif` }}>The quick brown fox jumps over the lazy dog.</p>
                  </div>
                </div>

                {form.template === 'linkpage' && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    For the Link Page template, <strong>Accent colour</strong> is the primary brand colour used throughout — buttons, prices, badges, and hover states.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* URL */}
          <TabsContent value="url">
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="slug">Your URL</Label>
                <div className="flex items-center mt-1">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">
                    caterfy.com/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="rounded-l-none"
                    placeholder="your-business-name"
                  />
                </div>
                {slugError && <p className="text-sm text-red-500 mt-1">{slugError}</p>}
                <p className="text-xs text-gray-500 mt-2">Lowercase letters, numbers and hyphens only. You can change this once every 30 days.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-4">
          <p className="text-xs text-gray-400">Changes only appear on your live site after you save.</p>
          <Button onClick={save} disabled={saving || !dirty} size="lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  )
}
