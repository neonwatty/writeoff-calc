import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import QuarterlyLoader from '@/components/QuarterlyLoader'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Quarterly Estimated Tax Calculator 2025–2026 — W-2 + Self-Employment',
  description:
    'Free quarterly tax calculator for W-2 employees with an LLC. Calculate your quarterly tax payment, check safe harbor compliance, and get a W-4 withholding strategy.',
  alternates: { canonical: '/calculators/quarterly-estimates' },
  openGraph: {
    title: 'How Much Should You Set Aside Each Quarter?',
    description: 'Calculate quarterly estimated taxes when you have a W-2 job and an LLC. Includes safe harbor rules.',
  },
}

export default function QuarterlyEstimatesPage() {
  return (
    <main>
      <BreadcrumbSchema
        items={[
          { name: 'Calculators', href: '/calculators' },
          { name: 'Quarterly Estimates', href: '/calculators/quarterly-estimates' },
        ]}
      />
      <QuarterlyLoader />
      <div className="calc-related-guide">
        <Link href="/blog/how-to-estimate-quarterly-taxes-w2-side-business">
          Guide: How to Estimate Quarterly Taxes &rarr;
        </Link>
      </div>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How much should I pay in quarterly estimated taxes?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Calculate your estimated annual LLC profit, compute self-employment tax (15.3%) and income tax at your marginal rate, subtract what your W-2 employer already withholds, then divide by 4. You can also meet the IRS safe harbor by paying 100% of last year's total tax.",
                },
              },
              {
                '@type': 'Question',
                name: 'What happens if I miss a quarterly tax payment?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "The IRS charges an underpayment penalty, currently calculated at the federal short-term rate plus 3 percentage points. You can avoid penalties by meeting the safe harbor rule: pay at least 100% of last year's tax liability (110% if AGI exceeded $150,000).",
                },
              },
            ],
          }),
        }}
      />
    </main>
  )
}
