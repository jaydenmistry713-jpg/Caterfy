import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Caterfy',
}

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: May 2026</p>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What are cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. We use them to keep you logged in and understand how the site is used.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies we use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Cookie</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="p-3 font-mono text-xs">sb-*</td>
                  <td className="p-3">Essential</td>
                  <td className="p-3">Authentication and session management (Supabase)</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-3 font-mono text-xs">_ga, _ga_*</td>
                  <td className="p-3">Analytics</td>
                  <td className="p-3">Google Analytics — anonymous usage tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Managing cookies</h2>
          <p>Essential cookies cannot be disabled as they are required for the platform to function. You can disable analytics cookies through your browser settings or by opting out of Google Analytics.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p>Questions? Email us at <a href="mailto:hello@caterfy.com" className="text-blue-600 underline">hello@caterfy.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
