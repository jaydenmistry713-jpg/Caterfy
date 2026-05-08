export const CERTIFICATIONS: Record<string, string> = {
  hygiene_5: 'Food Hygiene 5★',
  halal: 'Halal Certified',
  kosher: 'Kosher Certified',
  fsa: 'FSA Registered',
  vegan_society: 'Vegan Society',
  salsa: 'SALSA Approved',
  brc: 'BRC Certified',
  iso22000: 'ISO 22000',
  organic: 'Organic Certified',
  allergen: 'Allergen Aware',
}

interface Props {
  certifications: string[]
  dark?: boolean
}

export default function CertificationBadges({ certifications, dark = false }: Props) {
  if (!certifications || certifications.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {certifications.map((cert) =>
        CERTIFICATIONS[cert] ? (
          <span
            key={cert}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
              dark
                ? 'border-white/25 text-white/80 bg-white/10'
                : 'border-gray-300 text-gray-600 bg-white/80'
            }`}
          >
            <span>✓</span>{CERTIFICATIONS[cert]}
          </span>
        ) : null
      )}
    </div>
  )
}
