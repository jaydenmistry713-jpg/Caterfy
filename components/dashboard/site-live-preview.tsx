'use client'

import { useEffect, useRef, useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import CatererPageClassic from '@/components/caterer/template-classic'
import CatererPageModern from '@/components/caterer/template-modern'
import CatererPageBold from '@/components/caterer/template-bold'
import CatererPageLinkPage from '@/components/caterer/template-linkpage'
import CatererPageMaison from '@/components/caterer/template-maison'

interface Props {
  template: string
  caterer: any
  menuItems: any[]
  packages: any[]
  gallery: any[]
  reviews: any[]
  /** heading/body fonts to load so the preview matches the live site */
  fonts: string[]
}

// Logical (unscaled) width the template is rendered at, per device. The pane
// then scales this down to fit the available column width.
const DEVICE_WIDTH = { desktop: 1200, mobile: 390 } as const
type Device = keyof typeof DEVICE_WIDTH

function TemplateFor({ template, ...data }: { template: string } & Record<string, any>) {
  if (template === 'modern') return <CatererPageModern {...(data as any)} />
  if (template === 'bold') return <CatererPageBold {...(data as any)} />
  if (template === 'linkpage') return <CatererPageLinkPage {...(data as any)} />
  if (template === 'maison') return <CatererPageMaison {...(data as any)} />
  return <CatererPageClassic {...(data as any)} />
}

export default function SiteLivePreview({ template, caterer, menuItems, packages, gallery, reviews, fonts }: Props) {
  const [device, setDevice] = useState<Device>('desktop')
  const [scale, setScale] = useState(1)
  const [innerH, setInnerH] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const logicalWidth = DEVICE_WIDTH[device]

  // Load the caterer's chosen Google Fonts so the preview renders in them.
  // Maison locks its own type and injects its own link inside the template.
  useEffect(() => {
    if (template === 'maison' || fonts.length === 0) return
    const href = `https://fonts.googleapis.com/css2?${fonts
      .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`)
      .join('&')}&display=swap`
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [fonts, template])

  // Fit-to-width scaling + reserve the scaled height so the pane scrolls right.
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const measure = () => {
      const available = container.clientWidth
      const s = available > 0 ? available / logicalWidth : 1
      setScale(s)
      setInnerH(content.scrollHeight * s)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    ro.observe(content)
    return () => ro.disconnect()
  }, [logicalWidth, template, caterer, menuItems, packages, gallery, reviews])

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
        <span className="text-xs font-medium text-gray-500">Live preview</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            aria-label="Desktop preview"
            className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            aria-label="Mobile preview"
            className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroll viewport. The template is rendered at full logical width then
          scaled to fit; the sizer div reserves the scaled height so this
          scrolls naturally. pointer-events are disabled so the preview can't
          be interacted with (it's a picture of the site, not the site). */}
      <div className="max-h-[calc(100vh-13rem)] overflow-y-auto overflow-x-hidden bg-white">
        <div
          ref={containerRef}
          className="mx-auto"
          style={{ width: device === 'mobile' ? Math.min(logicalWidth, 420) : '100%' }}
        >
          <div style={{ height: innerH }}>
            <div
              ref={contentRef}
              aria-hidden
              className="select-none"
              style={{
                width: logicalWidth,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            >
              <TemplateFor
                template={template}
                caterer={caterer}
                menuItems={menuItems}
                packages={packages}
                gallery={gallery}
                reviews={reviews}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
