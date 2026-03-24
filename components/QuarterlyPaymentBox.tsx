'use client'

import type { QuarterlyResult } from '@/lib/quarterly-engine'
import { formatCurrency } from '@/lib/format'

interface QuarterlyPaymentBoxProps {
  result: QuarterlyResult
}

export default function QuarterlyPaymentBox({ result }: QuarterlyPaymentBoxProps) {
  return (
    <div
      style={{
        background: '#fff8e1',
        border: '2px solid #f9a825',
        borderRadius: '6px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#e65100',
          letterSpacing: '2px',
          fontVariant: 'small-caps',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        Set Aside Each Quarter
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#e65100',
          marginBottom: '16px',
        }}
      >
        {formatCurrency(result.quarterlyPayment)}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: '#555',
          lineHeight: '1.8',
          textAlign: 'left',
        }}
      >
        {result.dueDates.map((dd) => (
          <div
            key={dd.quarter}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600 }}>{dd.quarter}</span>
            <span>{dd.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
