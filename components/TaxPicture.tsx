'use client'

import type { QuarterlyResult } from '@/lib/quarterly-engine'
import { formatCurrency } from '@/lib/format'

interface TaxPictureProps {
  result: QuarterlyResult
}

export default function TaxPicture({ result }: TaxPictureProps) {
  return (
    <div className="profile-section">
      <div className="section-label">Tax Picture</div>

      <div className="profile-row" style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#555' }}>Total tax liability</span>
        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{formatCurrency(result.totalTaxLiability)}</span>
      </div>

      <div className="profile-row" style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#555' }}>W-2 withholding covers</span>
        <span style={{ fontWeight: 600, color: '#15803d' }}>&minus;{formatCurrency(result.annualWithholding)}</span>
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px dashed #ccc',
          margin: '10px 0',
        }}
      />

      <div className="profile-row" style={{ fontSize: '13px', fontWeight: 700 }}>
        <span style={{ color: '#1a1a1a' }}>Remaining (LLC portion)</span>
        <span style={{ color: '#1a1a1a' }}>{formatCurrency(result.remainingLiability)}</span>
      </div>
    </div>
  )
}
