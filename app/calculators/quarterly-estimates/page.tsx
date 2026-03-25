import type { Metadata } from 'next'
import QuarterlyLoader from '@/components/QuarterlyLoader'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Quarterly Estimated Tax Calculator 2025–2026 — W-2 + Self-Employment',
  description:
    'Calculate how much to set aside each quarter when you have W-2 income and an LLC. Includes safe harbor rules and W-4 withholding strategy.',
  alternates: { canonical: '/calculators/quarterly-estimates' },
  openGraph: {
    title: 'How Much Should You Set Aside Each Quarter?',
    description: 'Calculate quarterly estimated taxes when you have a W-2 job and an LLC. Includes safe harbor rules.',
  },
}

export default function QuarterlyEstimatesPage() {
  return (
    <main className="page">
      <QuarterlyLoader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Quarterly Estimated Tax Calculator',
            description: 'Calculate how much to set aside each quarter when you have W-2 income and an LLC.',
            url: `${SITE_URL}/calculators/quarterly-estimates`,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'All',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            browserRequirements: 'Requires JavaScript',
          }),
        }}
      />
    </main>
  )
}
