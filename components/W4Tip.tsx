'use client'

import type { W4Increase } from '@/lib/quarterly-engine'
import { formatCurrency } from '@/lib/format'

interface W4TipProps {
  w4Increase: W4Increase
}

export default function W4Tip({ w4Increase }: W4TipProps) {
  return (
    <div className="profile-section">
      <div className="section-label">Alternative: Increase Your W-4</div>
      <div
        style={{
          fontSize: '12px',
          color: '#555',
          lineHeight: '1.6',
          marginBottom: '12px',
        }}
      >
        Instead of quarterly payments, you can increase your W-2 withholding. The IRS treats withholding as paid evenly
        throughout the year, making this a simpler approach.
      </div>
      <div className="profile-row" style={{ fontSize: '12px', marginBottom: '6px' }}>
        <span style={{ color: '#555' }}>
          Add per paycheck <span style={{ color: '#999', fontSize: '10px' }}>(bi-weekly, 26 paychecks)</span>
        </span>
        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{formatCurrency(w4Increase.perPaycheck26)}</span>
      </div>
      <div className="profile-row" style={{ fontSize: '12px', marginBottom: '6px' }}>
        <span style={{ color: '#555' }}>
          Add per paycheck <span style={{ color: '#999', fontSize: '10px' }}>(semi-monthly, 24 paychecks)</span>
        </span>
        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{formatCurrency(w4Increase.perPaycheck24)}</span>
      </div>
    </div>
  )
}
