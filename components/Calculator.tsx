'use client'

import { useState } from 'react'
import { computeTaxLiability, computeSavings, SavingsBreakdown, TaxResult } from '@/lib/tax-engine'
import { useProfile } from '@/lib/use-profile'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import ProfileSummary from '@/components/ProfileSummary'
import RatesSummary from '@/components/RatesSummary'
import PurchaseInput from '@/components/PurchaseInput'
import ResultHero from '@/components/ResultHero'
import Breakdown from '@/components/Breakdown'
import QuickCompare from '@/components/QuickCompare'

export default function Calculator() {
  const { profile } = useProfile()
  const [expenseAmount, setExpenseAmount] = useState<number>(0)

  const baseline: TaxResult = computeTaxLiability(profile)
  const breakdown: SavingsBreakdown | null = expenseAmount > 0 ? computeSavings(profile, expenseAmount) : null

  return (
    <>
      <NavBar />
      <div className="receipt">
        <div className="receipt-header">
          <h1>
            <Link href="/calculators">Write-Off Calculator</Link>
          </h1>
          <div className="subtitle">
            {profile.state} · {profile.taxYear}
          </div>
        </div>

        <ProfileSummary profile={profile} baseline={baseline} />
        <RatesSummary baseline={baseline} state={profile.state} />

        <PurchaseInput value={expenseAmount} onChange={setExpenseAmount} />

        {breakdown && <ResultHero breakdown={breakdown} expenseAmount={expenseAmount} />}

        {breakdown && <Breakdown breakdown={breakdown} expenseAmount={expenseAmount} profile={profile} />}

        <QuickCompare profile={profile} onSelectAmount={setExpenseAmount} />

        <div className="receipt-footer">
          YOUR DATA STAYS IN THIS BROWSER
          <br />
          NOTHING IS SENT TO ANY SERVER
          <br />
          <br />
          FOR ESTIMATION PURPOSES ONLY
          <br />
          NOT TAX ADVICE · CONSULT YOUR CPA
          <br />* * * THANK YOU * * *
        </div>
      </div>
    </>
  )
}
