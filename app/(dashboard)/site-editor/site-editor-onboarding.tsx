'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validateSlug, slugify } from '@/lib/utils'

interface Props {
  caterererId: string
  initialSlug: string
  onComplete: (template: string, accentColor: string, tagline: string, slug: string) => void
  onSkip: () => void
}

const TEMPLATES = [
  { id: 'classic', name: 'Classic', desc: 'Clean, professional, full-width hero' },
  { id: 'modern', name: 'Modern', desc: 'Contemporary with masonry gallery' },
  { id: 'bold', name: 'Bold', desc: 'High-impact with colour-block design' },
  { id: 'linkpage', name: 'Link Page', desc: 'Dark, mobile-first with sticky bar' },
  { id: 'maison', name: 'Maison', desc: 'Elegant, editorial, curated palettes' },
]

const STEPS = [
  { title: 'Pick your template', subtitle: 'You can change this at any time.' },
  { title: 'Choose your accent colour', subtitle: 'Used for buttons, highlights, and key details throughout your site.' },
  { title: "What's your tagline?", subtitle: 'A short line that captures what you do.' },
  { title: 'Set your URL', subtitle: 'This is the link customers use to find your site — e.g. caterfy.com/your-business. You can change it later.' },
]

export default function SiteEditorOnboarding({ caterererId, initialSlug, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [saving, setSaving] = useState(false)

  const [template, setTemplate] = useState('classic')
  const [accentColor, setAccentColor] = useState('#2E75B6')
  const [tagline, setTagline] = useState('')
  const [slug, setSlug] = useState(initialSlug)
  const [slugError, setSlugError] = useState<string | null>(null)

  function transition(cb: () => void) {
    setVisible(false)
    setTimeout(() => { cb(); setVisible(true) }, 240)
  }

  function advance() {
    if (step < STEPS.length - 1) {
      transition(() => setStep((s) => s + 1))
    } else {
      handleFinish()
    }
  }

  async function handleFinish() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('caterer_pages').upsert({
      caterer_id: caterererId,
      template,
      accent_color: accentColor,
      tagline: tagline.trim() || null,
    }, { onConflict: 'caterer_id' })

    if (slug && !validateSlug(slug)) {
      await supabase.from('caterers').update({ slug }).eq('id', caterererId)
    }

    onComplete(template, accentColor, tagline.trim(), slug)
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute top-6 left-6">
        <p className="font-bold text-lg text-gray-900">Site Setup</p>
      </div>
      <div className="absolute top-6 right-6">
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Skip setup
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-14">
        {STEPS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${
            i === step ? 'w-6 h-2 bg-gray-900' : i < step ? 'w-2 h-2 bg-gray-400' : 'w-2 h-2 bg-gray-200'
          }`} />
        ))}
      </div>

      <div className={`transition-all duration-[240ms] max-w-lg w-full text-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-sm text-gray-400 mb-3 font-medium">{step + 1} of {STEPS.length}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{STEPS[step].title}</h2>
        <p className="text-gray-500 mb-8 text-sm">{STEPS[step].subtitle}</p>

        {step === 0 && (
          <div className="grid grid-cols-2 gap-3 text-left">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`p-3 rounded-xl border-2 text-left transition-colors ${
                  template === t.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* Classic */}
                {t.id === 'classic' && (
                  <div className="h-24 rounded-lg mb-2 bg-gray-100 overflow-hidden flex flex-col border border-gray-200">
                    <div className="h-2.5 bg-white border-b border-gray-200 flex items-center px-1.5 gap-1">
                      <div className="w-8 h-1 bg-gray-400 rounded" />
                      <div className="ml-auto flex gap-1"><div className="w-3 h-0.5 bg-gray-300 rounded" /><div className="w-3 h-0.5 bg-gray-300 rounded" /></div>
                    </div>
                    <div className="h-9 bg-gray-300 flex items-end px-2 pb-1"><div className="w-16 h-1.5 bg-white/80 rounded" /></div>
                    <div className="flex-1 px-2 pt-1.5 space-y-1">
                      <div className="w-12 h-1 bg-gray-400 rounded" />
                      <div className="w-20 h-0.5 bg-gray-300 rounded" />
                    </div>
                  </div>
                )}
                {/* Modern */}
                {t.id === 'modern' && (
                  <div className="h-24 rounded-lg mb-2 bg-gray-100 overflow-hidden flex flex-col border border-gray-200">
                    <div className="h-2.5 bg-gray-900 flex items-center px-1.5 gap-1">
                      <div className="w-8 h-1 bg-white/60 rounded" />
                      <div className="ml-auto flex gap-1"><div className="w-3 h-0.5 bg-white/40 rounded" /><div className="w-3 h-0.5 bg-white/40 rounded" /></div>
                    </div>
                    <div className="h-10 bg-gray-700 flex flex-col items-center justify-center gap-0.5">
                      <div className="w-20 h-1.5 bg-white/80 rounded" />
                      <div className="w-12 h-0.5 bg-white/50 rounded" />
                    </div>
                    <div className="flex-1 px-2 pt-1.5 flex flex-col items-center">
                      <div className="grid grid-cols-3 gap-0.5 w-full mt-0.5">
                        <div className="h-3 bg-gray-300 rounded" />
                        <div className="h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-300 rounded" />
                      </div>
                    </div>
                  </div>
                )}
                {/* Bold */}
                {t.id === 'bold' && (
                  <div className="h-24 rounded-lg mb-2 bg-gray-100 overflow-hidden flex flex-col border border-gray-200">
                    <div className="h-2.5 bg-red-600 flex items-center px-1.5 gap-1">
                      <div className="w-8 h-1 bg-white/80 rounded" />
                      <div className="ml-auto flex gap-1"><div className="w-3 h-0.5 bg-white/60 rounded" /><div className="w-3 h-0.5 bg-white/60 rounded" /></div>
                    </div>
                    <div className="h-8 bg-red-500 flex items-center px-2">
                      <div className="w-16 h-1.5 bg-white/90 rounded" />
                    </div>
                    <div className="flex-1 px-2 pt-1.5">
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
                  <div className="h-24 rounded-lg mb-2 bg-gray-900 overflow-hidden flex flex-col border border-gray-700">
                    <div className="h-8 bg-gray-700 flex items-end px-2 pb-1.5 gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-500 border border-orange-400/60 flex-shrink-0" />
                      <div className="ml-auto text-right">
                        <div className="w-14 h-1.5 bg-white/70 rounded mb-0.5" />
                        <div className="w-8 h-1 bg-orange-400/60 rounded" />
                      </div>
                    </div>
                    <div className="flex-1 px-2 pt-1.5 space-y-1.5 bg-gray-900">
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
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-16 w-16 rounded-xl border border-gray-300 cursor-pointer"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Accent colour</p>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{accentColor}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {['#2E75B6', '#d4732a', '#16a34a', '#9333ea', '#dc2626', '#0891b2', '#b45309', '#374151'].map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  style={{ background: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <Input
            type="text"
            placeholder="e.g. Authentic Caribbean catering for every occasion"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="text-center text-base h-12 max-w-sm mx-auto"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && advance()}
          />
        )}

        {step === 3 && (
          <div className="space-y-3 max-w-sm mx-auto text-left">
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500 whitespace-nowrap">
                caterfy.com/
              </span>
              <Input
                value={slug}
                onChange={(e) => {
                  const cleaned = slugify(e.target.value)
                  setSlug(cleaned)
                  setSlugError(validateSlug(cleaned))
                }}
                className="rounded-l-none"
                placeholder="your-business-name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && !slugError && advance()}
              />
            </div>
            {slugError && <p className="text-sm text-red-500">{slugError}</p>}
            <p className="text-xs text-gray-400 text-center">Lowercase letters, numbers, and hyphens only. This is how customers find your page.</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={advance} className="text-sm text-gray-400 hover:text-gray-600 transition-colors" disabled={saving}>
            {isLast ? 'Skip & publish' : 'Skip'}
          </button>
          <Button onClick={advance} disabled={saving || (isLast && !!slugError)} size="lg">
            {saving ? 'Publishing...' : isLast ? 'Publish →' : 'Continue →'}
          </Button>
        </div>
      </div>

      <p className="absolute bottom-8 text-xs text-gray-300">You can update all of this in the editor</p>
    </div>
  )
}
