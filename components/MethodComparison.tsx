'use client'

import type { HomeOfficeSavingsResult } from '@/lib/home-office-engine'
import { formatCurrency } from '@/lib/format'

interface MethodComparisonProps {
  result: HomeOfficeSavingsResult
  llcNetIncome: number
}

function MethodCard({ label, amount, isBetter }: { label: string; amount: number; isBetter: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        padding: '12px 8px',
        borderRadius: '4px',
        border: isBetter ? '2px solid #15803d' : '1px solid #ddd',
        background: isBetter ? 'rgba(21, 128, 61, 0.04)' : 'transparent',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#888',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: isBetter ? '#15803d' : '#555',
        }}
      >
        {formatCurrency(amount)}
      </div>
      {isBetter && (
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: '#15803d',
            letterSpacing: '1px',
            marginTop: '4px',
          }}
        >
          BETTER
        </div>
      )}
    </div>
  )
}

export default function MethodComparison({ result, llcNetIncome }: MethodComparisonProps) {
  const hasExpenses = result.expenseBreakdown.some((e) => e.monthlyAmount > 0)
  if (!hasExpenses) return null

  return (
    <div className="profile-section">
      <div className="section-label">Simplified vs Actual Method</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <MethodCard label="Simplified" amount={result.simplified.annualDeduction} isBetter={!result.recommendActual} />
        <MethodCard label="Actual" amount={result.actual.totalAnnualDeduction} isBetter={result.recommendActual} />
      </div>

      {result.actual.capped && (
        <div
          style={{
            fontSize: '11px',
            color: '#b91c1c',
            lineHeight: '1.5',
            marginBottom: '8px',
            padding: '6px 8px',
            background: 'rgba(185, 28, 28, 0.04)',
            borderRadius: '3px',
          }}
        >
          Deduction limited to your LLC net income of {formatCurrency(llcNetIncome)}
        </div>
      )}

      <div
        style={{
          fontSize: '10px',
          color: '#999',
          lineHeight: '1.5',
        }}
      >
        Using the actual method may trigger depreciation recapture (25% tax) when you sell your home. The simplified
        method avoids this.
      </div>
    </div>
  )
}
