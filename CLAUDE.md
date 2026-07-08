# Caterfy - Claude Code Instructions

## Project Overview

Caterfy is a SaaS platform that provides affordable website building and marketplace services for catering businesses. Caterers pay £10/month (UK) or $12/month (US) for a professional online presence with built-in customer discovery.

**Status: TEST MODE** - All integrations in test mode until finalised.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js |
| Hosting | Netlify (with environment variables) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (caterers only) |
| Image Storage | Supabase Storage |
| API | Next.js API routes + Supabase Edge Functions |
| Payments (subscriptions) | Stripe Billing |
| Payments (caterer payouts) | Stripe Connect |
| Email | Resend |
| Analytics | Google Analytics |

## Project Structure

```
caterfy/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public marketing pages
│   │   ├── page.tsx        # Homepage (directory-first)
│   │   └── layout.tsx
│   ├── (auth)/             # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify-email/
│   ├── (dashboard)/        # Caterer dashboard (protected)
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── menu/
│   │   ├── site-editor/
│   │   ├── gallery/
│   │   ├── reviews/
│   │   ├── availability/
│   │   ├── analytics/
│   │   ├── payments/
│   │   ├── invoices/
│   │   └── settings/
│   ├── (admin)/            # Admin dashboard
│   │   └── mistuzzo/       # Admin route
│   ├── directory/          # Public directory
│   │   ├── page.tsx        # All caterers
│   │   └── [location]/     # Filtered by location
│   │       └── [cuisine]/  # Filtered by location + cuisine
│   ├── [slug]/             # Individual caterer pages
│   └── api/                # API routes
│       ├── webhooks/
│       │   ├── stripe/
│       │   └── resend/
│       ├── orders/
│       ├── quotes/
│       └── reviews/
├── components/
│   ├── ui/                 # Shared UI components
│   ├── caterer/            # Caterer-specific components
│   ├── customer/           # Customer-facing components
│   ├── dashboard/          # Dashboard components
│   └── admin/              # Admin components
├── lib/
│   ├── supabase/           # Supabase client and utilities
│   ├── stripe/             # Stripe client and utilities
│   ├── resend/             # Email utilities
│   └── utils/              # Helper functions
├── types/                  # TypeScript types
├── public/                 # Static assets
└── supabase/
    ├── migrations/         # Database migrations
    └── functions/          # Edge Functions
```

## Database Schema

### Core Tables

