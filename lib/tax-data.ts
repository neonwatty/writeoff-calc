export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh'
export type TaxYear = 2025 | 2026

interface Bracket {
  rate: number
  floor: number
}

interface TaxData {
  brackets: Bracket[]
  standardDeduction: number
  ssWageBase: number
  ssRate: number
  medicareRate: number
  addlMedicareRate: number
  seIncomeFactor: number
  addlMedicareThreshold: number
  qbiRate: number
}

// Fixed SE tax rates (same for all years/statuses)
const SS_RATE = 0.124
const MEDICARE_RATE = 0.029
const ADDL_MEDICARE_RATE = 0.009
const SE_INCOME_FACTOR = 0.9235
const QBI_RATE = 0.2

// Additional Medicare thresholds by filing status
const ADDL_MEDICARE_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
}

// SS wage bases by year
const SS_WAGE_BASES: Record<TaxYear, number> = {
  2025: 176100,
  2026: 184500,
}

// Standard deductions by year and filing status
const STANDARD_DEDUCTIONS: Record<TaxYear, Record<FilingStatus, number>> = {
  2025: {
    single: 15750,
    mfj: 31500,
    mfs: 15750,
    hoh: 23625,
  },
  2026: {
    single: 16100,
    mfj: 32200,
    mfs: 16100,
    hoh: 24150,
  },
}

// Federal income tax brackets by year and filing status
const BRACKETS: Record<TaxYear, Record<FilingStatus, Bracket[]>> = {
  2025: {
    single: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 11925 },
      { rate: 0.22, floor: 48475 },
      { rate: 0.24, floor: 103350 },
      { rate: 0.32, floor: 197300 },
      { rate: 0.35, floor: 250525 },
      { rate: 0.37, floor: 626350 },
    ],
    mfj: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 23850 },
      { rate: 0.22, floor: 96950 },
      { rate: 0.24, floor: 206700 },
      { rate: 0.32, floor: 394600 },
      { rate: 0.35, floor: 501050 },
      { rate: 0.37, floor: 751600 },
    ],
    mfs: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 11925 },
      { rate: 0.22, floor: 48475 },
      { rate: 0.24, floor: 103350 },
      { rate: 0.32, floor: 197300 },
      { rate: 0.35, floor: 250525 },
      { rate: 0.37, floor: 375800 },
    ],
    hoh: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 17000 },
      { rate: 0.22, floor: 64850 },
      { rate: 0.24, floor: 103350 },
      { rate: 0.32, floor: 197300 },
      { rate: 0.35, floor: 250500 },
      { rate: 0.37, floor: 626350 },
    ],
  },
  2026: {
    single: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 12400 },
      { rate: 0.22, floor: 50400 },
      { rate: 0.24, floor: 105700 },
      { rate: 0.32, floor: 201775 },
      { rate: 0.35, floor: 256225 },
      { rate: 0.37, floor: 640600 },
    ],
    mfj: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 24800 },
      { rate: 0.22, floor: 100800 },
      { rate: 0.24, floor: 211400 },
      { rate: 0.32, floor: 403550 },
      { rate: 0.35, floor: 512450 },
      { rate: 0.37, floor: 768700 },
    ],
    mfs: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 12400 },
      { rate: 0.22, floor: 50400 },
      { rate: 0.24, floor: 105700 },
      { rate: 0.32, floor: 201775 },
      { rate: 0.35, floor: 256225 },
      { rate: 0.37, floor: 384350 },
    ],
    hoh: [
      { rate: 0.1, floor: 0 },
      { rate: 0.12, floor: 17700 },
      { rate: 0.22, floor: 67450 },
      { rate: 0.24, floor: 105700 },
      { rate: 0.32, floor: 201750 },
      { rate: 0.35, floor: 256200 },
      { rate: 0.37, floor: 640600 },
    ],
  },
}

export function getTaxData(year: TaxYear, filingStatus: FilingStatus): TaxData {
  return {
    brackets: BRACKETS[year][filingStatus],
    standardDeduction: STANDARD_DEDUCTIONS[year][filingStatus],
    ssWageBase: SS_WAGE_BASES[year],
    ssRate: SS_RATE,
    medicareRate: MEDICARE_RATE,
    addlMedicareRate: ADDL_MEDICARE_RATE,
    seIncomeFactor: SE_INCOME_FACTOR,
    addlMedicareThreshold: ADDL_MEDICARE_THRESHOLDS[filingStatus],
    qbiRate: QBI_RATE,
  }
}
