import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Caterfy — Find & Book Catering Services',
  description: 'Discover professional caterers for weddings, corporate events, and more. Build your catering website for just £10/month.',
  keywords: 'catering, caterers, food, events, wedding catering, corporate catering',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
