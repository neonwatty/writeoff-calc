import Link from 'next/link'
import type { TaxProfile, TaxResult } from '@/lib/tax-engine'
import { getStateMarginalRate, NO_INCOME_TAX_STATES } from '@/lib/state-tax-data'

const STATE_ABBR: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
}

function formatCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (amount >= 1_000) {
    const k = amount / 1_000
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`
  }
  return `$${amount}`
}

interface ProfileSummaryProps {
  profile: TaxProfile
  baseline: TaxResult
}

export default function ProfileSummary({ profile, baseline }: ProfileSummaryProps) {
  const abbr = STATE_ABBR[profile.state] ?? profile.state
  const filingLabels: Record<string, string> = {
    single: 'Single',
    mfj: 'MFJ',
    mfs: 'MFS',
    hoh: 'HoH',
  }
  const filing = filingLabels[profile.filingStatus] ?? profile.filingStatus

  // Build summary line
  const parts: string[] = []
  if (profile.w2Income > 0) parts.push(`${formatCompact(profile.w2Income)} W-2`)
  if (profile.llcNetIncome > 0) parts.push(`${formatCompact(profile.llcNetIncome)} LLC`)
  parts.push(filing)
  parts.push(abbr)

  // Build rates line
  const federalPct = `${(baseline.marginalFederalRate * 100).toFixed(0)}% federal`

  let sePct: string
  if (baseline.seEarnings === 0) {
    sePct = '0% SE'
  } else if (baseline.remainingSSRoom <= 0) {
    sePct = '2.9% SE'
  } else {
    sePct = '15.3% SE'
  }

  const stateTaxableIncome = Math.max(0, baseline.agi - baseline.standardDeduction)
  const stateMarginalRate = getStateMarginalRate(profile.state, stateTaxableIncome)
  const isNoTaxState = NO_INCOME_TAX_STATES.includes(profile.state)
  const statePct =
    isNoTaxState || stateMarginalRate === 0
      ? '0% state'
      : `${(stateMarginalRate * 100).toFixed(1).replace(/\.0$/, '')}% state`

  return (
    <div className="profile-section">
      <div className="section-label">Your Profile</div>
      <div
        style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#555',
          lineHeight: '1.6',
        }}
      >
        <div>{parts.join(' \u00b7 ')}</div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          {federalPct} &middot; {sePct} &middot; {statePct}
        </div>
        <Link
          href="/calculators/profile"
          style={{ fontSize: '10px', color: '#aaa', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}
        >
          Edit in Profile tab →
        </Link>
      </div>
    </div>
  )
}
