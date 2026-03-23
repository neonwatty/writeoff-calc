/* eslint-disable max-lines */
/**
 * 2025 US State Income Tax Data
 *
 * All data for single filers.
 * Sources: SmartAsset, state DOR websites, Tax Foundation, tax-brackets.org
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface StateBracket {
  rate: number
  floor: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const NO_INCOME_TAX_STATES: string[] = [
  'Alaska',
  'Florida',
  'Nevada',
  'New Hampshire',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Washington',
  'Wyoming',
]

export const STATE_WARNINGS: Record<string, string> = {
  Maryland: 'Your state also has county/local income taxes not included here',
  Indiana: 'Your state also has county/local income taxes not included here',
  California: 'CA charges an $800/year minimum LLC franchise tax',
  Ohio: 'Your state has local/municipal income taxes not included here',
  Pennsylvania: 'Your state has local/municipal income taxes not included here',
}

// ─── State Bracket Data ───────────────────────────────────────────────────────

const STATE_BRACKETS: Record<string, StateBracket[]> = {
  // ── Flat-Rate States ──────────────────────────────────────────────────────
  Arizona: [{ rate: 0.025, floor: 0 }],
  Colorado: [{ rate: 0.044, floor: 0 }],
  Georgia: [{ rate: 0.0539, floor: 0 }],
  Idaho: [{ rate: 0.057, floor: 0 }],
  Illinois: [{ rate: 0.0495, floor: 0 }],
  Indiana: [{ rate: 0.03, floor: 0 }],
  Iowa: [{ rate: 0.038, floor: 0 }],
  Kentucky: [{ rate: 0.04, floor: 0 }],
  Louisiana: [{ rate: 0.03, floor: 0 }],
  Michigan: [{ rate: 0.0425, floor: 0 }],
  'North Carolina': [{ rate: 0.0425, floor: 0 }],
  Pennsylvania: [{ rate: 0.0307, floor: 0 }],
  Utah: [{ rate: 0.0455, floor: 0 }],

  // ── Flat with Exemption ───────────────────────────────────────────────────
  // Mississippi: flat 4.4% but with a $10K zero bracket
  Mississippi: [
    { rate: 0.0, floor: 0 },
    { rate: 0.044, floor: 10_000 },
  ],

  // ── Progressive States ────────────────────────────────────────────────────
  Alabama: [
    { rate: 0.02, floor: 0 },
    { rate: 0.04, floor: 500 },
    { rate: 0.05, floor: 3_000 },
  ],

  Arkansas: [
    { rate: 0.0, floor: 0 },
    { rate: 0.02, floor: 5_500 },
    { rate: 0.03, floor: 10_900 },
    { rate: 0.034, floor: 15_600 },
    { rate: 0.039, floor: 25_700 },
  ],

  California: [
    { rate: 0.01, floor: 0 },
    { rate: 0.02, floor: 11_079 },
    { rate: 0.04, floor: 26_264 },
    { rate: 0.06, floor: 41_452 },
    { rate: 0.08, floor: 57_542 },
    { rate: 0.093, floor: 72_724 },
    { rate: 0.103, floor: 371_479 },
    { rate: 0.113, floor: 445_771 },
    { rate: 0.123, floor: 742_953 },
    { rate: 0.133, floor: 1_000_000 },
  ],

  Connecticut: [
    { rate: 0.02, floor: 0 },
    { rate: 0.045, floor: 10_000 },
    { rate: 0.055, floor: 50_000 },
    { rate: 0.06, floor: 100_000 },
    { rate: 0.065, floor: 200_000 },
    { rate: 0.069, floor: 250_000 },
    { rate: 0.0699, floor: 500_000 },
  ],

  Delaware: [
    { rate: 0.0, floor: 0 },
    { rate: 0.022, floor: 2_000 },
    { rate: 0.039, floor: 5_000 },
    { rate: 0.048, floor: 10_000 },
    { rate: 0.052, floor: 20_000 },
    { rate: 0.0555, floor: 25_000 },
    { rate: 0.066, floor: 60_000 },
  ],

  'District of Columbia': [
    { rate: 0.04, floor: 0 },
    { rate: 0.06, floor: 10_000 },
    { rate: 0.065, floor: 40_000 },
    { rate: 0.085, floor: 60_000 },
    { rate: 0.0925, floor: 250_000 },
    { rate: 0.0975, floor: 500_000 },
    { rate: 0.1075, floor: 1_000_000 },
  ],

  Hawaii: [
    { rate: 0.014, floor: 0 },
    { rate: 0.032, floor: 9_600 },
    { rate: 0.055, floor: 14_400 },
    { rate: 0.064, floor: 19_200 },
    { rate: 0.068, floor: 24_000 },
    { rate: 0.072, floor: 36_000 },
    { rate: 0.076, floor: 48_000 },
    { rate: 0.079, floor: 125_000 },
    { rate: 0.0825, floor: 175_000 },
    { rate: 0.09, floor: 225_000 },
    { rate: 0.1, floor: 275_000 },
    { rate: 0.11, floor: 325_000 },
  ],

  Kansas: [
    { rate: 0.031, floor: 0 },
    { rate: 0.0525, floor: 15_000 },
    { rate: 0.057, floor: 30_000 },
  ],

  Maine: [
    { rate: 0.058, floor: 0 },
    { rate: 0.0675, floor: 26_800 },
    { rate: 0.0715, floor: 63_450 },
  ],

  Maryland: [
    { rate: 0.02, floor: 0 },
    { rate: 0.03, floor: 1_000 },
    { rate: 0.04, floor: 2_000 },
    { rate: 0.0475, floor: 3_000 },
    { rate: 0.05, floor: 100_000 },
    { rate: 0.0525, floor: 125_000 },
    { rate: 0.055, floor: 150_000 },
    { rate: 0.0575, floor: 250_000 },
    { rate: 0.0625, floor: 500_000 },
    { rate: 0.065, floor: 1_000_000 },
  ],

  Massachusetts: [
    { rate: 0.05, floor: 0 },
    { rate: 0.09, floor: 1_083_150 },
  ],

  Minnesota: [
    { rate: 0.0535, floor: 0 },
    { rate: 0.068, floor: 32_570 },
    { rate: 0.0785, floor: 106_990 },
    { rate: 0.0985, floor: 198_630 },
  ],

  Missouri: [
    { rate: 0.0, floor: 0 },
    { rate: 0.02, floor: 1_313 },
    { rate: 0.025, floor: 2_626 },
    { rate: 0.03, floor: 3_939 },
    { rate: 0.035, floor: 5_252 },
    { rate: 0.04, floor: 6_565 },
    { rate: 0.045, floor: 7_878 },
    { rate: 0.047, floor: 9_191 },
  ],

  Montana: [
    { rate: 0.047, floor: 0 },
    { rate: 0.059, floor: 21_100 },
  ],

  Nebraska: [
    { rate: 0.0246, floor: 0 },
    { rate: 0.0351, floor: 4_030 },
    { rate: 0.0501, floor: 24_120 },
    { rate: 0.052, floor: 38_870 },
  ],

  'New Jersey': [
    { rate: 0.014, floor: 0 },
    { rate: 0.0175, floor: 20_000 },
    { rate: 0.035, floor: 35_000 },
    { rate: 0.05525, floor: 40_000 },
    { rate: 0.0637, floor: 75_000 },
    { rate: 0.0897, floor: 500_000 },
    { rate: 0.1075, floor: 1_000_000 },
  ],

  'New Mexico': [
    { rate: 0.015, floor: 0 },
    { rate: 0.032, floor: 5_500 },
    { rate: 0.043, floor: 16_500 },
    { rate: 0.047, floor: 33_500 },
    { rate: 0.049, floor: 66_500 },
    { rate: 0.059, floor: 210_000 },
  ],

  'New York': [
    { rate: 0.04, floor: 0 },
    { rate: 0.045, floor: 8_500 },
    { rate: 0.0525, floor: 11_700 },
    { rate: 0.055, floor: 13_900 },
    { rate: 0.06, floor: 80_650 },
    { rate: 0.0685, floor: 215_400 },
    { rate: 0.0965, floor: 1_077_550 },
    { rate: 0.103, floor: 5_000_000 },
    { rate: 0.109, floor: 25_000_000 },
  ],

  'North Dakota': [
    { rate: 0.0, floor: 0 },
    { rate: 0.0195, floor: 48_475 },
    { rate: 0.025, floor: 244_825 },
  ],

  Ohio: [
    { rate: 0.0, floor: 0 },
    { rate: 0.0275, floor: 26_050 },
    { rate: 0.03125, floor: 100_000 },
  ],

  Oklahoma: [
    { rate: 0.0025, floor: 0 },
    { rate: 0.0075, floor: 1_000 },
    { rate: 0.0175, floor: 2_500 },
    { rate: 0.0275, floor: 3_750 },
    { rate: 0.0375, floor: 4_900 },
    { rate: 0.0475, floor: 7_200 },
  ],

  Oregon: [
    { rate: 0.0475, floor: 0 },
    { rate: 0.0675, floor: 4_400 },
    { rate: 0.0875, floor: 11_050 },
    { rate: 0.099, floor: 125_000 },
  ],

  'Rhode Island': [
    { rate: 0.0375, floor: 0 },
    { rate: 0.0475, floor: 79_900 },
    { rate: 0.0599, floor: 181_650 },
  ],

  'South Carolina': [
    { rate: 0.0, floor: 0 },
    { rate: 0.03, floor: 3_560 },
    { rate: 0.06, floor: 17_830 },
  ],

  Vermont: [
    { rate: 0.0, floor: 0 },
    { rate: 0.0335, floor: 3_825 },
    { rate: 0.066, floor: 53_225 },
    { rate: 0.076, floor: 123_525 },
    { rate: 0.0875, floor: 253_525 },
  ],

  Virginia: [
    { rate: 0.02, floor: 0 },
    { rate: 0.03, floor: 3_000 },
    { rate: 0.05, floor: 5_000 },
    { rate: 0.0575, floor: 17_000 },
  ],

  'West Virginia': [
    { rate: 0.0222, floor: 0 },
    { rate: 0.0296, floor: 10_000 },
    { rate: 0.0333, floor: 25_000 },
    { rate: 0.0444, floor: 40_000 },
    { rate: 0.0482, floor: 60_000 },
  ],

  Wisconsin: [
    { rate: 0.035, floor: 0 },
    { rate: 0.044, floor: 14_680 },
    { rate: 0.053, floor: 29_370 },
    { rate: 0.0765, floor: 323_290 },
  ],
}

// ─── State Standard Deductions (2025, single filer, approximate) ─────────────
// Sources: state DOR websites, Tax Foundation
// States that tax from AGI directly or have no standard deduction concept use 0.
// This is a simplification — real state deductions vary by filing status.

const STATE_STANDARD_DEDUCTIONS: Record<string, number> = {
  Alabama: 3_000,
  Arizona: 0, // AZ taxes from AGI
  Arkansas: 2_340,
  California: 5_540,
  Colorado: 15_750, // CO taxes from federal taxable income — use federal std deduction
  Connecticut: 0, // CT uses AGI
  Delaware: 3_250,
  'District of Columbia': 0, // DC uses AGI
  Georgia: 5_400,
  Hawaii: 2_200,
  Idaho: 15_750, // ID conforms to federal standard deduction
  Illinois: 0, // IL taxes from AGI (flat rate)
  Indiana: 0, // IN taxes from AGI (flat rate)
  Iowa: 15_750, // IA conforms to federal standard deduction
  Kansas: 3_500,
  Kentucky: 3_160,
  Louisiana: 0, // LA uses AGI
  Maine: 14_600, // ME caps at prior-year federal std deduction
  Maryland: 2_550,
  Massachusetts: 0, // MA taxes from AGI
  Michigan: 0, // MI taxes from AGI (flat rate)
  Minnesota: 14_575,
  Mississippi: 2_300,
  Missouri: 15_750, // MO conforms to federal standard deduction
  Montana: 5_540,
  Nebraska: 7_900,
  'New Jersey': 0, // NJ taxes from AGI
  'New Mexico': 0, // NM taxes from AGI
  'New York': 8_000,
  'North Carolina': 10_750, // NC starts from federal AGI then applies its own std deduction
  'North Dakota': 15_750, // ND uses federal taxable income — use federal std deduction
  Ohio: 0, // OH uses AGI
  Oklahoma: 6_350,
  Oregon: 2_745,
  Pennsylvania: 0, // PA taxes from AGI (flat rate)
  'Rhode Island': 10_550,
  'South Carolina': 15_750, // SC conforms to federal standard deduction
  Utah: 0, // UT taxes from AGI (flat rate with credit)
  Vermont: 7_000,
  Virginia: 8_000,
  'West Virginia': 0, // WV taxes from AGI
  Wisconsin: 12_760,
}

/**
 * Returns the approximate state standard deduction for a single filer.
 * Returns 0 for no-tax states, states that use AGI directly, and unknown states.
 */
