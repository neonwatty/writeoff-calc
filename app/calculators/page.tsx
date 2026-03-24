import type { Metadata } from 'next'
import Link from 'next/link'

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
    comingSoon: true,
  },
  {
    href: '/calculators/quarterly-estimates',
    title: 'Quarterly Estimates',
    description: 'Calculate how much to set aside each quarter when you have W-2 income and an LLC.',
    comingSoon: true,
  },
]

export default function CalculatorsHub() {
  return (
    <main className="page">
      <div className="receipt">
        <div className="receipt-header">
          <h1>Tax Calculators</h1>
          <div className="subtitle">For W-2 + LLC Owners</div>
        </div>

        {/* Landing message */}
        <div className="profile-section">
          <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '12px' }}>
              When you buy a $2,000 laptop for your business, you pay $2,000 today. Months later, at tax time, you
              &ldquo;write it off&rdquo; and get some of that money back. But how much? 30%? 40%? It depends on your tax
              bracket, your state, your self-employment tax &mdash; and nobody does that math at checkout.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Your tax rate is a discount on every business expense. A 34% marginal rate means everything you buy for
              your business is permanently 34% off. Your rent, your internet, your phone &mdash; all discounted. You
              just don&rsquo;t see it on the receipt.
            </p>
            <p>
              These calculators show you the real price &mdash; what things <em>actually</em> cost you after the
              write-off. Not at tax time. Right now, at the moment you&rsquo;re deciding whether to buy.
            </p>
          </div>
        </div>

        {/* Tool links */}
        <div style={{ padding: '0' }}>
          {tools.map((tool) => (
            <div key={tool.href} className="profile-section">
              {tool.comingSoon ? (
                <div style={{ opacity: 0.5 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    {tool.title}
                    <span style={{ fontSize: '10px', color: '#888', marginLeft: '8px', letterSpacing: '1px' }}>
                      COMING SOON
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{tool.description}</div>
                </div>
              ) : (
                <Link href={tool.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#1a1a1a' }}>
                    {tool.title} →
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{tool.description}</div>
                </Link>
              )}
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
