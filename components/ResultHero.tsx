'use client'

import { SavingsBreakdown } from '@/lib/tax-engine'
import { formatCurrency, formatPercent } from '@/lib/format'

interface ResultHeroProps {
  breakdown: SavingsBreakdown
  expenseAmount: number
}

export default function ResultHero({ breakdown, expenseAmount }: ResultHeroProps) {
  if (expenseAmount <= 0) return <></>

  return (
    <div className="result-hero">
      <div className="discount-badge">{formatPercent(breakdown.discountPct)} OFF</div>
      <div className="discount-label">Your Business Discount</div>

      <div className="effective-cost-row">
        <span className="label">You Pay</span>
        <span>
          <span className="amount">{formatCurrency(breakdown.effectiveCost)}</span>
          <span className="original-price">{formatCurrency(expenseAmount)}</span>
        </span>
      </div>

      <div className="w2-equivalent">
        From your W-2 paycheck, this would cost
        <br />
        <strong>{formatCurrency(breakdown.w2PreTaxEquivalent)}</strong> in pre-tax earnings
      </div>
    </div>
  )
}
