import type { TaxProfile } from './tax-engine'
import { computeSavings } from './tax-engine'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface HomeOfficeExpense {
  name: string
  monthlyAmount: number
  /** Business-use percentage override. null = use sqft ratio. */
  businessUsePct: number | null
}

interface HomeOfficeInputs {
  officeSqft: number
  homeSqft: number
  expenses: HomeOfficeExpense[]
}

export interface ActualDeductionResult {
  totalAnnualDeduction: number
  capped: boolean
  uncappedTotal: number
  expenses: { name: string; annualDeductible: number; businessUsePct: number }[]
}

export interface ExpenseBreakdown {
  name: string
  monthlyAmount: number
  businessUsePct: number
  monthlyDeductible: number
  monthlySavings: number
  effectiveMonthlyCost: number
  discountPct: number
}

export interface HomeOfficeSavingsResult {
  businessUsePct: number
  simplified: { annualDeduction: number }
  actual: ActualDeductionResult
  recommendActual: boolean
  expenseBreakdown: ExpenseBreakdown[]
  totalMonthlyExpenses: number
  totalMonthlySavings: number
  effectiveMonthlyTotal: number
  annualSavings: number
}

// ─── Functions ─────────────────────────────────────────────────────────────────

export function computeBusinessUsePct(officeSqft: number, homeSqft: number): number {
  if (officeSqft <= 0 || homeSqft <= 0) return 0
  return Math.min(100, (officeSqft / homeSqft) * 100)
}

export function computeSimplifiedDeduction(officeSqft: number): number {
  const qualifyingSqft = Math.min(Math.max(0, officeSqft), 300)
  return qualifyingSqft * 5
}

export function computeActualDeduction(
  expenses: HomeOfficeExpense[],
  sqftPct: number,
  llcNetIncome: number,
): ActualDeductionResult {
  const expenseDetails = expenses.map((exp) => {
    const pct = exp.businessUsePct ?? sqftPct
    const annualDeductible = exp.monthlyAmount * (pct / 100) * 12
    return { name: exp.name, annualDeductible, businessUsePct: pct }
  })

  const uncappedTotal = expenseDetails.reduce((sum, e) => sum + e.annualDeductible, 0)
  const effectiveIncome = Math.max(0, llcNetIncome)
  const capped = uncappedTotal > effectiveIncome
  const totalAnnualDeduction = capped ? effectiveIncome : uncappedTotal

  // If capped, scale each expense proportionally
  if (capped && uncappedTotal > 0) {
    const ratio = effectiveIncome / uncappedTotal
    for (const exp of expenseDetails) {
      exp.annualDeductible = exp.annualDeductible * ratio
    }
  }

  return { totalAnnualDeduction, capped, uncappedTotal, expenses: expenseDetails }
}

export function computeHomeOfficeSavings(profile: TaxProfile, inputs: HomeOfficeInputs): HomeOfficeSavingsResult {
  const sqftPct = computeBusinessUsePct(inputs.officeSqft, inputs.homeSqft)
  const simplified = {
    annualDeduction: computeSimplifiedDeduction(inputs.officeSqft),
  }
  const actual = computeActualDeduction(inputs.expenses, sqftPct, profile.llcNetIncome)

  const recommendActual = actual.totalAnnualDeduction > simplified.annualDeduction

  // Use whichever method gives a higher deduction for the savings calculation
  const bestDeduction = recommendActual ? actual.totalAnnualDeduction : simplified.annualDeduction

  // Get aggregate tax savings from the existing engine
  const savings = bestDeduction > 0 ? computeSavings(profile, bestDeduction) : null
  const totalAnnualSavings = savings?.totalSavings ?? 0

  // Derive effective discount rate (how much of each deducted dollar comes back as tax savings)
  const effectiveRate = bestDeduction > 0 ? totalAnnualSavings / bestDeduction : 0

  // Build per-expense breakdown
  const totalMonthlyExpenses = inputs.expenses.reduce((sum, e) => sum + e.monthlyAmount, 0)

  // When capped, scale per-expense deductibles proportionally
  const capRatio =
    recommendActual && actual.capped && actual.uncappedTotal > 0
      ? actual.totalAnnualDeduction / actual.uncappedTotal
      : 1

  const expenseBreakdown: ExpenseBreakdown[] = inputs.expenses.map((exp) => {
    const pct = exp.businessUsePct ?? sqftPct
    const rawMonthlyDeductible = exp.monthlyAmount * (pct / 100)
    const monthlyDeductible = rawMonthlyDeductible * capRatio
    const monthlySavings = monthlyDeductible * effectiveRate
    const effectiveMonthlyCost = exp.monthlyAmount - monthlySavings
    const discountPct = exp.monthlyAmount > 0 ? (monthlySavings / exp.monthlyAmount) * 100 : 0

    return {
      name: exp.name,
      monthlyAmount: exp.monthlyAmount,
      businessUsePct: pct,
      monthlyDeductible,
      monthlySavings,
      effectiveMonthlyCost,
      discountPct,
    }
  })

  const totalMonthlySavings = expenseBreakdown.reduce((sum, e) => sum + e.monthlySavings, 0)
  const effectiveMonthlyTotal = totalMonthlyExpenses - totalMonthlySavings

  return {
    businessUsePct: sqftPct,
    simplified,
    actual,
    recommendActual,
    expenseBreakdown,
    totalMonthlyExpenses,
    totalMonthlySavings,
    effectiveMonthlyTotal,
    annualSavings: totalMonthlySavings * 12,
  }
}
