import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Caterfy',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: May 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p>These Terms of Service govern your use of Caterfy ("we", "our", "us"). By creating an account or using the platform, you agree to these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Account Registration</h2>
          <p>You must provide accurate information when registering. You are responsible for maintaining the security of your account credentials. You must be 18 years or older to use Caterfy as a caterer.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Subscription & Billing</h2>
          <p>Caterfy charges £10/month (UK) or $12/month (US) for access to the platform. A 14-day free trial is offered to new caterer accounts. After the trial, payment is required to keep your site live.</p>
          <p className="mt-2">If payment fails, we will retry after 3 days. If the retry also fails, your site will go offline on day 4. Your data is preserved for 30 days after cancellation.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Free Trial</h2>
          <p>The 14-day free trial gives you full access to all features. No credit card is required to start. Your trial begins when your site goes live. After 14 days, payment is required to continue.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Content Ownership</h2>
          <p>You own all content you upload to Caterfy, including photos, menu items, and business descriptions. By uploading content, you grant Caterfy a licence to display it on the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
          <p>You may not use Caterfy to: post false or misleading information; violate any laws; harass or abuse other users; circumvent security measures; or resell access to the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Platform Rights</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, modify the service with reasonable notice, or adjust pricing with 30 days' notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Liability Limitation</h2>
          <p>Caterfy acts as a platform connecting caterers and customers. We are not responsible for disputes between caterers and customers, the quality of catering services, or any losses arising from use of the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
          <p>You may cancel at any time. Access continues until the end of your billing period. After cancellation, your data is kept for 30 days before permanent deletion.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
          <p>For any questions, contact us at <a href="mailto:hello@caterfy.com" className="text-blue-600 underline">hello@caterfy.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