```sql
-- Caterers (business accounts)
caterers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  location_id UUID REFERENCES locations(id),
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,
  subscription_status TEXT, -- 'trialling', 'active', 'cancelled', 'past_due'
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  is_accepting_orders BOOLEAN DEFAULT true,
  max_orders_per_week INTEGER,
  auto_accept_orders BOOLEAN DEFAULT false,
  show_contact_publicly BOOLEAN DEFAULT true,
  business_mode TEXT DEFAULT 'full', -- 'full', 'catering_only', 'items_only'
  bank_transfer_details TEXT,
  show_bank_details_on_invoice BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Caterer page content and branding
caterer_pages (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  template TEXT DEFAULT 'classic', -- 'classic', 'modern', 'bold', 'linkpage', 'maison'
  tagline TEXT,
  about TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#666666',
  accent_color TEXT DEFAULT '#2E75B6',
  heading_font TEXT DEFAULT 'Arial',
  body_font TEXT DEFAULT 'Arial',
  background_color TEXT DEFAULT '#FFFFFF',
  logo_url TEXT,
  hero_image_url TEXT,
  terms_conditions TEXT,
  template_data JSONB DEFAULT '{}', -- shared: certifications[]; linkpage: chips, badge1, badge2, instagram, cta_label, extras, faqs; maison: { accent, band, paper } palette ids
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Menu items
menu_items (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  category TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_unit TEXT DEFAULT 'per person', -- 'per person', 'per item', 'flat'
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  stock_limit INTEGER, -- NULL = unlimited; enforced at checkout
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Packages
packages (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  min_guests INTEGER,
  max_guests INTEGER,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Gallery images
gallery_images (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Orders
orders (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  customer_id UUID REFERENCES customers(id),
  reference_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'cancelled', 'completed'
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'awaiting_payment', 'paid', 'refunded'
  payment_method TEXT, -- 'card', 'offline'
  order_type TEXT, -- 'fixed', 'quote'
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  event_location TEXT,
  event_type TEXT,
  guest_count INTEGER,
  items JSONB, -- Array of {item_id, quantity, price}
  subtotal DECIMAL(10,2),
  total DECIMAL(10,2),
  special_requests TEXT,
  dietary_requirements TEXT,
  additional_comments TEXT,
  stripe_payment_intent_id TEXT,
  discount_code TEXT,
  discount_amount DECIMAL(10,2),
  reminder_sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Quotes
quotes (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  order_id UUID REFERENCES orders(id),
  line_items JSONB, -- Array of {description, amount}
  total DECIMAL(10,2),
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'accepted', 'declined'
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Reviews
reviews (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  order_id UUID REFERENCES orders(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  event_type TEXT,
  caterer_response TEXT,
  caterer_responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Customers (optional accounts)
customers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Invoices
invoices (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  order_id UUID REFERENCES orders(id), -- NULL for manual invoices
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  line_items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid'
  due_date DATE,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Blocked dates
blocked_dates (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Caterer cuisine types (junction table)
caterer_cuisines (
  caterer_id UUID REFERENCES caterers(id),
  cuisine_id UUID REFERENCES cuisines(id),
  PRIMARY KEY (caterer_id, cuisine_id)
)

-- Caterer event types (junction table)
caterer_event_types (
  caterer_id UUID REFERENCES caterers(id),
  event_type_id UUID REFERENCES event_types(id),
  PRIMARY KEY (caterer_id, event_type_id)
)

-- Caterer dietary options (junction table)
caterer_dietary_options (
  caterer_id UUID REFERENCES caterers(id),
  dietary_option_id UUID REFERENCES dietary_options(id),
  PRIMARY KEY (caterer_id, dietary_option_id)
)

-- Discount codes
discount_codes (
  id UUID PRIMARY KEY,
  caterer_id UUID REFERENCES caterers(id),
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percent', 'fixed'
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Reference Tables

```sql
-- Cuisines
cuisines (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Event types
event_types (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Dietary options
dietary_options (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Locations (UK/US cities and towns)
locations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  country TEXT NOT NULL, -- 'UK', 'US'
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Admin Tables

```sql
-- Global settings
settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Admin users
admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Environment Variables

Required in Netlify:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://caterfy.com

# Admin panel (/mistuzzo) — required for admin login
ADMIN_PASSWORD=
# Optional: overrides the key used to sign the admin cookie (defaults to service-role key)
ADMIN_SECRET=

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Lifecycle cron (July 2026) — shared secret between the Netlify scheduled
# function (netlify/functions/lifecycle-cron.mjs) and /api/cron/daily.
# Set this exact value in Netlify env vars (the app reads it from there, not from this file):
CRON_SECRET=d6bc90616025100bff05339ad2e0bc6dc8685ea959e90ccf6d24ec2531928f9d

# Support email shown in footer/FAQ/sidebar and used as reply-to on all emails
# (defaults to hello@caterfy.com when unset)
NEXT_PUBLIC_SUPPORT_EMAIL=
```

## URL Structure

### Caterer Sites
- `caterfy.com/[slug]` - Individual caterer page (single page with sections)
- Sections: #about, #menu, #gallery, #reviews, #contact, #order

### Directory
- `caterfy.com/directory` - All caterers
- `caterfy.com/directory/[location]` - By location
- `caterfy.com/directory/[location]/[cuisine]` - By location and cuisine

### Dashboard
- `caterfy.com/dashboard` - Caterer dashboard home
- `caterfy.com/orders` - Orders management
- `caterfy.com/menu` - Menu/services editor
- etc.

### Admin
- `caterfy.com/mistuzzo` - Admin dashboard

## Build Status

All phases are implemented and the app builds successfully (Next.js 16, 51 routes).

### Completed
- **Growth/SEO/lifecycle pass (July 2026)** — implemented from the audit in `Caterfy-Audit-and-Marketing-Plan.pdf`:
  - SEO: caterer-first root metadata + `metadataBase`; OG/Twitter tags site-wide with branded `public/og-image.png`; per-caterer OG using their hero image; favicon `app/icon.png` + `app/apple-icon.png`; `app/sitemap.ts` (static + guides + live caterers + non-empty location/cuisine pages, falls back to static routes if Supabase is unreachable at build) + `app/robots.ts`; JSON-LD everywhere (Organization/WebSite in root, FoodEstablishment+AggregateRating on `/[slug]`, FAQPage on `/faq`, ItemList/Breadcrumb on directory, Article on guides); canonical URLs; unknown directory location/cuisine slugs now 404
  - Directory: **trialling caterers are now listed** (matches the "every site is listed" promise); real review ratings on cards (joined `reviews(rating)`, replacing dead `avg_rating` code); pagination on the index (24/page); "Browse by city" + "Popular cuisines in {city}" internal-link blocks; empty states are caterer-acquisition CTAs ("Get listed free"); locations passed to the location-page filter sidebar
  - Landing page restructure: 11 feature cards → **4 job clusters** (Look professional / Take orders / Get paid / Get found) with checkmark bullets; trust marquee now shows category words (no fictional business names); fictional testimonial removed, replaced by a 5-item FAQ accordion (`.mk-faq` in marketing.css); founder note section; "No card required" microcopy on hero/pricing/final CTA; pricing comparison line
  - Funnel: **forgot/reset-password flow** (`/forgot-password`, `/reset-password`); verify-email page shows the address, has a resend button (60s cooldown) + spam hint; signup form has live slug preview, password visibility toggle, reassurance microcopy; auth layout shows trial reassurances; **soft-expiry page** for lapsed caterer sites (branded "taking a break" + directory link instead of 404; trialling accounts past `trial_ends_at` also soft-expire; lapsed pages get `noindex`)
  - Growth loops: **publish-&-share dialog** (`components/dashboard/share-site-dialog.tsx`) — copy link, WhatsApp share, QR download (`qrcode` npm package), A5 "Scan to order" poster (canvas), Instagram bio tip; opens automatically after first real site-editor save and via a Share button; sharing sets `caterers.link_shared_at`; dashboard checklist has a "Share your link" final step (and now **requires location** for basic info)
  - Analytics: **page-view counter** — `/[slug]` calls `increment_page_view` RPC (SECURITY DEFINER, migration 012); 30-day views on dashboard + analytics pages; GA4 events (`lib/analytics.ts` `track()`): sign_up, publish_site/save_site, share_link, place_order, begin_subscribe; **UTM first-touch capture** (`components/marketing/attribution.tsx` → localStorage → signup metadata → `caterers.signup_source`, written via separate best-effort update)
  - Compliance: **cookie-consent banner** (`components/ui/cookie-consent.tsx`) — GA only loads after accept (localStorage `caterfy_cookie_consent`); support email (`lib/site.ts` `SUPPORT_EMAIL`, env `NEXT_PUBLIC_SUPPORT_EMAIL`) in footer, FAQ, dashboard sidebar and as reply-to on all emails
  - Emails: `lib/resend/emails.ts` fully restyled to brand (basil/cream/marigold, Georgia headings, pill buttons); customer-facing emails carry a UTM-tagged "Powered by Caterfy" footer line; welcome email trial copy fixed (starts at signup); **new lifecycle emails**: trial day 1 / day 7 (with stats) / ending / ended, order auto-cancelled, first-order celebration (sent inline from `/api/orders` on a caterer's first order), monthly summary
  - **Daily cron** `/api/cron/daily` (guarded by `CRON_SECRET` header `x-cron-key`): trial lifecycle emails (idempotent via `lifecycle_emails` unique key), order reminder after 24h pending (sets `reminder_sent_at`), auto-cancel after 48h (+ customer email), review requests 1–3 days after event (sets `review_request_sent_at`), monthly summaries on the 1st; triggered by Netlify scheduled function `netlify/functions/lifecycle-cron.mjs` (09:00 UTC daily)
  - "Powered by Caterfy" template footers now use `NEXT_PUBLIC_APP_URL` + UTM params (`lib/site.ts` `poweredByUrl()`)
  - Content hub: `/guides` (marketing layout) with data-driven articles in `lib/guides.ts` (2 published; Article JSON-LD; guides in sitemap + footer)
  - Dashboard fixes: Total Orders / Reviews stats use exact counts (were capped at 5/3 by query limits); "tutorial video coming soon" placeholder removed; dashboard + analytics pages swept from `gray-*` to theme tokens; 404 page themed
  - `lib/site.ts` exports `SITE_URL` (from `NEXT_PUBLIC_APP_URL`, fallback caterfy.netlify.app) and `SUPPORT_EMAIL` — use these, never hardcode caterfy.com
- Marketing landing page (caterer-first, redesigned July 2026) — see "Marketing Landing Page" section below
- Caterer signup/login with email verification (Supabase Auth)
- 14-day trial on signup, caterer record auto-created on email verify
- Site builder: 5 templates (Classic, Modern, Bold, Link Page, Maison), branding, content, image uploads, URL slug
  - Template picker shows mini wireframe previews of each layout (not just a label)
  - Animated 4-step onboarding wizard on first visit to site editor (template → accent colour → tagline → URL); final button says "Publish" and saves slug + page settings; slug saved to caterers table
  - After completing onboarding, automatically switches to Content tab with a nudge banner to add hero image and about text
  - Hero image field has a plain-language description explaining what it is
- Individual caterer public pages at `/{slug}`
- Menu/packages editor with delete for both items and packages
- Gallery manager (Supabase Storage, `caterer-images` bucket); no captions/descriptions on images
- Orders dashboard with fixed-price and quote flows
  - Fixed-price orders and quote requests use differentiated forms (fixed: name/email/phone/date/delivery address with optional dietary+notes; quote: full event details with requirements textarea)
  - Fixed-price checkout payment options: card (only if caterer Stripe connected), bank transfer (only if caterer has bank details set), pay later; quote requests have no payment step
  - Card payment option hidden and default payment set to offline when caterer has not connected Stripe
  - Card payments create a Stripe Checkout Session (destination charge to caterer's connected account); customer is redirected to Stripe to pay, then back to /order-status; webhook `checkout.session.completed` marks order as paid
  - "Mark as Completed" button available on all accepted orders (not gated to offline payment)
  - Delete button available on all orders (in expanded view)
  - Order accept/decline sends email via API route (`/api/orders/[id]`) with review link in acceptance email
- Quote builder dialog (send quote → customer gets email with accept link)
- Availability/blocked dates manager
- Reviews dashboard with caterer response
- Invoices manager — create custom invoices or generate from any accepted/completed order; send via email button; bank transfer details auto-included in invoice emails when configured
- Discount codes — full CRUD at `/discount-codes`; customers can apply codes at checkout; validated via `/api/discount-codes/validate`
- Stripe Billing subscription flow (£10/month, checkout + portal)
- Stripe Connect onboarding for caterer payouts (simplified 3-step flow); Payments page shows Stripe fee info (1.2% + 20p), catering quote disclaimer, and requires agreement checkbox before connecting
- Stripe webhooks (subscription lifecycle, payment events)
- Resend email notifications (orders, quotes, reviews, auth, invoices); order confirmation + acceptance emails include an itemised "Your items" table
- Admin dashboard at `/mistuzzo` — **password-protected** via cookie auth (`lib/admin/auth.ts`, login at `/mistuzzo/login`, `POST/DELETE /api/admin/login`). Requires `ADMIN_PASSWORD` env var; cookie is an HMAC of the password keyed by `ADMIN_SECRET` (falls back to the service-role key). "View site" links go to the caterer's real `/{slug}` page
- Directory with location + cuisine filters
- Order status lookup page (`/order-status`)
- Customer review submission page (`/review`)
- Legal pages (terms, privacy, cookies)
- FAQ page at `/faq` (10 caterer FAQs + 6 customer FAQs)
- Order form category filter: pill buttons let customers filter menu items by category (shown when 2+ categories exist)
- Logo on caterer public pages displays at h-14 (56px) for better visibility
- "Powered by Caterfy" footer on all four caterer page templates
- Mobile navigation: topbar has a slide-out drawer with full nav for mobile
- Dashboard onboarding wizard: animated 4-step full-screen overlay shown once after email verification (phone → location → cuisines → event types); events step has an "All events" chip to select all at once
- Loading skeleton (`app/(dashboard)/loading.tsx`) for Suspense-based page transitions
- Dashboard setup checklist shows **all items** at all times; completed items show a green tick with strikethrough; "You're all set!" only when all done; branding marked done when tagline or accent colour is set
- Order button differentiated into two cards: "Order items" (fixed, shopping bag) and "Request a catering quote" (document icon with description text)
- Business mode setting (Settings → Business Profile): `full` / `catering_only` / `items_only` — controls which order options appear on the public page
- Menu item stock limits: optional per-item inventory cap set in menu editor; enforced in the order form with "X remaining" indicator
- Expandable menu item descriptions: descriptions hidden by default on Classic and Modern templates; chevron appears for items with a description; click/tap to expand. LinkPage accordion items also expand descriptions on tap.
- Food certifications: 10 UK accreditations (Halal, Hygiene 5★, Kosher, FSA, Vegan Society, SALSA, BRC, ISO 22000, Organic, Allergen Aware) selectable in Site Editor → Content; rendered as badges in the hero section of all 4 templates. Stored in `caterer_pages.template_data.certifications`.
- Send message form on all caterer public pages (Contact section); submits to `/api/messages` which emails the caterer (with reply-to set) and sends an auto-reply to the customer
- Payment methods (Visa, Mastercard, Amex, Apple Pay, Google Pay, Bank Transfer, Pay Later) supported at checkout; the old homepage payment-methods strip was removed in the July 2026 landing page redesign
- Bank transfer payment option: caterer enters account details in Settings → Payments; shown to customers at checkout on fixed orders; bank details shown on order confirmation and optionally auto-included on invoice emails (toggle in Settings → Payments)
- Site editor Save Changes button only active when unsaved changes exist; resets after successful save
- Dashboard performance: `getUser()` in `lib/supabase/server.ts` is wrapped with React `cache()` so `auth.getUser()` fires once per request even though layout and page both call it; all dashboard pages use this cached helper instead of calling `supabase.auth.getUser()` directly
- App-wide brand theme (July 2026): the homepage's fonts + warm colour palette are applied across dashboard, auth, admin, directory and customer utility pages via a global `.app-theme` class + themed `ui/*` primitives, keeping each page's layout intact; caterer public `/[slug]` pages are excluded (keep their own branding). See "App Theme (brand skin)" section below
- Storage cleanup on image delete (July 2026): deleting a gallery photo, or removing/replacing a hero image or logo in the site editor, now also deletes the underlying file from the `caterer-images` bucket so nothing is left orphaned. Deletion goes through `POST /api/images/delete` (service role via the Storage API — direct SQL deletes from `storage.objects` are blocked by Supabase's `protect_delete` trigger); the route only removes objects under the signed-in caterer's own prefixes (`hero/{id}.*`, `logos/{id}.*`, `gallery/{id}/*`). Helpers live in `lib/supabase/storage.ts` (`objectPathFromPublicUrl`, `deleteStoredImages`)

### Pending / Not Yet Built
- ~~Order reminder cron (email caterer after 24hr, auto-cancel at 48hr)~~ **DONE (July 2026)**: `/api/cron/daily` + Netlify scheduled function; requires `CRON_SECRET` env var + migration 012
- ~~Review request email trigger (1 day after event date)~~ **DONE (July 2026)**: same cron; sets `orders.review_request_sent_at`
- ~~Google Analytics~~ **DONE**: gtag loads in `app/layout.tsx` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set — **now consent-gated** via the cookie banner (July 2026)
- ~~Google Fonts loading~~ **DONE**: `app/[slug]/page.tsx` injects a `fonts.googleapis.com` stylesheet for the caterer's selected heading/body fonts

### QA follow-ups from tester feedback — all five now BUILT (July 2026)
The five larger items deferred after the tester-feedback fix waves have now been implemented:
1. ~~**Live preview in the site editor**~~ **DONE**: `components/dashboard/site-live-preview.tsx` renders the *real* template components (`template-classic/modern/bold/linkpage/maison`) at a scaled logical width (desktop 1200 / mobile 390) inside a scroll viewport, driven live by the editor's in-progress state. `site-editor-form.tsx` builds a `previewCaterer` (with `.page`) via `useMemo` from the form/templateData/maison/hero/logo/slug state; the editor page now also loads the caterer's real menu/packages/gallery/reviews (+ location/event-type/dietary joins) to feed it. Two-pane on `xl` (sticky preview right, toggle with Show/Hide), full-screen overlay via a "Preview" button below `xl`. Fonts injected via a `<link>` (maison loads its own). Preview is `pointer-events-none` + `aria-hidden`.
2. ~~**Inline card checkout**~~ **DONE**: card orders now use Stripe **Embedded Checkout** inline in the order dialog instead of redirecting. `/api/orders` creates the session with `ui_mode: 'embedded_page'` (NB: the pinned `2026-04-22.dahlia` API renamed the enum — it's `embedded_page`/`hosted_page`, not `embedded`/`hosted`) + `return_url`, returns `client_secret`; `components/caterer/embedded-checkout.tsx` renders `EmbeddedCheckoutProvider`/`EmbeddedCheckout` (`loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`); `order-form.tsx` shows it when `client_secret` comes back. On completion Stripe redirects the top window to `/order-status`, which reconciles via the **same** `reconcileCardPayment` no-webhook path (retrieve session → mark paid + auto-accept + email). Destination charge to the connected account is unchanged.
3. ~~**Move bank-transfer details to Payments page**~~ **DONE**: extracted into `components/dashboard/bank-details-form.tsx`, now rendered on `/payments` (below Stripe Connect status). Removed from Settings; the Settings "Payments" tab is gone and `?tab=payments` deep-links redirect to the subscription tab.
4. ~~**Expanded admin actions** at `/mistuzzo`~~ **DONE**: new caterer detail page `/mistuzzo/caterers/[id]` (edit business_name/email/phone/slug, suspend/reactivate/mark-active, extend trial +14d, toggle accepting-orders, recent-orders table) + searchable `/mistuzzo/caterers` list; dashboard rows link via "Manage →". All mutations go through `PATCH /api/admin/caterers/[id]` — guarded by `isAdminAuthenticated()`, service-role, allowlisted fields + reversible lifecycle actions only (suspend = `subscription_status='cancelled'` → soft-expiry via `isLive()`). No hard-delete (the FK-ordered deletion runbook stays manual).
5. ~~**Order ↔ invoice paid cross-indicator**~~ **DONE**: orders query joins `invoices(...)`; `orders-list.tsx` rolls them up to one badge (paid > sent > created) in the header + an invoice line in the expanded view. Invoices created "From Order" now persist `order_id` (previously dropped, so the link never formed). Bank-transfer → invoice hand-off: order rows without an invoice show a "Create invoice →" link to `/invoices?from_order={id}`, which auto-opens the create dialog pre-filled from that order (the invoices page fetches the order explicitly so even a still-pending bank-transfer order is selectable).
- ~~**Card payment status update (no-webhook approach)**~~ **DONE (July 2026)**: Card orders now reconcile on the success redirect without needing a webhook.
  - `success_url` in `app/api/orders/route.ts` includes `&session_id={CHECKOUT_SESSION_ID}`
  - The `/order-status` page reconciles server-side when `session_id` is present (`reconcileCardPayment`): retrieves the Stripe session, and if `payment_status === 'paid'` sets the order `payment_status='paid'`, `status='accepted'` (auto-accept), `accepted_at`, `stripe_payment_intent_id`, then emails the customer the acceptance + review link once (guarded against duplicates by checking current `payment_status`)
  - A standalone `/api/orders/verify-payment` route does the same for any client-side caller
  - The `checkout.session.completed` webhook case was **kept** (now also auto-accepts) for resilience if a webhook is configured — it's idempotent with the redirect path

### Backups & disaster recovery — STILL TO BUILD (decided July 2026, deferred; surface whenever the user asks "what's left")
Nothing protects the production data today. Supabase **free tier has no backups** — if the project is lost/corrupted, all caterers, orders, reviews, invoices and auth users are gone. Schema is safe (migrations in git) and payment truth is recoverable from Stripe, but the data, images and auth users are not. Agreed plan, not yet implemented:
1. **Nightly automated `pg_dump`** — GitHub Action on a cron running `supabase db dump` (must include the `auth` schema — `caterers.id == auth user id`, so restoring data without auth locks everyone out), uploading encrypted dumps to private external storage (e.g. Backblaze B2 — ~free at current size). Highest-value item.
2. **Weekly storage sync** — mirror the `caterer-images` bucket (hero/logos/gallery) to the same external storage via the Storage API with the service role; `pg_dump` does NOT cover Storage.
3. **Restore runbook + one dry-run restore** — doc: new Supabase project → run migrations → restore dump → re-upload storage → update Netlify env vars → update Supabase Auth redirect URLs. Test it once into a scratch project before launch.
4. **Secrets escrow** — keep an encrypted offline copy (password manager) of the full env set: Supabase keys, Stripe keys, Resend key, `CRON_SECRET`, `ADMIN_PASSWORD`/`ADMIN_SECRET`.
5. **Upgrade to Supabase Pro at launch** for managed daily backups (7-day retention), keeping the external dumps as the "Supabase itself fails" layer.
6. **Outage resilience (downtime, not loss)** — error boundaries on `/[slug]` and `/directory` rendering a branded "we'll be right back" instead of a 500; order-form submission failure should say "try again shortly" rather than silently losing the customer's details; optionally ISR/short-cache public caterer pages so they keep serving through a brief Supabase blip.

### Product & robustness backlog — STILL TO BUILD (deferred July 2026; surface whenever the user asks "what's left")
Discussed in the "what improvements" review and deliberately not built yet. Roughly priority-ordered:

**Launch blockers (make the live product actually function):**
- **Resend domain verification** — until a domain is verified and `RESEND_FROM_DOMAIN` is set, every email (orders, quotes, review requests, the whole lifecycle sequence) only delivers to the Resend account owner. Highest-impact unfinished task. Also unlocks Supabase custom SMTP for branded verification emails.
- **Stripe live mode + real domain switch** — write down the cutover checklist before launch day: recreate webhook, activate Connect, update Supabase Auth redirect URLs, set `NEXT_PUBLIC_APP_URL`, swap test→live keys.
- **Error visibility** — no error tracking or uptime monitoring exists. Add Sentry (free tier) for server/client errors and a free uptime ping against a `/api/health` route, so a broken checkout surfaces without waiting for a caterer to email. (Pairs with the outage error boundaries above.)

**Caterer notifications beyond email** — a new order currently only reaches the caterer by email; a missed order inside the 48h auto-cancel window is a lost sale. Add at minimum an unread-orders badge in the dashboard/sidebar; ideally SMS or WhatsApp (e.g. Twilio) for new orders, since caterers live in kitchens, not inboxes.

**Bigger product bets:**
- **Custom domains for caterers** (`theirbusiness.co.uk` → their Caterfy page) — the classic site-builder upsell; makes a £10/mo page feel like "my website". Netlify/Vercel domain APIs make it feasible; could justify a higher tier.
- **Directory search** — the directory has location/cuisine filters but no free-text search and no "near me" ordering (lat/long already in `locations`).
- **Template 6 "Feast"** — concept HTML already exists (`public/design-concepts/concept-b-feast.html`); the Maison curated-palette pattern is proven, so it's cheap differentiation.
- **Review collection flywheel** — only post-order customers are asked for reviews; let caterers invite past (pre-Caterfy) customers to seed their page (reviews drive directory ranking + social proof).

**Engineering robustness:**
- **Automated tests** — ~290 manual QA checks, zero automated tests. Add Playwright smoke tests for the 5 money paths (signup, publish, place fixed order, card payment, quote flow) to catch regressions without a human re-run.
- **Rate limiting / abuse protection** — `/api/messages`, `/api/orders`, `/api/reviews` are open, uncaptcha'd endpoints; a spam script could flood every caterer's inbox through Resend and burn sending reputation. Add per-IP limiting or Turnstile (at least on the message form).
- **ISR / short-cache on `/[slug]` + directory** — every visit hits Supabase; short `revalidate` windows cut load, speed pages, and keep them serving during a DB blip (overlaps outage item above).
- **Image optimization on upload** — 5MB heroes are served through Next Image on every visit; resize to sane max dimensions at upload time.

## Deployment & Infrastructure Notes

### Hosting
- Netlify at `caterfy.netlify.app`
- Repo root is the Next.js project (no subdirectory) — do NOT set a base directory in Netlify UI or netlify.toml
- Build command: `npm run build`, publish directory: `.next`

### Supabase Auth
- Redirect URL must be set to `https://caterfy.netlify.app/api/auth/callback` in Supabase → Authentication → URL Configuration
- Site URL must be `https://caterfy.netlify.app`
- `emailRedirectTo` in signup form points to `/api/auth/callback?next=/dashboard?welcome=true`
- Dashboard layout has a fallback that auto-creates the caterer record if the callback was missed
- Custom SMTP: attempted via Resend but `onboarding@resend.dev` does not work over SMTP — requires a verified domain. Until domain is verified, leave Supabase on its default email service (Project Settings → Auth → SMTP disabled)
- To use custom SMTP in future: verify domain in Resend, then set sender to `hello@yourdomain.com` in Supabase Project Settings → Auth → SMTP Settings

### Resend Emails
- `FROM_EMAIL` and `ORDERS_EMAIL` default to `onboarding@resend.dev` when `RESEND_FROM_DOMAIN` env var is not set
- Emails go through Resend API (not SMTP) — this works without domain verification
- Resend sandbox restriction: with `onboarding@resend.dev`, emails only deliver to the Resend account owner email
- To send to any recipient: verify domain in Resend, then set `RESEND_FROM_DOMAIN=yourdomain.com` in Netlify env vars

### Images
- Supabase Storage bucket: `caterer-images` (must be public)
- `next.config.ts` whitelists `*.supabase.co` for Next.js Image component
- Paths: `hero/{catererId}.ext`, `logos/{catererId}.ext`, `gallery/{catererId}/{timestamp}.ext`

### Stripe
- All in test mode — use test card `4242 4242 4242 4242`
- Stripe Connect must be activated at `dashboard.stripe.com/connect` before the Connect Stripe button works
- Webhook endpoint: `https://caterfy.netlify.app/api/webhooks/stripe`
- Required webhook events: `customer.subscription.created`, `customer.subscription.updated`, `invoice.payment_succeeded`, `invoice.payment_failed`, `account.updated`, `checkout.session.completed`

### Database Migrations
Migrations live in `supabase/migrations/` and must be run manually in Supabase SQL editor:
- `001_*` — initial schema
- `002_*` — early additions
- `003_discount_codes.sql` — discount_codes table; adds discount_code + discount_amount to orders
- `004_link_page.sql` — adds template_data JSONB column to caterer_pages
- `005_template_constraint.sql` — updates caterer_pages_template_check to include 'linkpage'
- `006_business_mode_stock_limit.sql` — adds business_mode to caterers; adds stock_limit to menu_items
- `007_bank_transfer.sql` — adds bank_transfer_details TEXT and show_bank_details_on_invoice BOOLEAN to caterers
- `008_bank_transfer_payment_method.sql` — updates orders_payment_method_check to allow 'bank_transfer'; adds public SELECT policy on blocked_dates (so the order form can read them)
- `009_price_unit_per_meal.sql` — updates menu_items_price_unit_check to allow 'per meal'
- `010_package_is_popular.sql` — adds is_popular BOOLEAN to packages (caterer-chosen 'Popular' badge)
- `011_catering_guest_range.sql` — adds min_catering_guests / max_catering_guests to caterers (quote guest range)
- `012_growth_and_lifecycle.sql` — adds signup_source + link_shared_at to caterers, review_request_sent_at to orders; creates page_views table + `increment_page_view()` SECURITY DEFINER RPC (granted to anon/authenticated) and lifecycle_emails table (service-role only, unique caterer_id+email_key). **Must be run before the share checklist tick, page-view stats, attribution and the daily cron work fully** — until then the code degrades gracefully (page-view RPC errors ignored; signup_source written via separate best-effort update)
- `013_maison_template.sql` — widens caterer_pages_template_check to include 'maison' (template 5). **Must be run before a caterer can save the Maison template**

### Deleting a test account (SQL order)
Delete order-referencing children (`quotes`, `reviews`, `invoices`) BEFORE `orders`, and the `caterers` row LAST. The caterer id == the auth user id.
```sql
DELETE FROM quotes                  WHERE caterer_id = '[user-id]';
DELETE FROM reviews                 WHERE caterer_id = '[user-id]';
DELETE FROM invoices                WHERE caterer_id = '[user-id]';
DELETE FROM orders                  WHERE caterer_id = '[user-id]';
DELETE FROM menu_items              WHERE caterer_id = '[user-id]';
DELETE FROM packages                WHERE caterer_id = '[user-id]';
DELETE FROM gallery_images          WHERE caterer_id = '[user-id]';
DELETE FROM blocked_dates           WHERE caterer_id = '[user-id]';
DELETE FROM discount_codes          WHERE caterer_id = '[user-id]';
DELETE FROM caterer_cuisines        WHERE caterer_id = '[user-id]';
DELETE FROM caterer_event_types     WHERE caterer_id = '[user-id]';
DELETE FROM caterer_dietary_options WHERE caterer_id = '[user-id]';
DELETE FROM caterer_pages           WHERE caterer_id = '[user-id]';
DELETE FROM caterers                WHERE id         = '[user-id]';
-- Then delete from Supabase Authentication → Users
```
**Storage is NOT cleaned by the SQL above** — direct deletes from `storage.objects` are blocked by Supabase's `protect_delete` trigger. Remove the account's files (`hero/{user-id}.*`, `logos/{user-id}.*`, `gallery/{user-id}/*`) in **Storage → caterer-images** in the dashboard (multi-select → delete), or via the Storage API with the service role. (In-app image deletes are handled automatically — see the "Storage cleanup on image delete" completed note.)

## Coding Standards

### File Naming
- Components: PascalCase (e.g., `CatererCard.tsx`)
- Utilities: camelCase (e.g., `formatPrice.ts`)
- Pages: lowercase with hyphens (Next.js convention)

### TypeScript
- Use strict mode
- Define types in `/types` directory
- Use interfaces for objects, types for unions

### Components
- Functional components only
- Use hooks for state management
- Server components by default, client components when needed

### API Routes
- Use Next.js App Router conventions
- Validate inputs with Zod
- Return consistent response shapes

### Database
- Use Supabase client from `/lib/supabase`
- Use Row Level Security (RLS) policies
- Use Edge Functions for complex operations

### Performance
- Always use `getUser()` from `lib/supabase/server` (React-cached) — never call `supabase.auth.getUser()` directly in dashboard pages
- Fetch independent DB queries with `Promise.all`, never sequential `await` chains

## Important Notes

1. **Test Mode**: All Stripe and Resend integrations should use test credentials until launch.

2. **Image Handling**: Accept JPG, JPEG, PNG, WebP, HEIC, HEIF. Auto-convert HEIC/HEIF to JPG. Max 5MB per image, auto-compress.

3. **URL Slugs**: Lowercase, letters/numbers/hyphens only, 3-40 chars, must start with letter. Check reserved slugs list.

4. **Guest Checkout**: Customers don't need accounts. Optional account creation after order.

5. **Caterer Auth Only**: Only caterers authenticate via Supabase Auth. Customers use email links for order tracking and reviews.

6. **No Platform Fee**: Revenue from subscriptions only. No transaction fees.

7. **Offline Payments**: Support "pay later" option where caterer collects payment directly.

8. **Distance Calculation**: City centre to city centre using coordinates from locations table.

9. **Trial Period**: 14 days, fully functional. Stripe Connect required before going live.

10. **Payment Failure**: Retry after 3 days, final warning, offline on day 4. Data preserved.

## Testing Checklist

`public/testing-checklist.html` is a self-contained, interactive QA checklist covering every feature area (auth, onboarding, site builder, all 4 templates, menu/stock, orders, quotes, payments/Stripe, subscriptions, invoices, discounts, reviews, availability, messages, settings/business modes, directory, admin, emails, responsive, performance/RLS, edge cases/security, the July 2026 growth round — landing page/marketing site (§23), SEO/metadata/link sharing (§24), consent/analytics/growth tracking (§25) — and known-pending items (§26) — ~290 checks across 27 sections). July 2026 additions are appended to the END of existing sections (progress is keyed by section id + item index, so never insert items mid-section) and tagged "✅ NEW:"; §19 includes the full lifecycle-email/cron test recipes (simulate by adjusting created_at/event_date/trial_ends_at in SQL, then trigger /api/cron/daily with the CRON_SECRET header).

- **Deployed with the site**: lives in `public/`, so it ships with every Netlify deploy and is reachable on the live site at `/testing-checklist.html` (e.g. `https://caterfy.netlify.app/testing-checklist.html`). Both testers open the same URL; no build step or server needed locally either (open the file directly).
- **Per-tester local storage**: each tester picks/adds their name in the header dropdown. Progress is namespaced per tester under `localStorage` key `caterfy_qa_checklist_v1::<tester>`, with the tester list in `caterfy_qa_testers` and the active tester in `caterfy_qa_active_tester`. Two people testing on separate devices each keep their own independent state automatically; if they share a browser, switching the dropdown swaps between their separate checklists. A `Rename` button renames a profile (moving its state). An old single-profile key (`caterfy_qa_checklist_v1`) is auto-migrated into a `Default` tester on first load.
- **Each item** has numbered steps plus a `✓ Expect` line describing the correct result. Tag chips mark `critical` / `payment` / `email` items.
- **Filter/search**: chips for All / Open / Done / Critical / Payments, plus live text search.
- **Export buttons** produce timestamped Markdown (filenames include the tester name):
  - *Export issues* → `caterfy-test-issues_<tester>_<date>.md`: only items with a tester note, plus any un-passed critical/payment checks. This is the fix-ready handoff format.
  - *Export full report* → `caterfy-test-report_<tester>_<date>.md`: the complete checklist with `[x]/[ ]` state and notes.
- **Reset** clears only the active tester's progress, not everyone's.
- **Workflow for fixing flagged issues**: the tester saves an exported `.md` into the repo root, then Claude reads it and works through each flagged item. (Notes live only in the tester's browser `localStorage` and are not visible to Claude until exported to a file.)

## Marketing Landing Page

The homepage (`app/(marketing)/page.tsx`) is a caterer-first marketing page (redesigned July 2026). It is fully static (no Supabase query — customers reach the directory via nav/footer links to `/directory`).

**Design system** (scoped under `.mk-root` in `app/(marketing)/marketing.css`, applied by the marketing layout so it also reskins nav/footer on `/faq`, `/terms`, etc.):
- Tokens: `--basil #182A20` (dark green), `--cream #F7F2E7` (page bg), `--cream-2 #EFE7D6`, `--marigold #E8A33D` (primary accent), `--marigold-deep #C9852A`, `--tomato #D25B43` (used very sparingly), `--ink #22261F`, `--ink-soft #5B6156`
- Fonts via `next/font/google` are loaded **globally in `app/layout.tsx`** (root) and exposed as CSS variables (`--font-young-serif`, `--font-figtree`, `--font-plex-mono`): Young Serif (display), Figtree (body), IBM Plex Mono (eyebrows/micro-copy). Figtree is the app-wide `body` font; `.mk-root` and `.app-theme` consume these variables. (Previously marketing-only; now shared with the whole app — see "App Theme (brand skin)" below.)
- Pill buttons (`.mk-btn` + gold/basil/ghost variants), 14px-radius cards, mono uppercase eyebrows with 22px rule, alternating cream/basil sections, lucide icons at strokeWidth 1.7

**Page sections**: sticky blur nav → hero (two-col, live editor demo right) → basil trust-strip marquee (category words) → features grid (4 job-cluster cards, each led by a product-snapshot visual — see below) → "How it works" 01/02/03 on basil → pricing (single real £10/mo plan, count-up stats) → FAQ accordion → founder note → basil final-CTA panel with animated SVG steam lines → single-row footer.

**Example site `/demo`** (July 2026): a fully designed fictional caterer site ("The Willow Pantry", Bristol — same business as the hero demo) rendered through the **real Modern template** with static mock data in `app/demo/page.tsx` (no Supabase): Playfair Display/Nunito, terracotta accent preset, certifications, 10 menu items, 3 packages, gallery, reviews, working order/message forms (caterer id doesn't exist, so submissions can't create anything). Photos hot-linked from Unsplash (`images.unsplash.com` added to `next.config.ts` remotePatterns); `demo` added to RESERVED_SLUGS; page is noindex. A fixed bottom bar CTAs to /signup. Linked from the hero's ghost button "See an example site" (replaced "See how it works" — that anchor is still in the nav).

**Feature snapshot visuals** (`components/marketing/feature-snapshots.tsx`, July 2026, Tentary-inspired): each of the 4 feature cards opens with a CSS-built "screenshot" of real product UI floating on a soft pastel stage (`.mk-stage` + `.mk-blob` decorative circles; snapshot primitives `.mk-snap`, `.mk-snap-row`, `.mk-check`, `.mk-chip-green/amber`, `.mk-skelrow` skeleton rows in marketing.css). All stages are aria-hidden and use real product terminology: **SiteSnapshot** (mini caterer page with URL bar, menu prices, rating), **OrdersSnapshot** (new-order card with Accept/Decline + overlapping PAID invoice card), **PaymentsSnapshot** (checkout payment-option rows — Visa/Mastercard, Apple/Google Pay, bank transfer, pay on the day — with marigold check circles, cropped skeleton row at top), **GrowthSnapshot** (lifecycle-automation card: "Review request sent" amber chip + 5-star mini card). The invoice mini-card hides below 400px viewports.

**Hero editor demo** (`components/marketing/hero-demo.tsx`, client): fake browser window with a mini caterer site ("The Willow Pantry"). Swatches switch between the 4 real templates (Classic/Modern/Bold/Link Page, accents from the editor's real preset palette) via CSS custom properties with 0.45s transitions; the business-name input live-updates the mini-site name and the URL-bar slug (uses `slugify` from `lib/utils`).

**Motion**: staggered hero entrance (`.mk-enter-*`), IntersectionObserver scroll reveals (`components/marketing/reveal.tsx`, unobserves after firing), count-up stats (`components/marketing/count-up.tsx`), CSS marquee (pauses on hover), steam-line dash animation — all gated behind `prefers-reduced-motion` (reduced-motion users get static content).

## App Theme (brand skin)

The homepage's warm brand look (fonts + colours) is applied across the rest of the app — dashboard, auth, admin, directory, and customer utility pages (`/order-status`, `/review`) — **while keeping each page's existing layout/format** (only fonts + colours change). Caterer public pages (`/[slug]`) are deliberately **excluded** so they keep each caterer's own branding.

**How it works:**
- **Global fonts + tokens**: the three brand fonts load once in `app/layout.tsx` (root) as CSS variables; the brand colour tokens (`--basil`, `--cream`, `--surface #FDFAF2`, `--marigold`, `--ink`, `--ink-soft`, `--border-light`, etc.) live in `:root` in `app/globals.css`, so they're usable app-wide. `body` font is Figtree.
- **`.app-theme` opt-in class** (defined in `app/globals.css`): wrap a route's root element in it to get the warm cream page background, ink text colour, and **Young Serif headings** (`h1/h2/h3` + `.font-display`). Applied on: `app/(dashboard)/layout.tsx`, `app/(auth)/layout.tsx`, the directory pages, `app/(admin)/mistuzzo/*`, and via thin `layout.tsx` wrappers for `app/order-status` and `app/review` (which have multiple render branches).
- **Themed shared primitives** (`components/ui/*`): `Button` (default = basil/cream, warm outline/secondary/ghost), `Card` (surface bg + border-light + ink title), `Input`/`Textarea`/`Select` (border-light + basil focus ring), `Tabs` (cream-2 list, surface active). These reference the global tokens, so they carry the theme everywhere. The caterer public order form (`components/caterer/order-form.tsx`) uses these too but its primary buttons pass explicit `accentColor` inline styles, so only neutral input borders/focus shift warm there.
- **Dashboard chrome**: `components/dashboard/sidebar.tsx` + `topbar.tsx` use a surface bg, `--basil` active nav state (was black), and a Young Serif "Caterfy" wordmark.
- **Rule of thumb for new app pages**: add `app-theme` to the page/layout root and prefer the shared `ui/*` primitives + token vars (`var(--ink)`, `var(--ink-soft)`, `var(--surface)`, `var(--border-light)`) over hardcoded `gray-*`. Never wrap `/[slug]` caterer pages in `.app-theme`.

## Templates

All templates share:
- Certification badges in the hero (from `template_data.certifications`; Maison renders them as text labels in its meta row instead of pills)
- Expandable menu item descriptions (hidden by default, expand on click/tap) — except Maison, which always shows descriptions in its editorial menu list
- Send message form in the contact/order section (→ `/api/messages`)
- Order button respects `business_mode` (hides items or quote based on setting)

### Classic
- Full-width hero image
- Left-aligned about section
- Menu in clean list format with expandable descriptions
- Gallery as uniform grid
- Contact info + send message form

### Modern
- Hero with text overlay on darkened image
- Centred about section
- Menu in card grid with expandable descriptions
- Masonry gallery layout
- Contact info + send message form (centred, max-w-lg)

### Bold
- Large coloured background hero
- Split about layout (image left, text right)
- Card-format menu items (descriptions always visible in card)
- Horizontal carousel gallery
- Full-width order/contact section with send message form

### Link Page
- Dark mobile-first layout (max 460px centred), inspired by link-in-bio pages
- Hero banner with avatar/logo, business name, tagline in accent colour
- Certification badges below profile chips
- Profile bio + chip tags and credential badges (from `template_data`)
- Quick action links: primary CTA button, phone, email, Instagram
- Horizontal scrollable gallery strip
- Packages as tray cards (1–3 grid; middle card marked "Popular" when 3 packages)
- Extras add-on list (from `template_data.extras` in "Name | Price" format, one per line)
- Menu items grouped by category in collapsible accordions; tap item to expand description
- Reviews with serif italic quotes and star ratings in accent colour
- FAQ accordions (from `template_data.faqs`)
- Send message form section above the order section
- Sticky bottom bar with "Order Now" + "Call" buttons
- All accent colours are fully dynamic from `caterer_pages.accent_color`
- Link Page-specific fields in the site editor Content tab: chips, badges, instagram, CTA label, extras, FAQs

### Maison (template 5, July 2026 — "impossible to make a bad site")
- Editorial, high-end look (`components/caterer/template-maison.tsx`): Fraunces serif + Inter (locked type pairing, loaded by the template itself — `/[slug]` skips the caterer-font injection for maison), generous whitespace, hairline rules, dotted menu price leaders, numbered package triptych (max 3 rendered, `is_popular` → "Most requested" tag), editorial gallery grid (slots cycle wide/wide/tall/tall/tall), one large serif pull-quote review (auto-picked: 5★ with 60–200 chars, else best) + up to 4 compact reviews, dark "details band" (Serving / Occasions / Dietary — composed from location, event types and dietary options with designed fallbacks), CTA + OrderButton + SendMessageForm
- **Curated palette system instead of free colour/font pickers** (`components/caterer/maison-palette.ts`): accent (8 named deep colours) × band (5 dark panel colours) × paper (3 near-white tones) — every combination is contrast-safe by construction. Stored as `template_data.maison = { accent, band, paper }` ids (not hexes); unknown ids fall back to clay/moss/ivory. The editor's Branding tab swaps the colour pickers + font selects for three swatch-chip rows plus a live palette preview when maison is selected; `primary/secondary/accent/background_color` and `heading/body_font` columns are ignored by this template
- Designed fallbacks everywhere: headline falls back to "Seasonal feasts, laid by hand." (tagline's last two words get the italic accent treatment automatically); hero sub-line, band copy and captions are composed from real data (event types, cuisines, location); sections hide when empty
- Requires migration `013_maison_template.sql` (template check constraint)

## Design Concepts (`public/design-concepts/`)

Standalone self-contained HTML mock-ups (Google Fonts + hot-linked Unsplash) used to design "impossible to make ugly" templates before implementing them. They live in `public/` so they ship with every deploy and are viewable on the live site at `/design-concepts/<file>.html` (e.g. `https://caterfy.netlify.app/design-concepts/concept-a-maison.html`):
- `concept-a-maison.html` — the editorial concept that became the Maison template (above)
- `concept-b-feast.html` — **"Feast", not yet implemented**: bold street-food/BBQ direction (Archivo Black stacked headlines, rotated polaroids with hard offset shadows, sticker badges, animated marquee, thick-border menu cards with price tags, tilted "Most booked" package, speech-bubble reviews). Same palette philosophy as Maison (curated colour pairs, locked type) if/when built as template 6

## Email Templates Required

### To Caterers
- Email verification
- Welcome email
- New order notification
- New quote request
- Order reminder (24hr)
- Order auto-cancelled (48hr)
- Payment failed
- Final warning
- Subscription cancelled
- New review received

### To Customers
- Order confirmation
- Order accepted
- Order declined
- Quote received
- Review request (1 day after event)
