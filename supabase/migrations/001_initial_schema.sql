-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('UK', 'US')),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_locations_slug ON locations(slug);

-- Cuisines
CREATE TABLE cuisines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event types
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dietary options
CREATE TABLE dietary_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Caterers (business accounts)
CREATE TABLE caterers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  location_id UUID REFERENCES locations(id),
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,
  subscription_status TEXT DEFAULT 'trialling' CHECK (subscription_status IN ('trialling', 'active', 'cancelled', 'past_due')),
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  is_accepting_orders BOOLEAN DEFAULT false,
  max_orders_per_week INTEGER,
  auto_accept_orders BOOLEAN DEFAULT false,
  show_contact_publicly BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_caterers_slug ON caterers(slug);
CREATE INDEX idx_caterers_status ON caterers(subscription_status);

-- Caterer pages
CREATE TABLE caterer_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID UNIQUE REFERENCES caterers(id) ON DELETE CASCADE,
  template TEXT DEFAULT 'classic' CHECK (template IN ('classic', 'modern', 'bold')),
  tagline TEXT,
  about TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#666666',
  accent_color TEXT DEFAULT '#2E75B6',
  heading_font TEXT DEFAULT 'Inter',
  body_font TEXT DEFAULT 'Inter',
  background_color TEXT DEFAULT '#FFFFFF',
  logo_url TEXT,
  hero_image_url TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  category TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_unit TEXT DEFAULT 'per person' CHECK (price_unit IN ('per person', 'per item', 'flat')),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  min_guests INTEGER,
  max_guests INTEGER,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gallery images
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id),
  customer_id UUID REFERENCES customers(id),
  reference_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'awaiting_payment', 'paid', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('card', 'offline')),
  order_type TEXT CHECK (order_type IN ('fixed', 'quote')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  event_location TEXT,
  event_type TEXT,
  guest_count INTEGER,
  items JSONB,
  subtotal DECIMAL(10,2),
  total DECIMAL(10,2),
  special_requests TEXT,
  dietary_requirements TEXT,
  additional_comments TEXT,
  stripe_payment_intent_id TEXT,
  reminder_sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_orders_caterer ON orders(caterer_id);
CREATE INDEX idx_orders_reference ON orders(reference_number);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id),
  order_id UUID REFERENCES orders(id),
  line_items JSONB,
  total DECIMAL(10,2),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined')),
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id),
  order_id UUID REFERENCES orders(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  event_type TEXT,
  caterer_response TEXT,
  caterer_responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reviews_caterer ON reviews(caterer_id);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id),
  order_id UUID REFERENCES orders(id),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  due_date DATE,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blocked dates
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(caterer_id, date)
);

-- Junction tables
CREATE TABLE caterer_cuisines (
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  cuisine_id UUID REFERENCES cuisines(id) ON DELETE CASCADE,
  PRIMARY KEY (caterer_id, cuisine_id)
);

CREATE TABLE caterer_event_types (
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  PRIMARY KEY (caterer_id, event_type_id)
);

CREATE TABLE caterer_dietary_options (
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  dietary_option_id UUID REFERENCES dietary_options(id) ON DELETE CASCADE,
  PRIMARY KEY (caterer_id, dietary_option_id)
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE caterers ENABLE ROW LEVEL SECURITY;
ALTER TABLE caterer_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE caterer_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE caterer_event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE caterer_dietary_options ENABLE ROW LEVEL SECURITY;

-- Caterers can read/write their own data
CREATE POLICY "Caterers manage own profile" ON caterers FOR ALL USING (auth.uid() = id);
CREATE POLICY "Public can read active caterers" ON caterers FOR SELECT USING (subscription_status IN ('active', 'trialling'));

CREATE POLICY "Caterers manage own page" ON caterer_pages FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read pages" ON caterer_pages FOR SELECT USING (true);

CREATE POLICY "Caterers manage own menu" ON menu_items FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read menu items" ON menu_items FOR SELECT USING (is_available = true);

CREATE POLICY "Caterers manage own packages" ON packages FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read packages" ON packages FOR SELECT USING (is_available = true);

CREATE POLICY "Caterers manage own gallery" ON gallery_images FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read gallery" ON gallery_images FOR SELECT USING (true);

CREATE POLICY "Caterers manage own orders" ON orders FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Caterers manage own reviews" ON reviews FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public can insert reviews" ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Caterers manage own invoices" ON invoices FOR ALL USING (auth.uid() = caterer_id);

CREATE POLICY "Caterers manage blocked dates" ON blocked_dates FOR ALL USING (auth.uid() = caterer_id);

CREATE POLICY "Caterers manage own cuisines" ON caterer_cuisines FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read cuisines" ON caterer_cuisines FOR SELECT USING (true);

CREATE POLICY "Caterers manage own event types" ON caterer_event_types FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read event types" ON caterer_event_types FOR SELECT USING (true);

CREATE POLICY "Caterers manage own dietary" ON caterer_dietary_options FOR ALL USING (auth.uid() = caterer_id);
CREATE POLICY "Public can read dietary" ON caterer_dietary_options FOR SELECT USING (true);

-- Reference tables are public read
ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cuisines" ON cuisines FOR SELECT USING (true);
CREATE POLICY "Public read event_types" ON event_types FOR SELECT USING (true);
CREATE POLICY "Public read dietary_options" ON dietary_options FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER caterers_updated_at BEFORE UPDATE ON caterers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER caterer_pages_updated_at BEFORE UPDATE ON caterer_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
