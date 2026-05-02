import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Caterfy',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: May 2026</p>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What We Collect</h2>
          <p className="mb-3"><strong>From caterers:</strong> Name, email address, phone number, business name and details, location, business bank details (collected and stored by Stripe — not by Caterfy), site content and images.</p>
          <p><strong>From customers:</strong> Name, email address, phone number, order details, payment information (collected and processed by Stripe — not stored by Caterfy), and any reviews submitted.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use It</h2>
          <p>We use your data to: provide the Caterfy platform and its features; process payments and subscriptions; send transactional emails (order confirmations, notifications); and improve the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Third Parties</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Stripe</strong> — payment processing and subscriptions</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Netlify</strong> — web hosting and infrastructure</li>
            <li><strong>Google Analytics</strong> — anonymous usage analytics</li>
          </ul>
          <p className="mt-3">We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Retention</h2>
          <p>Active account data is kept for as long as your account is active. Upon cancellation, data is retained for 30 days then permanently deleted. You may request deletion at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:hello@caterfy.com" className="text-blue-600 underline">hello@caterfy.com</a> to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management, and Google Analytics cookies for anonymous usage statistics. See our <a href="/cookies" className="text-blue-600 underline">Cookie Policy</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
          <p>For privacy-related enquiries: <a href="mailto:hello@caterfy.com" className="text-blue-600 underline">hello@caterfy.com</a></p>
        </section>
      </div>
    </div>
  )
}
