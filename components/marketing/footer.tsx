import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Caterfy</h3>
            <p className="text-sm">The affordable platform for catering businesses.</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">For Caterers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign up free</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Find Catering</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/directory" className="hover:text-white transition-colors">Browse all</Link></li>
              <li><Link href="/directory/london" className="hover:text-white transition-colors">London</Link></li>
              <li><Link href="/directory/manchester" className="hover:text-white transition-colors">Manchester</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-sm text-center">
          © {new Date().getFullYear()} Caterfy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
