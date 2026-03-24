import type { Metadata } from 'next'
import HomeOfficeLoader from '@/components/HomeOfficeLoader'

export const metadata: Metadata = {
  title: 'Home Office Deduction Calculator 2025–2026 — See Your Real Monthly Costs',
  description:
    'See the real cost of your rent, internet, phone, and utilities after your home office tax deduction. Free calculator for W-2 employees with an LLC or side business.',
}

export default function HomeOfficePage() {
  return (
    <main className="page">
      <HomeOfficeLoader />
    </main>
  )
}
