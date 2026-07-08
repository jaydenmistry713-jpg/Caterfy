export type SubscriptionStatus = 'trialling' | 'active' | 'cancelled' | 'past_due'
export type OrderStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
export type PaymentStatus = 'unpaid' | 'awaiting_payment' | 'paid' | 'refunded'
export type PaymentMethod = 'card' | 'offline' | 'bank_transfer'
export type OrderType = 'fixed' | 'quote'
export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'declined'
export type InvoiceStatus = 'unpaid' | 'paid'
export type Template = 'classic' | 'modern' | 'bold' | 'linkpage' | 'maison'

export interface Location {
  id: string
  name: string
  slug: string
  country: 'UK' | 'US'
  latitude: number
  longitude: number
  created_at: string
}

export interface Cuisine {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface EventType {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface DietaryOption {
  id: string
  name: string
  created_at: string
}

export interface Caterer {
  id: string
  email: string
  business_name: string
  slug: string
  phone?: string
  location_id?: string
  stripe_customer_id?: string
  stripe_connect_id?: string
  subscription_status?: SubscriptionStatus
  trial_ends_at?: string
  subscription_ends_at?: string
  is_accepting_orders: boolean
  max_orders_per_week?: number
  auto_accept_orders: boolean
  show_contact_publicly: boolean
  created_at: string
  updated_at: string
  location?: Location
  cuisines?: Cuisine[]
  event_types?: EventType[]
  dietary_options?: DietaryOption[]
  page?: CatererPage
  avg_rating?: number
  review_count?: number
}

export interface CatererPage {
  id: string
  caterer_id: string
  template: Template
  tagline?: string
  about?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  heading_font: string
  body_font: string
  background_color: string
  logo_url?: string
  hero_image_url?: string
  terms_conditions?: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  caterer_id: string
  category?: string
  name: string
  description?: string
  price: number
  price_unit: 'per person' | 'per item' | 'flat'
  image_url?: string
  is_available: boolean
  sort_order?: number
  created_at: string
}

export interface Package {
  id: string
  caterer_id: string
  name: string
  description?: string
  price: number
  min_guests?: number
  max_guests?: number
  is_available: boolean
  sort_order?: number
  created_at: string
}

export interface GalleryImage {
  id: string
  caterer_id: string
  image_url: string
  caption?: string
  sort_order?: number
  created_at: string
}

export interface OrderItem {
  item_id: string
  name: string
  quantity: number
  price: number
  price_unit: string
}

export interface Order {
  id: string
  caterer_id: string
  customer_id?: string
  reference_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  order_type: OrderType
  customer_name: string
  customer_email: string
  customer_phone: string
  event_date: string
  event_time?: string
  event_location?: string
  event_type?: string
  guest_count?: number
  items?: OrderItem[]
  subtotal?: number
  total?: number
  special_requests?: string
  dietary_requirements?: string
  additional_comments?: string
  stripe_payment_intent_id?: string
  reminder_sent_at?: string
  accepted_at?: string
  cancelled_at?: string
  completed_at?: string
  created_at: string
}

export interface Quote {
  id: string
  caterer_id: string
  order_id: string
  line_items: QuoteLineItem[]
  total: number
  notes?: string
  status: QuoteStatus
  sent_at?: string
  accepted_at?: string
  created_at: string
}

export interface QuoteLineItem {
  description: string
  amount: number
}

export interface Review {
  id: string
  caterer_id: string
  order_id: string
  customer_name: string
  rating: number
  review_text?: string
  event_type?: string
  caterer_response?: string
  caterer_responded_at?: string
  created_at: string
}

export interface Customer {
  id: string
  email: string
  name?: string
  phone?: string
  created_at: string
}

export interface InvoiceLineItem {
  description: string
  amount: number
}

export interface Invoice {
  id: string
  caterer_id: string
  order_id?: string
  invoice_number: string
  customer_name: string
  customer_email: string
  line_items: InvoiceLineItem[]
  total: number
  status: InvoiceStatus
  due_date?: string
  sent_at?: string
  paid_at?: string
  created_at: string
}

export interface BlockedDate {
  id: string
  caterer_id: string
  date: string
  reason?: string
  created_at: string
}

export interface DirectoryFilters {
  location?: string
  locationId?: string
  radius?: number
  cuisines?: string[]
  eventTypes?: string[]
  dietaryOptions?: string[]
  minRating?: number
  sort?: 'rating' | 'reviews' | 'nearest'
}
