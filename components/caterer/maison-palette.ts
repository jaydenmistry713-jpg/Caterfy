// Maison template palette system. Instead of free hex pickers, the caterer
// composes a palette from three curated layers — accent × band × paper —
// every combination of which has been chosen to work (deep accents that hold
// contrast on near-white papers; deep muted bands that carry cream text).
// The selection is stored in caterer_pages.template_data.maison as
// { accent, band, paper } ids; unknown/missing ids fall back to the default.

export const MAISON_ACCENTS: Record<string, { name: string; hex: string }> = {
  clay: { name: 'Clay', hex: '#B4643C' },
  burgundy: { name: 'Burgundy', hex: '#7C303E' },
  forest: { name: 'Forest', hex: '#4A6741' },
  teal: { name: 'Deep Teal', hex: '#3E6B63' },
  slate: { name: 'Slate Blue', hex: '#4C6280' },
  ochre: { name: 'Ochre', hex: '#9C6B1E' },
  aubergine: { name: 'Aubergine', hex: '#6B4059' },
  graphite: { name: 'Graphite', hex: '#454540' },
}

export const MAISON_BANDS: Record<string, { name: string; hex: string }> = {
  moss: { name: 'Moss', hex: '#3C4A34' },
  charcoal: { name: 'Charcoal', hex: '#262620' },
  espresso: { name: 'Espresso', hex: '#362A22' },
  midnight: { name: 'Midnight', hex: '#2A3440' },
  plum: { name: 'Plum', hex: '#382B38' },
}

export const MAISON_PAPERS: Record<string, { name: string; hex: string }> = {
  ivory: { name: 'Ivory', hex: '#FAF6EE' },
  porcelain: { name: 'Porcelain', hex: '#F7F6F2' },
  blush: { name: 'Blush', hex: '#FAF2EC' },
}

export const MAISON_DEFAULTS = { accent: 'clay', band: 'moss', paper: 'ivory' }

export interface MaisonColors {
  accent: string
  band: string
  paper: string
  ink: string
  soft: string
  hairline: string
  hairlineSoft: string
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function resolveMaisonColors(templateData: any): MaisonColors {
  const sel = templateData?.maison || {}
  const accent = MAISON_ACCENTS[sel.accent] ? sel.accent : MAISON_DEFAULTS.accent
  const band = MAISON_BANDS[sel.band] ? sel.band : MAISON_DEFAULTS.band
  const paper = MAISON_PAPERS[sel.paper] ? sel.paper : MAISON_DEFAULTS.paper
  return {
    accent: MAISON_ACCENTS[accent].hex,
    band: MAISON_BANDS[band].hex,
    paper: MAISON_PAPERS[paper].hex,
    ink: '#23261E',
    soft: '#71746A',
    hairline: 'rgba(35, 38, 30, 0.16)',
    hairlineSoft: 'rgba(35, 38, 30, 0.09)',
  }
}
