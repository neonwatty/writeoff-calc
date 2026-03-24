'use client'

import { useState, useMemo } from 'react'
import { useProfile } from '@/lib/use-profile'
import { computeBusinessUsePct, computeHomeOfficeSavings } from '@/lib/home-office-engine'
import type { HomeOfficeExpense } from '@/lib/home-office-engine'
import SharedProfile from '@/components/SharedProfile'
import HomeOfficeInputs, { EXPENSE_CONFIGS, type ExpenseState } from '@/components/HomeOfficeInputs'
import HomeOfficeResults from '@/components/HomeOfficeResults'
import MethodComparison from '@/components/MethodComparison'

function buildInitialExpenses(): Record<string, ExpenseState> {
  const map: Record<string, ExpenseState> = {}
  for (const config of EXPENSE_CONFIGS) {
    map[config.key] = { amount: config.defaultAmount, pctOverride: null }
  }
  return map
}

function buildExpenseList(expenses: Record<string, ExpenseState>, sqftPct: number): HomeOfficeExpense[] {
  return EXPENSE_CONFIGS.map((config) => {
    const state = expenses[config.key]
    let businessUsePct: number | null = state.pctOverride

    if (businessUsePct === null && config.defaultPctType === 'fixed') {
      businessUsePct = config.fixedPct
    }

    // If still null (sqft type with no override), pass null so engine uses sqftPct
    // But if sqftPct is the same as what the engine would compute, keep null
    if (businessUsePct !== null && Math.abs(businessUsePct - sqftPct) < 0.01 && config.defaultPctType === 'sqft') {
      businessUsePct = null
    }

    return {
      name: config.name,
      monthlyAmount: state.amount,
      businessUsePct,
    }
  })
}

export default function HomeOfficeCalculator() {
  const { profile, setProfile } = useProfile()
  const [officeSqft, setOfficeSqft] = useState(0)
  const [homeSqft, setHomeSqft] = useState(0)
  const [expenses, setExpenses] = useState<Record<string, ExpenseState>>(buildInitialExpenses)

  const sqftPct = computeBusinessUsePct(officeSqft, homeSqft)

  const result = useMemo(() => {
    const expenseList = buildExpenseList(expenses, sqftPct)
    return computeHomeOfficeSavings(profile, {
      officeSqft,
      homeSqft,
      expenses: expenseList,
    })
  }, [profile, officeSqft, homeSqft, expenses, sqftPct])

  function handleExpenseChange(key: string, state: ExpenseState) {
    setExpenses((prev) => ({ ...prev, [key]: state }))
  }

  return (
    <div className="receipt">
      <div className="receipt-header">
        <h1>Home Office Costs</h1>
        <div className="subtitle">
          {profile.state} &middot; {profile.taxYear}
        </div>
      </div>

      <SharedProfile profile={profile} onChange={setProfile} />

      <HomeOfficeInputs
        officeSqft={officeSqft}
        homeSqft={homeSqft}
        sqftPct={sqftPct}
        expenses={expenses}
        onOfficeSqftChange={setOfficeSqft}
        onHomeSqftChange={setHomeSqft}
        onExpenseChange={handleExpenseChange}
      />

      <HomeOfficeResults result={result} />

      <MethodComparison result={result} llcNetIncome={profile.llcNetIncome} />

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
  )
}
