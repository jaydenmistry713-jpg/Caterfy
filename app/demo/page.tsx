import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import CatererPageModern from '@/components/caterer/template-modern'

// A fully designed example caterer site ("The Willow Pantry" — the same
// fictional business as the homepage hero demo), rendered through the real
// Modern template with hand-picked editor settings: Playfair Display /
// Nunito, terracotta accent, certifications, menu, packages, gallery and
// reviews. Static mock data — no Supabase. Order/message forms render but
// point at a non-existent caterer id, so nothing can actually be created.
// noindex: it's a fictional business, not real search content.

export const metadata: Metadata = {
  title: 'Example caterer site — Caterfy demo',
  description:
    'A live example of a Caterfy site: menu, packages, gallery, reviews and online ordering, built with the site editor.',
  robots: { index: false, follow: false },
}

const DEMO_CATERER_ID = '00000000-0000-4000-8000-00000000demo'

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`

const caterer = {
  id: DEMO_CATERER_ID,
  business_name: 'The Willow Pantry',
  slug: 'demo',
  email: 'hello@thewillowpantry.co.uk',
  phone: '0117 496 0842',
  show_contact_publicly: true,
  is_accepting_orders: true,
  business_mode: 'full',
  subscription_status: 'active',
  stripe_connect_id: null, // card option hidden — demo orders default to offline
  bank_transfer_details: 'The Willow Pantry\nSort code: 00-00-00\nAccount: 12345678',
  min_catering_guests: 10,
  max_catering_guests: 150,
  location: { name: 'Bristol' },
  page: {
    template: 'modern',
    tagline: 'Seasonal grazing tables & private feasts, made by hand in Bristol.',
    about:
      'The Willow Pantry began as a market stall and a very heavy cheese board. Six years on, we build grazing tables, canapé menus and slow-cooked feasts for weddings, birthdays and long lunches across the South West. Everything is made from scratch the morning of your event, with produce from farms we can name — and usually visit on the way.',
    primary_color: '#2D3A2E',
    secondary_color: '#5B6156',
    accent_color: '#d4732a',
    heading_font: 'Playfair Display',
    body_font: 'Nunito',
    background_color: '#FFFFFF',
    logo_url: null,
    hero_image_url: img('1555244162-803834f70033', 2000),
    template_data: {
      certifications: ['hygiene_5', 'fsa', 'allergen'],
      hero_overlay: 45,
    },
  },
}

const menuItems = [
  // Grazing & boards
  { id: 'd-m1', category: 'Grazing & Boards', name: 'Signature grazing table', description: 'Our centrepiece: British and continental cheeses, cured meats, house pickles, seasonal fruit, warm focaccia and honeycomb, styled on the table.', price: 9.5, price_unit: 'per person', image_url: img('1504674900247-0877df9cc836', 800), is_available: true },
  { id: 'd-m2', category: 'Grazing & Boards', name: 'Brunch board', description: 'Mini pastries, whipped ricotta with roasted stone fruit, granola pots and smoked salmon bagels.', price: 7.5, price_unit: 'per person', is_available: true },
  { id: 'd-m3', category: 'Grazing & Boards', name: 'Ploughman’s box for two', description: 'A picnic-ready box: farmhouse cheddar, honey-glazed ham, sourdough, chutney and an apple each.', price: 24, price_unit: 'per item', is_available: true },
  // Canapés
  { id: 'd-m4', category: 'Canapés', name: 'Wild mushroom arancini', description: 'Crisp risotto bites with black garlic aioli. Vegetarian.', price: 2.8, price_unit: 'per item', image_url: img('1476224203421-9ac39bcb3327', 800), is_available: true },
  { id: 'd-m5', category: 'Canapés', name: 'Smoked trout blinis', description: 'Chalk-stream trout, crème fraîche, pickled shallot and dill.', price: 3.2, price_unit: 'per item', is_available: true },
  { id: 'd-m6', category: 'Canapés', name: 'Sticky fig & goat’s cheese crostini', description: 'Whipped goat’s cheese, roasted figs and thyme honey on toasted baguette.', price: 2.6, price_unit: 'per item', is_available: true },
  // Feasts & mains
  { id: 'd-m7', category: 'Feasts & Mains', name: 'Slow-roast lamb shoulder feast', description: 'Eight-hour lamb with flatbreads, whipped feta, charred greens and herbed grains, served family-style.', price: 18.5, price_unit: 'per person', image_url: img('1555939594-58d7cb561ad1', 800), is_available: true },
  { id: 'd-m8', category: 'Feasts & Mains', name: 'Harissa cauliflower feast', description: 'Whole-roasted cauliflower, smoked almond dukkah, jewelled couscous and green tahini. Vegan.', price: 14, price_unit: 'per person', is_available: true },
  // Desserts
  { id: 'd-m9', category: 'Desserts', name: 'Brown butter & sea salt brownies', description: 'Baked the morning of your event. Gluten-free option available.', price: 3, price_unit: 'per item', image_url: img('1540189549336-e6e99c3679fe', 800), is_available: true },
  { id: 'd-m10', category: 'Desserts', name: 'Lemon posset pots', description: 'With shortbread crumb and candied lemon.', price: 3.5, price_unit: 'per item', is_available: true },
]

const packages = [
  { id: 'd-p1', name: 'The Long Lunch', description: 'Grazing table plus two canapé choices for up to 30 guests. Ideal for birthdays, baby showers and office celebrations.', price: 395, is_popular: false, is_available: true },
  { id: 'd-p2', name: 'The Willow Signature', description: 'Our most-booked package: full grazing table, four canapés, one feast main and dessert for up to 60 guests, with on-the-day styling.', price: 895, is_popular: true, is_available: true },
  { id: 'd-p3', name: 'The Full Spread', description: 'The works for up to 120 guests — grazing, canapé hour, two feast mains, dessert table and two of our team serving all evening.', price: 1650, is_popular: false, is_available: true },
]

const gallery = [
  { id: 'd-g1', image_url: img('1533777857889-4be7c70b33f7', 900), caption: 'Wedding grazing table, Somerset' },
  { id: 'd-g2', image_url: img('1414235077428-338989a2e8c0', 900), caption: 'Plated starter, private dinner' },
  { id: 'd-g3', image_url: img('1547592180-85f173990554', 900), caption: 'Harvest stew, autumn feast' },
  { id: 'd-g4', image_url: img('1467003909585-2f8a72700288', 900), caption: 'Herb-crusted salmon' },
  { id: 'd-g5', image_url: img('1546069901-ba9599a7e63c', 900), caption: 'Summer salads' },
  { id: 'd-g6', image_url: img('1529042410759-befb1204b468', 900), caption: 'Cheese course' },
]

const reviews = [
  { id: 'd-r1', rating: 5, customer_name: 'Hannah & Tom', event_type: 'Wedding', created_at: '2026-06-14T10:00:00Z', review_text: 'The grazing table was the first thing every guest mentioned and the last thing they left alone. Beautiful, generous and completely stress-free on the day.', caterer_response: 'Thank you both — it was a joy. Congratulations again!' },
  { id: 'd-r2', rating: 5, customer_name: 'Priya S.', event_type: 'Corporate', created_at: '2026-05-28T10:00:00Z', review_text: 'Booked the Long Lunch for a client day. Communication was instant, the food arrived styled and ready, and the office still talks about the arancini.' },
  { id: 'd-r3', rating: 4, customer_name: 'Mark D.', event_type: 'Birthday', created_at: '2026-05-02T10:00:00Z', review_text: 'Brilliant spread for my wife’s 50th. Only wish we’d ordered more of the brownies — they vanished in minutes.' },
  { id: 'd-r4', rating: 5, customer_name: 'Eleanor W.', event_type: 'Private dinner', created_at: '2026-04-11T10:00:00Z', review_text: 'The lamb feast is genuinely restaurant quality. They handled a coeliac and two vegans without a single fuss.' },
]

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap'

export default function DemoPage() {
  return (
    <>
      <link rel="stylesheet" href={FONT_HREF} />
      <CatererPageModern
        caterer={caterer}
        menuItems={menuItems}
        packages={packages}
        gallery={gallery}
        reviews={reviews}
      />

      {/* Floating demo bar — kept above the template content */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl">
        <div
          className="flex items-center justify-between gap-3 rounded-full px-5 py-3 shadow-2xl"
          style={{ background: '#182A20', color: '#F7F2E7', border: '1px solid rgba(247,242,231,0.16)' }}
        >
          <p className="text-[13px] leading-snug">
            <span className="font-bold">This is an example site</span>
            <span className="hidden sm:inline" style={{ opacity: 0.75 }}>
              {' '}— built with the Caterfy editor, no code
            </span>
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold whitespace-nowrap"
            style={{ background: '#E8A33D', color: '#182A20' }}
          >
            Build yours free
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </>
  )
}
