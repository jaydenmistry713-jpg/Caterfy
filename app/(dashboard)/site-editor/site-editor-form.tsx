'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { GOOGLE_FONTS, validateSlug, slugify } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink, Upload, X } from 'lucide-react'

const TEMPLATES = [
  { id: 'classic', name: 'Classic', desc: 'Clean and professional with full-width hero' },
  { id: 'modern', name: 'Modern', desc: 'Contemporary with masonry gallery and centered layout' },
  { id: 'bold', name: 'Bold', desc: 'High-impact with card menu and colour-block design' },
]

interface Props {
  caterererId: string
  caterer: any
  page: any
}

export default function SiteEditorForm({ caterererId, caterer, page }: Props) {
  const [saving, setSaving] = useState(false)
  const [heroUrl, setHeroUrl] = useState<string>(page?.hero_image_url || '')
  const [logoUrl, setLogoUrl] = useState<string>(page?.logo_url || '')
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const heroRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  async function uploadImage(
    file: File,
    path: string,
    setUrl: (url: string) => void,
    setLoading: (v: boolean) => void
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
  const [slug, setSlug] = useState(caterer?.slug || '')
  const [slugError, setSlugError] = useState<string | null>(null)

  function handleSlugChange(val: string) {
    const cleaned = slugify(val)
    setSlug(cleaned)
    setSlugError(validateSlug(cleaned))
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()

    try {
      const pageData = { ...form, hero_image_url: heroUrl || null, logo_url: logoUrl || null }
      if (page) {
        const { error } = await supabase.from('caterer_pages').update(pageData).eq('caterer_id', caterererId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('caterer_pages').insert({ ...pageData, caterer_id: caterererId })
        if (error) throw error
      }

      if (slug !== caterer?.slug) {
        const err = validateSlug(slug)
        if (err) { toast({ title: err, variant: 'destructive' }); setSaving(false); return }
        const { error } = await supabase.from('caterers').update({ slug }).eq('id', caterererId)
        if (error) throw error
      }

      toast({ title: 'Site saved!', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
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

      <Tabs defaultValue="template">
        <TabsList className="flex-wrap">
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        {/* Template selection */}
        <TabsContent value="template">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, template: t.id as any })}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  form.template === t.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* Classic: full-width hero, left-aligned about, list menu */}
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
                      <div className="w-16 h-0.5 bg-gray-300 rounded" />
                      <div className="mt-1 space-y-0.5">
                        <div className="flex gap-1 items-center"><div className="w-1 h-1 bg-gray-400 rounded-full" /><div className="w-14 h-0.5 bg-gray-300 rounded" /></div>
                        <div className="flex gap-1 items-center"><div className="w-1 h-1 bg-gray-400 rounded-full" /><div className="w-10 h-0.5 bg-gray-300 rounded" /></div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Modern: dark nav, hero with text overlay, centred content */}
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
                      <div className="w-20 h-0.5 bg-gray-300 rounded" />
                      <div className="grid grid-cols-3 gap-0.5 mt-0.5 w-full">
                        <div className="h-3 bg-gray-300 rounded" />
                        <div className="h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-300 rounded" />
                      </div>
                    </div>
                  </div>
                )}
                {/* Bold: coloured hero, card menu, split about */}
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
              {/* Hero image */}
              <div>
                <Label>Hero image</Label>
                <p className="text-xs text-gray-500 mb-2">The main image shown at the top of your site (JPG, PNG, WebP, max 5MB)</p>
                <div className="flex items-start gap-4">
                  {heroUrl ? (
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image src={heroUrl} alt="Hero" fill className="object-cover" />
                      <button
                        onClick={() => setHeroUrl('')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 flex-shrink-0"
                      onClick={() => heroRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => heroRef.current?.click()}
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? 'Uploading...' : heroUrl ? 'Change image' : 'Upload image'}
                  </Button>
                  <input
                    ref={heroRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) uploadImage(f, 'hero', setHeroUrl, setUploadingHero)
                    }}
                  />
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
                      <button
                        onClick={() => setLogoUrl('')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 flex-shrink-0"
                      onClick={() => logoRef.current?.click()}
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? 'Uploading...' : logoUrl ? 'Change logo' : 'Upload logo'}
                  </Button>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) uploadImage(f, 'logos', setLogoUrl, setUploadingLogo)
                    }}
                  />
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
                <Label htmlFor="terms">Terms & Conditions</Label>
                <p className="text-xs text-gray-500 mb-1">Include your cancellation policy. This will be displayed on your site.</p>
                <Textarea id="terms" className="mt-1" rows={6} value={form.terms_conditions} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} placeholder="e.g. Orders cancelled within 48 hours of event will be charged 50% of the total..." />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Heading font</Label>
                  <Select value={form.heading_font} onValueChange={(v) => setForm({ ...form, heading_font: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Body font</Label>
                  <Select value={form.body_font} onValueChange={(v) => setForm({ ...form, body_font: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
