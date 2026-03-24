'use client'

import type { HomeOfficeSavingsResult } from '@/lib/home-office-engine'
import { formatCurrency } from '@/lib/format'

interface HomeOfficeResultsProps {
  result: HomeOfficeSavingsResult
}

function ExpenseLineItem({
  name,
  businessUsePct,
  discountPct,
  monthlyAmount,
  effectiveMonthlyCost,
}: {
  name: string
  businessUsePct: number
  discountPct: number
  monthlyAmount: number
  effectiveMonthlyCost: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '12px',
      }}
    >
      <span style={{ color: '#555', flex: 1 }}>
        {name} <span style={{ color: '#999', fontSize: '10px' }}>({businessUsePct.toFixed(0)}%)</span>
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            background: '#15803d',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            padding: '1px 4px',
            borderRadius: '2px',
            letterSpacing: '0.5px',
          }}
        >
          {discountPct.toFixed(1)}% OFF
        </span>
        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{formatCurrency(effectiveMonthlyCost)}</span>
        <span className="original-price" style={{ fontSize: '11px' }}>
          {formatCurrency(monthlyAmount)}
        </span>
      </span>
    </div>
  )
}

function TotalSection({ result }: { result: HomeOfficeSavingsResult }) {
  const overallDiscountPct =
    result.totalMonthlyExpenses > 0 ? (result.totalMonthlySavings / result.totalMonthlyExpenses) * 100 : 0

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '16px 0',
        borderTop: '2px dashed #ccc',
        marginTop: '8px',
      }}
    >
      <div className="discount-badge" style={{ fontSize: '24px', padding: '6px 16px' }}>
        {overallDiscountPct.toFixed(1)}% OFF
      </div>
      <div className="discount-label">Monthly Home Expenses</div>

      <div className="effective-cost-row">
        <span className="label">YOU PAY</span>
        <span>
          <span className="amount">{formatCurrency(result.effectiveMonthlyTotal)}</span>
          <span className="original-price">{formatCurrency(result.totalMonthlyExpenses)}</span>
        </span>
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#15803d',
          fontWeight: 600,
          marginTop: '12px',
        }}
      >
        You save {formatCurrency(result.totalMonthlySavings)}/month &middot; {formatCurrency(result.annualSavings)}/year
      </div>
    </div>
  )
}

export default function HomeOfficeResults({ result }: HomeOfficeResultsProps) {
  const activeExpenses = result.expenseBreakdown.filter((e) => e.monthlyAmount > 0)

  if (activeExpenses.length === 0) return null

  return (
    <div className="profile-section" style={{ paddingBottom: '0', borderBottom: 'none' }}>
      <div className="section-label">Your Savings</div>
      {activeExpenses.map((expense) => (
        <ExpenseLineItem
          key={expense.name}
          name={expense.name}
          businessUsePct={expense.businessUsePct}
          discountPct={expense.discountPct}
          monthlyAmount={expense.monthlyAmount}
          effectiveMonthlyCost={expense.effectiveMonthlyCost}
        />
      ))}
      <TotalSection result={result} />
    </div>
  )
}
