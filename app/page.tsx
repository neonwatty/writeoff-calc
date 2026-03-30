import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { posts } from '@/lib/blog'
import { SITE_URL } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Free Tax Write-Off & Deduction Calculators for W-2 + LLC Owners — 2025–2026',
  description:
    'Free tax write-off calculators for W-2 employees with a side business or LLC. See the real cost of business expenses, home office deductions, and quarterly estimated taxes after write-offs.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'That $2,000 laptop? It actually costs $1,320.',
    description:
      'Tax write-off calculators for W-2 employees with a side business or LLC. See the real price of every business expense after deductions.',
  },
}

const calculators = [
  {
    href: '/calculators/write-off',
    icon: '$',
    title: 'Write-Off Calculator',
    description: 'Enter any business purchase and see the real cost after your tax deduction.',
  },
  {
    href: '/calculators/home-office',
    icon: '⌂',
    title: 'Home Office Costs',
    description: 'Compare simplified vs. actual method. See the real cost of rent, internet, utilities.',
  },
  {
    href: '/calculators/quarterly-estimates',
    icon: '☷',
    title: 'Quarterly Estimates',
    description: 'Calculate how much to set aside each quarter. Includes safe harbor check.',
  },
]

const audience = [
  { bold: 'W-2 employees', rest: 'with a side business' },
  { bold: 'LLC owners', rest: 'figuring out deductions' },
  { bold: 'Freelancers', rest: 'estimating quarterly taxes' },
  { bold: 'Remote workers', rest: 'maximizing home office write-offs' },
]

export default function HomePage() {
  // JSON-LD built from static content defined in this file, not user input
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Write-Off Calculator',
    url: SITE_URL,
    description: 'Free tax write-off calculators for W-2 employees with a side business or LLC.',
  })

  return (
    <main className="landing">
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }]} />

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-badge">Free &middot; No Signup &middot; 2025&ndash;2026</div>
        <h1>
          That $2,000 laptop?
          <br />
          It actually costs <span className="landing-green">$1,320</span>.
        </h1>
        <p className="landing-hero-sub">
          Tax write-off calculators for W-2 employees with a side business or LLC. See the real price of every business
          expense after deductions.
        </p>

        {/* Mini receipt */}
        <div className="landing-receipt">
          <div className="landing-receipt-header">Write-Off Calculator</div>
          <div className="landing-receipt-row">
            <span>MacBook Pro</span>
            <span>$2,000</span>
          </div>
          <div className="landing-receipt-row">
            <span>Standing desk</span>
            <span>$600</span>
          </div>
          <div className="landing-receipt-row">
            <span>Software license</span>
            <span>$400</span>
          </div>
          <hr className="landing-receipt-divider" />
          <div className="landing-receipt-discount">
            <span>Tax write-off</span>
            <span className="landing-receipt-badge">34% off</span>
          </div>
          <hr className="landing-receipt-divider" />
          <div className="landing-receipt-total">
            <span>You actually pay</span>
            <span>
              $1,980 <span className="landing-receipt-original">$3,000</span>
            </span>
          </div>
          <div className="landing-receipt-note">Based on 22% federal + 5% state + 7.65% SE tax</div>
        </div>

        <div className="landing-cta-row">
          <Link href="/calculators/write-off" className="landing-cta-primary">
            Try the Calculator &rarr;
          </Link>
          <Link href="/blog" className="landing-cta-secondary">
            Read Tax Guides
          </Link>
        </div>
      </section>

      {/* Calculators */}
      <section className="landing-section">
        <h2 className="landing-section-title">Free Tax Calculators</h2>
        <div className="landing-calc-grid">
          {calculators.map((calc) => (
            <Link key={calc.href} href={calc.href} className="landing-calc-card">
              <div className="landing-calc-icon">{calc.icon}</div>
              <h3>{calc.title}</h3>
              <p>{calc.description}</p>
              <div className="landing-calc-arrow">Open &rarr;</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="landing-audience">
        <div className="landing-audience-inner">
          <div className="landing-audience-label">Built for</div>
          <div className="landing-audience-list">
            {audience.map((item) => (
              <div key={item.bold} className="landing-audience-item">
                <span className="landing-check">&#10003;</span> <strong>{item.bold}</strong> {item.rest}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="landing-section">
        <h2 className="landing-section-title">Tax Guides</h2>
        <div className="landing-blog-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="landing-blog-card">
              <time dateTime={post.date}>
                {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust + Footer */}
      <section className="landing-trust">
        <div className="landing-trust-items">
          <div className="landing-trust-item">
            <strong>100% free</strong> &mdash; no signup required
          </div>
          <div className="landing-trust-item">
            <strong>Private</strong> &mdash; data stays in your browser
          </div>
          <div className="landing-trust-item">
            <strong>No tracking</strong> &mdash; nothing sent to any server
          </div>
        </div>
        <div className="landing-footer">
          FOR ESTIMATION PURPOSES ONLY &middot; NOT TAX ADVICE &middot; CONSULT YOUR CPA
          <br />
          &copy; 2026 WRITEOFFCALCULATOR.COM
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  )
}
