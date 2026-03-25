import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Tax Calculators for W-2 + LLC Owners — 2025–2026',
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
}

const tools = [
  {
    href: '/calculators/write-off',
    title: 'Write-Off Calculator',
    description: 'Enter a business purchase and see what it actually costs you after tax savings.',
  },
  {
    href: '/calculators/home-office',
    title: 'Home Office Costs',
    description: 'See the real monthly cost of your rent, internet, and utilities after your home office deduction.',
  },
  {
    href: '/calculators/quarterly-estimates',
    title: 'Quarterly Estimates',
    description: 'Calculate how much to set aside each quarter when you have W-2 income and an LLC.',
  },
]

export default function CalculatorsHub() {
  return (
    <main className="page">
      <NavBar />
      <div className="receipt">
        <div className="receipt-header">
          <h1>Tax Calculators</h1>
          <div className="subtitle">For W-2 + LLC Owners</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', lineHeight: '1.5' }}>
            See what business expenses actually cost you after tax savings.
          </div>
        </div>

        {/* Landing message */}
        <div className="profile-section">
          <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
            When you write off a business expense, you don&rsquo;t see the savings until you file your taxes. These
            calculators show you that discount now &mdash; like seeing the sale price before you buy.
          </div>
        </div>

        {/* Tool links */}
        <div style={{ padding: '0' }}>
          {tools.map((tool) => (
            <div key={tool.href} className="profile-section">
              <Link href={tool.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#1a1a1a' }}>
                  {tool.title} →
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>{tool.description}</div>
              </Link>
            </div>
          ))}
        </div>

        <div className="receipt-footer">
          YOUR DATA STAYS IN THIS BROWSER
          <br />
          NOTHING IS SENT TO ANY SERVER
          <br />
          <br />
          FOR ESTIMATION PURPOSES ONLY
          <br />
          NOT TAX ADVICE · CONSULT YOUR CPA
          <br />* * * THANK YOU * * *
        </div>
      </div>
    </main>
  )
}
