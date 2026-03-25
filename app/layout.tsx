import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://writeoff-calc.vercel.app'),
  title: {
    default: 'Tax Calculators for W-2 + LLC Owners',
    template: '%s | Tax Calculators',
  },
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Tax Calculators for W-2 + LLC Owners',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${inter.variable}`}>{children}</body>
    </html>
  )
}
