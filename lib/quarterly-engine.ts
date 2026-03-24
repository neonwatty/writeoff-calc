import type { TaxProfile } from './tax-engine'
import { computeTaxLiability } from './tax-engine'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface QuarterlyInputs {
  annualWithholding: number
  priorYearTax: number
}

export interface DueDate {
  quarter: string
  label: string
  date: string
}

export interface SafeHarborResult {
  safeHarborAmount: number
  method: string
}

export interface W4Increase {
  annualIncrease: number
  perPaycheck26: number // bi-weekly
  perPaycheck24: number // semi-monthly
}

export interface QuarterlyResult {
  totalTaxLiability: number
  annualWithholding: number
  remainingLiability: number
  quarterlyPayment: number
  dueDates: DueDate[]
  safeHarbor: SafeHarborResult
  noPaymentNeeded: boolean
  noPaymentReason: string | null
  w4Increase: W4Increase
}

// ─── Due Date Lookup ───────────────────────────────────────────────────────────

const DUE_DATES: Record<number, DueDate[]> = {
  2025: [
    { quarter: 'Q1', label: 'Apr 15, 2025', date: '2025-04-15' },
    { quarter: 'Q2', label: 'Jun 16, 2025', date: '2025-06-16' }, // June 15 is Sunday
    { quarter: 'Q3', label: 'Sep 16, 2025', date: '2025-09-16' }, // Sep 15 is Sunday
    { quarter: 'Q4', label: 'Jan 15, 2026', date: '2026-01-15' },
  ],
  2026: [
    { quarter: 'Q1', label: 'Apr 15, 2026', date: '2026-04-15' },
    { quarter: 'Q2', label: 'Jun 16, 2026', date: '2026-06-16' }, // Jun 15 is Sunday
    { quarter: 'Q3', label: 'Sep 15, 2026', date: '2026-09-15' },
    { quarter: 'Q4', label: 'Jan 15, 2027', date: '2027-01-15' },
  ],
}

export function getQuarterlyDueDates(taxYear: number): DueDate[] {
  return DUE_DATES[taxYear] ?? DUE_DATES[2025]
}

// ─── Safe Harbor ───────────────────────────────────────────────────────────────

export function computeSafeHarbor(
  priorYearTax: number,
  currentYearTax: number,
  currentYearAGI: number,
): SafeHarborResult {
  // Prior year safe harbor: 110% if AGI > $150K, otherwise 100%
  const priorYearFactor = currentYearAGI > 150_000 ? 1.1 : 1.0
  const priorYearAmount = Math.round(priorYearTax * priorYearFactor)
  const priorYearMethod = priorYearFactor > 1 ? '110% prior year (AGI > $150K)' : '100% prior year'

  // Current year safe harbor: 90% of current year tax
  const currentYearAmount = Math.round(currentYearTax * 0.9)

  // Use the lesser of the two
  if (currentYearAmount < priorYearAmount) {
    return { safeHarborAmount: currentYearAmount, method: '90% current year' }
  }
  return { safeHarborAmount: priorYearAmount, method: priorYearMethod }
}

// ─── Main Calculation ──────────────────────────────────────────────────────────

export function computeQuarterlyEstimates(profile: TaxProfile, inputs: QuarterlyInputs): QuarterlyResult {
  // Get total tax liability from the existing engine
  const taxResult = computeTaxLiability(profile)
  const totalTaxLiability = taxResult.totalTax

  // Subtract withholding
  const remainingLiability = Math.max(0, totalTaxLiability - inputs.annualWithholding)

  // Quarterly payment = remaining / 4
  const quarterlyPayment = Math.round(remainingLiability / 4)

  // Due dates
  const dueDates = getQuarterlyDueDates(profile.taxYear)

  // Safe harbor: lesser of 90% current year OR 100%/110% prior year
  const safeHarbor = computeSafeHarbor(inputs.priorYearTax, totalTaxLiability, taxResult.agi)

  // De minimis check: no payment needed if remaining < $1,000
  const noPaymentNeeded = remainingLiability < 1_000
  const noPaymentReason = noPaymentNeeded
    ? 'You owe less than $1,000 after withholding — no estimated payments required'
    : null

  // W-4 increase suggestion
  const w4Increase: W4Increase = {
    annualIncrease: remainingLiability,
    perPaycheck26: Math.round(remainingLiability / 26), // bi-weekly
    perPaycheck24: Math.round(remainingLiability / 24), // semi-monthly
  }

  return {
    totalTaxLiability,
    annualWithholding: inputs.annualWithholding,
    remainingLiability,
    quarterlyPayment,
    dueDates,
    safeHarbor,
    noPaymentNeeded,
    noPaymentReason,
    w4Increase,
  }
}
