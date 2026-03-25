import type { Metadata } from 'next'
import ProfilePageLoader from '@/components/ProfilePageLoader'

export const metadata: Metadata = {
  title: 'Your Tax Profile — Used Across All Calculators',
  description:
    'Set your W-2 income, LLC income, filing status, and state. Your profile is shared across all tax calculators and saved locally in your browser.',
}

export default function ProfileRoute() {
  return (
    <main className="page">
      <ProfilePageLoader />
    </main>
  )
}
