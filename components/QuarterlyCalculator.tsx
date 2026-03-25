'use client'

import { useState, useMemo } from 'react'
import { useProfile } from '@/lib/use-profile'
import { computeTaxLiability } from '@/lib/tax-engine'
import { computeQuarterlyEstimates } from '@/lib/quarterly-engine'
import type { QuarterlyResult } from '@/lib/quarterly-engine'
import { parseCurrencyInput } from '@/lib/format'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import ProfileSummary from '@/components/ProfileSummary'
import TaxPicture from '@/components/TaxPicture'
import QuarterlyPaymentBox from '@/components/QuarterlyPaymentBox'
import W4Tip from '@/components/W4Tip'

function formatForDisplay(amount: number): string {
  const abs = Math.abs(amount)
  const whole = Math.round(abs)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = `$${whole}`
  return amount < 0 ? `-${formatted}` : formatted
}

function WithholdingSection({
  annualWithholding,
  priorYearTax,
  onWithholdingChange,
  onPriorYearTaxChange,
}: {
  annualWithholding: number
  priorYearTax: number
  onWithholdingChange: (v: number) => void
  onPriorYearTaxChange: (v: number) => void
}) {
  const [whDisplay, setWhDisplay] = useState(() => formatForDisplay(annualWithholding))
  const [pytDisplay, setPytDisplay] = useState(() => formatForDisplay(priorYearTax))

  function handleWhFocus() {
    setWhDisplay(annualWithholding === 0 ? '' : String(annualWithholding))
  }
  function handleWhBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = parseCurrencyInput(e.target.value)
    const cleaned = isNaN(value) ? 0 : value
    onWithholdingChange(cleaned)
    setWhDisplay(formatForDisplay(cleaned))
  }
  function handleWhChange(e: React.ChangeEvent<HTMLInputElement>) {
    setWhDisplay(e.target.value)
  }

  function handlePytFocus() {
    setPytDisplay(priorYearTax === 0 ? '' : String(priorYearTax))
  }
  function handlePytBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = parseCurrencyInput(e.target.value)
    const cleaned = isNaN(value) ? 0 : value
    onPriorYearTaxChange(cleaned)
    setPytDisplay(formatForDisplay(cleaned))
  }
  function handlePytChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPytDisplay(e.target.value)
  }

  return (
    <div className="profile-section">
      <div className="section-label">Your Withholding</div>
      <div className="profile-row">
        <span className="label">Annual W-2 Withholding</span>
        <input
          type="text"
          inputMode="numeric"
          value={whDisplay}
          onFocus={handleWhFocus}
          onBlur={handleWhBlur}
          onChange={handleWhChange}
        />
      </div>
      <div
        style={{
          fontSize: '10px',
          color: '#999',
          lineHeight: '1.4',
          marginBottom: '8px',
          textAlign: 'right',
        }}
      >
        Check your pay stub for YTD federal withholding, or multiply per-paycheck amount by number of pay periods
      </div>
      <div className="profile-row">
        <span className="label">Prior Year Total Tax</span>
        <input
          type="text"
          inputMode="numeric"
          value={pytDisplay}
          onFocus={handlePytFocus}
          onBlur={handlePytBlur}
          onChange={handlePytChange}
        />
      </div>
      <div
        style={{
          fontSize: '10px',
          color: '#999',
          lineHeight: '1.4',
          marginBottom: '8px',
          textAlign: 'right',
        }}
      >
        Line 24 on your prior year Form 1040
      </div>
    </div>
  )
}

function ResultsSection({ result }: { result: QuarterlyResult }) {
  if (result.noPaymentNeeded) {
    return (
      <div className="profile-section" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            background: '#15803d',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            padding: '6px 16px',
            borderRadius: '4px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          No Payments Needed
        </div>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>{result.noPaymentReason}</div>
      </div>
    )
  }

  return (
    <>
      <TaxPicture result={result} />
      <QuarterlyPaymentBox result={result} />
      <div
        style={{
          fontSize: '10px',
          color: '#999',
          lineHeight: '1.5',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        Based on {result.safeHarbor.method} &mdash; avoids underpayment penalty
      </div>
    </>
  )
}

export default function QuarterlyCalculator() {
  const { profile } = useProfile()
  const [annualWithholding, setAnnualWithholding] = useState(0)
  const [priorYearTax, setPriorYearTax] = useState(0)

  const result = useMemo(
    () => computeQuarterlyEstimates(profile, { annualWithholding, priorYearTax }),
    [profile, annualWithholding, priorYearTax],
  )

  const showResults = annualWithholding > 0 || profile.llcNetIncome > 0
  const baseline = computeTaxLiability(profile)

  return (
    <>
      <NavBar />
      <div className="receipt">
        <div className="receipt-header">
          <h1>
            <Link href="/calculators">Quarterly Estimates</Link>
          </h1>
          <div className="subtitle">
            {profile.state} &middot; {profile.taxYear}
          </div>
        </div>

        <ProfileSummary profile={profile} baseline={baseline} />

        <WithholdingSection
          annualWithholding={annualWithholding}
          priorYearTax={priorYearTax}
          onWithholdingChange={setAnnualWithholding}
          onPriorYearTaxChange={setPriorYearTax}
        />

        {showResults && <ResultsSection result={result} />}
        {showResults && !result.noPaymentNeeded && <W4Tip w4Increase={result.w4Increase} />}

        <div className="receipt-footer">
          YOUR DATA STAYS IN THIS BROWSER
          <br />
          NOTHING IS SENT TO ANY SERVER
          <br />
          <br />
          FOR ESTIMATION PURPOSES ONLY
          <br />
          NOT TAX ADVICE &middot; CONSULT YOUR CPA
          <br />* * * THANK YOU * * *
        </div>
      </div>
    </>
  )
}