export function getStateStandardDeduction(state: string): number {
  return STATE_STANDARD_DEDUCTIONS[state] ?? 0
}

// ─── ALL_STATES ───────────────────────────────────────────────────────────────

export const ALL_STATES: string[] = [...Object.keys(STATE_BRACKETS), ...NO_INCOME_TAX_STATES].sort((a, b) =>
  a.localeCompare(b),
)

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the brackets array for a given state, or null if the state has no
 * income tax (or is unknown).
 */
export function getStateTaxInfo(state: string): StateBracket[] | null {
  const brackets = STATE_BRACKETS[state]
  return brackets ?? null
}

/**
 * Calculates total state income tax owed for the given taxable income.
 * Returns 0 for no-tax states. Returns 0 for unknown states (graceful fallback).
 */
export function calculateStateTax(state: string, taxableIncome: number): number {
  if (NO_INCOME_TAX_STATES.includes(state)) return 0

  const brackets = STATE_BRACKETS[state]
  if (!brackets) return 0

  let tax = 0

  for (let i = 0; i < brackets.length; i++) {
    const { rate, floor } = brackets[i]
    const ceiling = i + 1 < brackets.length ? brackets[i + 1].floor : Infinity

    if (taxableIncome <= floor) break

    const taxableInBracket = Math.min(taxableIncome, ceiling) - floor
    tax += taxableInBracket * rate
  }

  return Math.round(tax * 100) / 100
}

/**
 * Returns the marginal tax rate that applies at a given income level for a
 * given state. Returns 0 for no-tax states or unknown states.
 */
export function getStateMarginalRate(state: string, taxableIncome: number): number {
  if (NO_INCOME_TAX_STATES.includes(state)) return 0

  const brackets = STATE_BRACKETS[state]
  if (!brackets) return 0

  let marginalRate = brackets[0].rate

  for (let i = 0; i < brackets.length; i++) {
    if (taxableIncome >= brackets[i].floor) {
      marginalRate = brackets[i].rate
    } else {
      break
    }
  }

  return marginalRate
}
