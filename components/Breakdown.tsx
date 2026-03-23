'use client'

import { useState } from 'react'
import { TaxProfile, SavingsBreakdown } from '@/lib/tax-engine'
import { formatCurrency } from '@/lib/format'
import { getTaxData } from '@/lib/tax-data'
import { getStateTaxInfo, NO_INCOME_TAX_STATES } from '@/lib/state-tax-data'

interface BreakdownProps {
  breakdown: SavingsBreakdown
  expenseAmount: number
  profile: TaxProfile
}

export default function Breakdown({ breakdown, expenseAmount, profile }: BreakdownProps) {
  const [open, setOpen] = useState(false)

  if (expenseAmount <= 0) return null

  const { baseline, withExpense } = breakdown
  const agiReduction = baseline.agi - withExpense.agi
  const taxableIncomeReduction = baseline.taxableIncome - withExpense.taxableIncome
  const addlMedicareSavings = baseline.addlMedicareTax - withExpense.addlMedicareTax
  const coreSESavings = breakdown.seSavings - addlMedicareSavings

  const taxData = getTaxData(profile.taxYear, profile.filingStatus)
  const marginalRate = (baseline.marginalFederalRate * 100).toFixed(0)

  return (
    <>
      <button className="breakdown-toggle" onClick={() => setOpen(!open)}>
        {open ? '\u25BE' : '\u25B8'} HOW IS THIS CALCULATED?
      </button>
      <div className={`breakdown ${open ? 'open' : ''}`}>
        {/* Federal income tax savings */}
        <div className="breakdown-row">
          <span>Federal income tax savings</span>
          <span className="savings">-{formatCurrency(breakdown.federalSavings)}</span>
        </div>
        <div className="breakdown-note">
          At your {marginalRate}% marginal rate on {formatCurrency(taxableIncomeReduction)} of taxable income reduction
        </div>

        {/* Self-employment tax savings */}
        <div className="breakdown-row">
          <span>Self-employment tax savings</span>
          <span className="savings">-{formatCurrency(coreSESavings)}</span>
        </div>
        <div className="breakdown-note">
          {baseline.remainingSSRoom > 0 && baseline.seEarnings <= baseline.remainingSSRoom
            ? `Full SE tax (Social Security + Medicare) on reduced net earnings`
            : baseline.remainingSSRoom <= 0
              ? `Medicare-only (SS wage base already met by W-2 income)`
              : `Partial SS savings (${formatCurrency(baseline.remainingSSRoom)} SS room remaining) plus Medicare`}
        </div>

        {/* State tax savings */}
        <div className="breakdown-row">
          <span>{profile.state} state tax savings</span>
          <span className="savings">-{formatCurrency(breakdown.stateSavings)}</span>
        </div>
        <div className="breakdown-note">
          {(() => {
            if (NO_INCOME_TAX_STATES.includes(profile.state)) return 'No state income tax'
            const brackets = getStateTaxInfo(profile.state)
            if (!brackets) return `On ${formatCurrency(agiReduction)} AGI reduction`
            return brackets.length <= 1
              ? `Flat ${(brackets[0].rate * 100).toFixed(1).replace(/\.0$/, '')}% rate on ${formatCurrency(agiReduction)} AGI reduction`
              : `At your marginal rate on ${formatCurrency(agiReduction)} AGI reduction`
          })()}
        </div>

        {/* Additional Medicare savings */}
        {addlMedicareSavings > 0.01 && (
          <>
            <div className="breakdown-row">
              <span>Additional Medicare savings</span>
              <span className="savings">-{formatCurrency(addlMedicareSavings)}</span>
            </div>
            <div className="breakdown-note">
              0.9% on SE earnings above {formatCurrency(taxData.addlMedicareThreshold)} threshold (after W-2 offset)
            </div>
          </>
        )}

        <hr className="breakdown-divider" />

        {/* QBI deduction offset */}
        <div className="breakdown-row">
          <span>QBI deduction offset</span>
          <span className="cost">+{formatCurrency(breakdown.qbiOffset)}</span>
        </div>
        <div className="breakdown-note">This expense reduces your QBI, shrinking your 20% deduction</div>

        <hr className="breakdown-divider" />

        {/* Total */}
        <div className="breakdown-total">
          <span>Total tax savings</span>
          <span>-{formatCurrency(breakdown.totalSavings)}</span>
        </div>
      </div>
    </>
  )
}
