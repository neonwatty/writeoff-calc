import { describe, it, expect } from 'vitest'
import {
  computeBusinessUsePct,
  computeSimplifiedDeduction,
  computeActualDeduction,
  computeHomeOfficeSavings,
  HomeOfficeExpense,
} from '../home-office-engine'
import type { TaxProfile } from '../tax-engine'

const baseProfile: TaxProfile = {
  w2Income: 150_000,
  llcNetIncome: 80_000,
  filingStatus: 'single',
  taxYear: 2025,
  state: 'Arizona',
}

const sampleExpenses: HomeOfficeExpense[] = [
  { name: 'Rent', monthlyAmount: 2500, businessUsePct: null },
  { name: 'Internet', monthlyAmount: 80, businessUsePct: 50 },
  { name: 'Phone', monthlyAmount: 120, businessUsePct: 50 },
  { name: 'Electric', monthlyAmount: 150, businessUsePct: null },
]

describe('computeBusinessUsePct', () => {
  it('calculates percentage from sqft', () => {
    expect(computeBusinessUsePct(150, 1200)).toBeCloseTo(12.5, 1)
  })

  it('returns 0 when office or home is 0', () => {
    expect(computeBusinessUsePct(0, 1200)).toBe(0)
    expect(computeBusinessUsePct(150, 0)).toBe(0)
  })

  it('caps at 100%', () => {
    expect(computeBusinessUsePct(1500, 1200)).toBe(100)
  })
})

describe('computeSimplifiedDeduction', () => {
  it('calculates $5 per sqft', () => {
    expect(computeSimplifiedDeduction(150)).toBe(750)
  })

  it('caps at 300 sqft ($1,500)', () => {
    expect(computeSimplifiedDeduction(400)).toBe(1500)
  })

  it('returns 0 for 0 sqft', () => {
    expect(computeSimplifiedDeduction(0)).toBe(0)
  })
})

describe('computeActualDeduction', () => {
  it('sums business portions of all expenses (annual)', () => {
    // Rent: 2500 * 12.5% * 12 = 3750
    // Internet: 80 * 50% * 12 = 480
    // Phone: 120 * 50% * 12 = 720
    // Electric: 150 * 12.5% * 12 = 225
    // Total = 5175
    const result = computeActualDeduction(sampleExpenses, 12.5, 80_000)
    expect(result.totalAnnualDeduction).toBeCloseTo(5175, 0)
    expect(result.capped).toBe(false)
  })

  it('caps deduction at LLC net income', () => {
    const result = computeActualDeduction(sampleExpenses, 12.5, 3_000)
    expect(result.totalAnnualDeduction).toBe(3_000)
    expect(result.capped).toBe(true)
  })

  it('returns per-expense annual amounts', () => {
    const result = computeActualDeduction(sampleExpenses, 12.5, 80_000)
    expect(result.expenses).toHaveLength(4)
    expect(result.expenses[0].annualDeductible).toBeCloseTo(3750, 0) // rent
    expect(result.expenses[1].annualDeductible).toBeCloseTo(480, 0) // internet
  })
})

describe('computeHomeOfficeSavings', () => {
  it('returns per-expense savings with effective cost and discount', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 150,
      homeSqft: 1200,
      expenses: sampleExpenses,
    })

    expect(result.businessUsePct).toBeCloseTo(12.5, 1)
    expect(result.simplified.annualDeduction).toBe(750)
    expect(result.actual.totalAnnualDeduction).toBeGreaterThan(0)
    expect(result.recommendActual).toBe(true) // actual > simplified for these inputs
  })

  it('returns monthly totals', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 150,
      homeSqft: 1200,
      expenses: sampleExpenses,
    })

    expect(result.totalMonthlyExpenses).toBe(2850) // 2500+80+120+150
    expect(result.totalMonthlySavings).toBeGreaterThan(0)
    expect(result.effectiveMonthlyTotal).toBeLessThan(2850)
  })

  it('returns per-expense breakdown', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 150,
      homeSqft: 1200,
      expenses: sampleExpenses,
    })

    expect(result.expenseBreakdown).toHaveLength(4)
    const rent = result.expenseBreakdown[0]
    expect(rent.name).toBe('Rent')
    expect(rent.monthlyAmount).toBe(2500)
    expect(rent.effectiveMonthlyCost).toBeLessThan(2500)
    expect(rent.discountPct).toBeGreaterThan(0)
    expect(rent.monthlySavings).toBeGreaterThan(0)
  })

  it('uses custom businessUsePct when provided, sqft ratio when null', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 150,
      homeSqft: 1200,
      expenses: sampleExpenses,
    })

    // Rent uses sqft ratio (12.5%), Internet uses custom 50%
    expect(result.expenseBreakdown[0].businessUsePct).toBeCloseTo(12.5, 1)
    expect(result.expenseBreakdown[1].businessUsePct).toBe(50)
  })

  it('returns annualSavings = monthlySavings * 12', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 150,
      homeSqft: 1200,
      expenses: sampleExpenses,
    })

    expect(result.annualSavings).toBeCloseTo(result.totalMonthlySavings * 12, 0)
  })

  it('handles zero expenses gracefully', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 150,
      homeSqft: 1200,
      expenses: [],
    })

    expect(result.totalMonthlySavings).toBe(0)
    expect(result.expenseBreakdown).toHaveLength(0)
  })

  it('handles zero sqft gracefully', () => {
    const result = computeHomeOfficeSavings(baseProfile, {
      officeSqft: 0,
      homeSqft: 1200,
      expenses: sampleExpenses,
    })

    expect(result.businessUsePct).toBe(0)
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0) // internet/phone still have custom 50%
  })
})
