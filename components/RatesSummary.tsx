import { TaxResult } from '@/lib/tax-engine'
import { getStateMarginalRate, NO_INCOME_TAX_STATES } from '@/lib/state-tax-data'

interface RatesSummaryProps {
  baseline: TaxResult
  state: string
}

export default function RatesSummary({ baseline, state }: RatesSummaryProps) {
  // Derive SE tax label
  let seLabel: string
  if (baseline.seEarnings === 0) {
    seLabel = 'N/A'
  } else if (baseline.remainingSSRoom <= 0) {
    seLabel = '2.9% Medicare only — SS capped by W-2'
  } else {
    seLabel = '15.3%'
  }

  // Derive state marginal rate
  const stateTaxableIncome = Math.max(0, baseline.agi - baseline.standardDeduction)
  const stateMarginalRate = getStateMarginalRate(state, stateTaxableIncome)
  const isNoTaxState = NO_INCOME_TAX_STATES.includes(state)
  const stateLabel =
    isNoTaxState || stateMarginalRate === 0
      ? '0% (no state income tax)'
      : `${(stateMarginalRate * 100).toFixed(1).replace(/\.0$/, '')}%`

  return (
    <div className="rates-summary">
      <h2 className="section-label">Your Rates</h2>
      <div className="rates-note">Your W-2 income sets these rates &mdash; LLC write-offs save at the top bracket</div>

      <div className="rates-row">
        <span>Federal marginal bracket</span>
        <span className="rate-val">{(baseline.marginalFederalRate * 100).toFixed(0)}%</span>
      </div>

      <div className="rates-row">
        <span>SE tax rate</span>
        <span className="rate-val">{seLabel}</span>
      </div>

      <div className="rates-row">
        <span>State income tax</span>
        <span className="rate-val">{stateLabel}</span>
      </div>

      <div className="rates-row">
        <span>QBI deduction</span>
        <span className="rate-val">20%</span>
      </div>
    </div>
  )
}
