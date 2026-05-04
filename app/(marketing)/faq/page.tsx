import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQs — Caterfy',
  description: 'Frequently asked questions about Caterfy for caterers and customers.',
}

const catererFaqs = [
  {
    q: 'How much does Caterfy cost?',
    a: 'Caterfy costs £10/month (UK) or $12/month (US). You get a 14-day free trial when you sign up — no credit card required to start.',
  },
  {
    q: 'What do I get with my subscription?',
    a: 'You get a fully customisable public website, a customer-facing order form, an orders dashboard, invoice management, gallery hosting, review collection, availability management, and a listing in the Caterfy directory.',
  },
  {
    q: 'Can I accept payments through my Caterfy site?',
    a: 'Yes. Connect your Stripe account to accept card payments directly through your site. You can also allow customers to pay offline (cash, bank transfer) and mark orders as paid manually.',
  },
  {
    q: 'Do customers need to create an account to order?',
    a: 'No. Customers can place orders as guests using just their name, email, and phone number. No signup required on their end.',
  },
  {
    q: 'Can I use my own domain name?',
    a: 'Your site is live at caterfy.com/your-name. Custom domain support is on our roadmap.',
  },
  {
    q: 'How do I appear in the directory?',
    a: 'Once your profile is set up and your site is live, you\'ll automatically appear in the Caterfy directory and location/cuisine filtered searches.',
  },
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes. You can cancel from your dashboard at any time. Your site stays live until the end of your billing period, and your data is always preserved.',
  },
  {
    q: 'What happens if my payment fails?',
    a: 'We\'ll retry after 3 days and send you a warning email. If payment isn\'t received within 4 days, your site goes offline but all your data is kept safe.',
  },
  {
    q: 'Can I offer discount codes to my customers?',
    a: 'Yes. From your dashboard you can create percentage or fixed-amount discount codes with optional expiry dates, minimum order values, and usage limits.',
  },
  {
    q: 'Is there a limit on the number of menu items or orders?',
    a: 'No limits. Add as many menu items, packages, and gallery photos as you like, and receive as many orders as you can handle.',
  },
]

const customerFaqs = [
  {
    q: 'How do I find a caterer near me?',
    a: 'Browse the Caterfy directory at caterfy.com/directory and filter by location and cuisine type to find caterers in your area.',
  },
  {
    q: 'How do I place an order?',
    a: 'Visit a caterer\'s page and click "Order Now". Select your menu items, fill in your event details, and choose how you\'d like to pay. You\'ll receive a confirmation email with a reference number.',
  },
  {
    q: 'What happens after I place an order?',
    a: 'The caterer will review your order and accept or decline it. You\'ll receive an email either way. If accepted, the caterer will be in touch to confirm the details.',
  },
  {
    q: 'Can I request a custom quote?',
    a: 'Yes. If a caterer offers quote-based ordering, you can describe your requirements and they\'ll send you a tailored quote to accept or decline.',
  },
  {
    q: 'How do I track my order?',
    a: 'You\'ll receive a reference number when you place your order. Visit caterfy.com/order-status and enter your reference number to see the latest status.',
  },
  {
    q: 'Can I leave a review?',
    a: 'Yes. After your event you\'ll receive an email with a link to leave a review. Reviews help other customers find great caterers.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-gray-100 py-5">
      <p className="font-semibold text-gray-900 mb-2">{q}</p>
      <p className="text-gray-600 leading-relaxed">{a}</p>
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-500">Everything you need to know about Caterfy.</p>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">For Caterers</h2>
        <div>
          {catererFaqs.map((item, i) => (
            <FaqItem key={i} {...item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-2">For Customers</h2>
        <div>
          {customerFaqs.map((item, i) => (
            <FaqItem key={i} {...item} />
          ))}
        </div>
      </section>

      <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8">
        <p className="text-gray-700 font-medium mb-2">Still have questions?</p>
        <p className="text-gray-500 text-sm">
          Get in touch at{' '}
          <a href="mailto:hello@caterfy.com" className="text-gray-900 underline hover:no-underline">
            hello@caterfy.com
          </a>
        </p>
      </div>
    </div>
  )
}
