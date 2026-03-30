import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import HomeOfficeLoader from '@/components/HomeOfficeLoader'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Home Office Deduction Calculator 2025–2026 — See Your Real Monthly Costs',
  description:
    'Free home office deduction calculator for W-2 employees with an LLC. Compare simplified vs. actual method and see the real cost of rent, internet, and utilities after your tax deduction.',
  alternates: { canonical: '/calculators/home-office' },
  openGraph: {
    title: 'Your $2,400/mo Rent Actually Costs $1,632/mo',
    description: 'See the real monthly cost of rent, internet, and utilities after your home office deduction.',
  },
}

export default function HomeOfficePage() {
  return (
    <main>
      <BreadcrumbSchema
        items={[
          { name: 'Calculators', href: '/calculators' },
          { name: 'Home Office Calculator', href: '/calculators/home-office' },
        ]}
      />
      <HomeOfficeLoader />
      <div className="calc-related-guide">
        <Link href="/blog/simplified-vs-actual-home-office-deduction">
          Guide: Simplified vs. Actual Home Office Deduction &rarr;
        </Link>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Home Office Deduction Calculator',
            description:
              'See the real cost of your rent, internet, phone, and utilities after your home office tax deduction.',
            url: `${SITE_URL}/calculators/home-office`,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'All',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            browserRequirements: 'Requires JavaScript',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is the simplified home office deduction?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The simplified method lets you deduct $5 per square foot of your home office, up to 300 square feet, for a maximum deduction of $1,500 per year. No need to track individual expenses.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can W-2 employees claim a home office deduction?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'W-2 employees cannot claim the home office deduction for their employer work. However, if you have a side business or LLC that you run from home, you can deduct home office expenses for that business on Schedule C.',
                },
              },
            ],
          }),
        }}
      />
    </main>
  )
}
