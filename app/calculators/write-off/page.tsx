import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import CalculatorLoader from '@/components/CalculatorLoader'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Tax Write-Off Calculator 2025–2026 — See Your Real Cost After Deductions',
  description:
    'Free tax write-off calculator for W-2 employees with an LLC or side business. Enter a business expense and see what it actually costs after your tax deduction.',
  alternates: { canonical: '/calculators/write-off' },
  openGraph: {
    title: 'See What Business Expenses Actually Cost You',
    description:
      'Enter any purchase and see the real price after your tax write-off. Built for W-2 employees with a side business.',
  },
}

export default function WriteOffPage() {
  return (
    <main>
      <BreadcrumbSchema
        items={[
          { name: 'Calculators', href: '/calculators' },
          { name: 'Write-Off Calculator', href: '/calculators/write-off' },
        ]}
      />
      <CalculatorLoader />
      <div className="calc-related-guide">
        <Link href="/blog/self-employment-tax-rate-explained">
          Guide: 2026 Self-Employment Tax Rate Explained &rarr;
        </Link>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Business Write-Off Calculator',
            description: 'Enter a business purchase and see what it actually costs after tax write-offs.',
            url: `${SITE_URL}/calculators/write-off`,
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
                name: 'What is a tax write-off?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'A tax write-off (deduction) is a business expense that reduces your taxable income. If you buy a $2,000 laptop for your LLC and your combined tax rate is 34%, the laptop actually costs you $1,320 after the deduction.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can W-2 employees claim business write-offs?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'W-2 employees cannot deduct work expenses on their personal return. However, if you have a side business or LLC, expenses for that business are deductible on Schedule C, even if you also have a W-2 job.',
                },
              },
            ],
          }),
        }}
      />
    </main>
  )
}
