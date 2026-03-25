import type { Metadata } from 'next'
import ProfilePageLoader from '@/components/ProfilePageLoader'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Your Tax Profile — Used Across All Calculators',
  description:
    'Set your W-2 income, LLC income, filing status, and state. Your profile is shared across all tax calculators and saved locally in your browser.',
  alternates: { canonical: '/calculators/profile' },
  openGraph: {
    title: 'Your Tax Profile — Shared Across All Calculators',
    description:
      'Set your W-2 income, LLC income, filing status, and state. Saved locally — nothing sent to any server.',
  },
}

export default function ProfileRoute() {
  return (
    <main className="page">
      <ProfilePageLoader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Tax Profile Settings',
            description:
              'Set your W-2 income, LLC income, filing status, and state. Shared across all tax calculators.',
            url: `${SITE_URL}/calculators/profile`,
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
