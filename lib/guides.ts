// Content hub articles. Each guide is plain structured data rendered by
// app/(marketing)/guides — add new articles here and they appear in the
// index, the sitemap and search.

export interface GuideSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface Guide {
  slug: string
  title: string
  description: string
  updated: string // ISO date
  minutes: number
  audience: 'caterer' | 'customer'
  sections: GuideSection[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'start-a-catering-business-from-home-uk',
    title: 'How to start a catering business from home in the UK',
    description:
      'Registration, food hygiene ratings, insurance and getting your first bookings — the practical checklist for starting a home catering business in the UK.',
    updated: '2026-07-06',
    minutes: 8,
    audience: 'caterer',
    sections: [
      {
        heading: 'Yes, you can legally cater from home',
        paragraphs: [
          'Thousands of UK caterers run successful businesses from a domestic kitchen. There is no special licence needed to start — but there are legal steps you must take before you sell your first plate of food, and skipping them can mean fines or being shut down just as you get going.',
          'This guide walks through each step in the order you should do them, with realistic costs. Most people can complete the lot inside three to four weeks.',
        ],
      },
      {
        heading: 'Step 1 — Register your food business (free, do it 28 days before trading)',
        paragraphs: [
          'You must register with the environmental health team at your local council at least 28 days before you start trading. Registration is free, cannot be refused, and applies to home kitchens just like commercial ones. You register once per premises — search "register a food business" plus your council name, or start from GOV.UK.',
          'After you register, an environmental health officer will arrange an inspection of your kitchen. This is where your food hygiene rating comes from.',
        ],
      },
      {
        heading: 'Step 2 — Get your food hygiene rating (aim for the 5)',
        paragraphs: [
          'Your inspection scores food handling, the condition of your kitchen, and how you manage food safety on paper. The result is your 0–5 food hygiene rating, published on the Food Standards Agency website where any customer can look you up.',
          'A 5 rating is very achievable in a domestic kitchen. Before the visit: document your cleaning schedule, keep raw and cooked food storage separate, fit a fridge thermometer, and write up your food safety management system — the FSA’s free "Safer Food, Better Business" pack is designed exactly for small caterers and is what most inspectors expect to see.',
          'Display the rating everywhere once you have it. For event customers choosing between two unknown caterers, a visible 5-star hygiene rating is often the deciding factor.',
        ],
      },
      {
        heading: 'Step 3 — Food safety training and allergen rules',
        paragraphs: [
          'There is no legal requirement to hold a certificate, but you must be able to show you’re trained appropriately for what you do. In practice, a Level 2 Food Safety & Hygiene for Catering certificate (online, typically £15–£30, done in an afternoon) is the accepted standard and inspectors like to see it.',
          'Allergen law does apply to you in full: you must be able to tell every customer which of the 14 regulated allergens each dish contains. Keep a written allergen matrix for your menu and update it whenever a recipe changes — it protects your customers and you.',
        ],
      },
      {
        heading: 'Step 4 — Insurance, HMRC and money basics',
        paragraphs: [
          'Public and product liability insurance is essential — many venues will not let you serve on site without proof of £5m public liability. Specialist small-caterer policies start around £10–£20 a month.',
          'Register as self-employed with HMRC (free, online) by 5 October following the end of the tax year in which you started. Open a separate bank account for the business from day one; it makes pricing, tax and invoicing dramatically less painful.',
        ],
      },
      {
        heading: 'Step 5 — Get bookable before you get busy',
        paragraphs: [
          'Most home caterers start by taking orders through Instagram DMs and WhatsApp. It works for the first few orders, then quickly becomes the biggest source of stress: quotes buried in chats, no deposits, double-booked dates, menus sent as screenshots.',
          'Set up a simple online presence that can actually take an order before you start promoting yourself: a page with your real menu and prices, an order or quote-request form, your hygiene rating and reviews, and a way to get paid. That is exactly what Caterfy gives you for £10/month with no commission — your menu, orders, quotes, invoices and payments on one page at caterfy.com/your-name, live in an afternoon.',
        ],
      },
      {
        heading: 'The complete pre-launch checklist',
        paragraphs: ['Work down this list and you can trade with complete confidence:'],
        bullets: [
          'Registered with the council (28+ days before trading) — free',
          'Kitchen inspection passed, hygiene rating displayed',
          'Level 2 Food Safety certificate done (~£20)',
          'Written allergen matrix for every dish',
          'Public liability insurance in place (~£15/month)',
          'Registered self-employed with HMRC',
          'Separate business bank account',
          'A bookable online page with menu, prices and an order form',
        ],
      },
    ],
  },
  {
    slug: 'take-catering-orders-online',
    title: 'How to take catering orders online (without a developer)',
    description:
      'A practical guide for caterers who take bookings through DMs and want a proper online ordering system — what you need, what it should cost, and how to switch without losing customers.',
    updated: '2026-07-06',
    minutes: 6,
    audience: 'caterer',
    sections: [
      {
        heading: 'The DM problem',
        paragraphs: [
          'Most independent caterers take orders the same way: a customer sees a post, sends a DM, and a long back-and-forth begins — date, guest numbers, dietary requirements, address, deposit. Multiply that by every enquiry, add the ones who vanish mid-conversation, and order admin quietly becomes a second job.',
          'The fix is not "get a website". A brochure website moves the conversation from Instagram to email and changes nothing. What you need is an ordering system: somewhere a customer can see your real menu with prices, pick what they want or describe their event, choose a date you’re actually free, and pay — without you typing a single message.',
        ],
      },
      {
        heading: 'What a real catering order flow needs',
        paragraphs: ['Whatever tool you choose, check it can do all of these — each one removes a whole category of DM back-and-forth:'],
        bullets: [
          'Fixed-price ordering for set items (trays, boxes, per-head packages) with quantities',
          'Quote requests for bespoke events — capturing date, guest count, location and requirements in one structured form',
          'Availability control: block out dates you can’t cater so they can’t be booked',
          'Stock limits for items you can only make so many of',
          'Payment options that match how you work: card, bank transfer, or pay on the day',
          'Automatic confirmations so the customer isn’t left wondering if you saw their order',
          'One inbox where every order and its status lives',
        ],
      },
      {
        heading: 'Your three realistic options',
        paragraphs: [
          'Option 1 — a generic website builder (Squarespace, Wix): £15–£30/month. Looks professional, but ordering is bolted on at best; catering-specific needs like quote requests, per-person pricing, guest counts and date blocking aren’t really supported. You’ll still be doing order admin in messages.',
          'Option 2 — marketplaces and lead-gen sites: free to join, then you pay per lead or per booking — commonly 10–20% of the job or several pounds per lead, whether or not it converts. Fine for topping up quiet months; expensive as your main channel, and the customer relationship belongs to the platform.',
          'Option 3 — a catering-specific ordering page. This is the category Caterfy is in: £10/month flat, no commission, and the order flow is built for catering — fixed orders and quote requests, availability blocking, stock limits, discount codes, invoices, and card, bank-transfer or pay-later payments. Your page lives at caterfy.com/your-name and is listed in a directory customers browse by location and cuisine.',
        ],
      },
      {
        heading: 'Switching without losing customers',
        paragraphs: [
          'You don’t need to stop using Instagram — you need Instagram to end somewhere better than your DMs. The switch is three small moves:',
        ],
        bullets: [
          'Put your ordering link in your bio and pin a story highlight called "Order" explaining it',
          'Reply to every "how do I order?" DM with the link — one message instead of twenty',
          'Add a QR code to your market stall, packaging or flyers pointing at your page',
        ],
      },
      {
        heading: 'What changes in practice',
        paragraphs: [
          'Caterers who move ordering out of their DMs consistently report the same three changes: enquiries arrive complete (date, numbers, requirements in one go), no-shows drop because confirmation emails and payment happen up front, and evenings stop being admin time.',
          'You can try the whole flow on Caterfy free for 14 days — no card required. Set up your menu, share your link, and take your next order without the back-and-forth.',
        ],
      },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
