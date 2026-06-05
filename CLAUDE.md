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
  template TEXT DEFAULT 'classic', -- 'classic', 'modern', 'bold', 'linkpage'
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
  template_data JSONB DEFAULT '{}', -- shared: certifications[]; linkpage: chips, badge1, badge2, instagram, cta_label, extras, faqs
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

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
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

All phases are implemented and the app builds successfully (Next.js 16, 37 routes).

### Completed
- Landing page with directory search
- Caterer signup/login with email verification (Supabase Auth)
- 14-day trial on signup, caterer record auto-created on email verify
- Site builder: 4 templates (Classic, Modern, Bold, Link Page), branding, content, image uploads, URL slug
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
- Resend email notifications (orders, quotes, reviews, auth, invoices)
- Admin dashboard at `/mistuzzo`
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
- Homepage payment methods section showing: Visa, Mastercard, Amex, Apple Pay, Google Pay, Bank Transfer, Pay Later
- Bank transfer payment option: caterer enters account details in Settings → Payments; shown to customers at checkout on fixed orders; bank details shown on order confirmation and optionally auto-included on invoice emails (toggle in Settings → Payments)
- Site editor Save Changes button only active when unsaved changes exist; resets after successful save
- Dashboard performance: `getUser()` in `lib/supabase/server.ts` is wrapped with React `cache()` so `auth.getUser()` fires once per request even though layout and page both call it; all dashboard pages use this cached helper instead of calling `supabase.auth.getUser()` directly

### Pending / Not Yet Built
- Order reminder cron (email caterer after 24hr, auto-cancel at 48hr)
- Review request email trigger (1 day after event date)
- Google Analytics wired up (env var exists, tag not added to layout yet)
- Google Fonts loading (fonts selected in site editor but not loaded via next/font)
- **Card payment status update (no-webhook approach)**: Currently `checkout.session.completed` webhook marks orders as paid, but this requires Stripe webhook setup. Replace with session-verification on the success redirect:
  1. Change `success_url` in `app/api/orders/route.ts` to include `{CHECKOUT_SESSION_ID}`: `/order-status?ref={ref}&session_id={CHECKOUT_SESSION_ID}`
  2. In the `/order-status` page, if `session_id` query param is present, call a new API route `/api/orders/verify-payment` that retrieves the session from Stripe (`stripe.checkout.sessions.retrieve(session_id)`), checks `payment_status === 'paid'`, and updates the order's `payment_status` to `'paid'` + stores `stripe_payment_intent_id`
  3. Remove the `checkout.session.completed` case from `app/api/webhooks/stripe/route.ts` (subscription webhook events are still needed)
  - This removes the webhook dependency for order payments entirely — status updates happen when the customer lands on the success page

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

### Deleting a test account (SQL order)
```sql
DELETE FROM orders WHERE caterer_id = '[user-id]';
DELETE FROM caterer_cuisines WHERE caterer_id = '[user-id]';
DELETE FROM caterer_event_types WHERE caterer_id = '[user-id]';
DELETE FROM caterer_dietary_options WHERE caterer_id = '[user-id]';
DELETE FROM caterer_pages WHERE caterer_id = '[user-id]';
DELETE FROM gallery_images WHERE caterer_id = '[user-id]';
DELETE FROM menu_items WHERE caterer_id = '[user-id]';
DELETE FROM blocked_dates WHERE caterer_id = '[user-id]';
DELETE FROM invoices WHERE caterer_id = '[user-id]';
DELETE FROM discount_codes WHERE caterer_id = '[user-id]';
DELETE FROM caterers WHERE id = '[user-id]';
-- Then delete from Supabase Authentication → Users
```

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

## Templates

All four templates share:
- Certification badges in the hero (from `template_data.certifications`)
- Expandable menu item descriptions (hidden by default, expand on click/tap)
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
