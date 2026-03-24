# Plan C: Quarterly Estimated Tax Calculator — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Quarterly Estimated Tax Calculator — an engine that computes how much a W-2 + LLC owner should set aside each quarter to avoid underpayment penalties, and a receipt-themed UI showing the tax picture, quarterly payment amounts, and due dates.

**Architecture:** A new `quarterly-engine.ts` handles the calculations (safe harbor, W-2 withholding offset, due date lookup, W-4 increase strategy). The UI in `QuarterlyCalculator.tsx` follows the receipt pattern. The page at `/calculators/quarterly-estimates` uses `SharedProfile` and `useProfile`. The engine calls the existing `computeTaxLiability` to get total tax liability, then subtracts withholding.

**Tech Stack:** TypeScript, React 19, Next.js 16, Vitest

**Spec:** `docs/superpowers/specs/2026-03-24-multi-tool-site-design.md` (section: "Quarterly Estimated Tax Calculator")
**Test runner:** `npx vitest run`
**Build check:** `npx next build`
**Lint check:** `npx eslint app components lib`
**Path alias:** `@/` maps to project root

---

## Chunk 1: Quarterly Engine (Tasks 1–2)

---

### Task 1: Write tests for the quarterly engine

**Files:**
- Create: `lib/__tests__/quarterly-engine.test.ts`

- [ ] **Step 1: Create test file**

```ts
import { describe, it, expect } from 'vitest'
import {
  getQuarterlyDueDates,
  computeSafeHarbor,
  computeQuarterlyEstimates,
  QuarterlyInputs,
} from '../quarterly-engine'
import type { TaxProfile } from '../tax-engine'

const baseProfile: TaxProfile = {
  w2Income: 150_000,
  llcNetIncome: 80_000,
  filingStatus: 'single',
  taxYear: 2025,
  state: 'Arizona',
}

describe('getQuarterlyDueDates', () => {
  it('returns 4 due dates for 2025', () => {
    const dates = getQuarterlyDueDates(2025)
    expect(dates).toHaveLength(4)
  })

  it('2025 Q1 is April 15', () => {
    const dates = getQuarterlyDueDates(2025)
    expect(dates[0]).toEqual({ quarter: 'Q1', label: 'Apr 15, 2025', date: '2025-04-15' })
  })

  it('2025 Q2 is June 16 (June 15 is Sunday)', () => {
    const dates = getQuarterlyDueDates(2025)
    expect(dates[1]).toEqual({ quarter: 'Q2', label: 'Jun 16, 2025', date: '2025-06-16' })
  })

  it('2025 Q3 is September 16 (September 15 is Sunday)', () => {
    const dates = getQuarterlyDueDates(2025)
    expect(dates[2]).toEqual({ quarter: 'Q3', label: 'Sep 16, 2025', date: '2025-09-16' })
  })

  it('2025 Q4 is January 15, 2026', () => {
    const dates = getQuarterlyDueDates(2025)
    expect(dates[3]).toEqual({ quarter: 'Q4', label: 'Jan 15, 2026', date: '2026-01-15' })
  })

  it('returns 4 due dates for 2026', () => {
    const dates = getQuarterlyDueDates(2026)
    expect(dates).toHaveLength(4)
    expect(dates[0].quarter).toBe('Q1')
    expect(dates[3].quarter).toBe('Q4')
  })

  it('2026 Q2 is June 16 (June 15 is Sunday)', () => {
    const dates = getQuarterlyDueDates(2026)
    expect(dates[1]).toEqual({ quarter: 'Q2', label: 'Jun 16, 2026', date: '2026-06-16' })
  })
})

describe('computeSafeHarbor', () => {
  it('returns 100% of prior year when AGI <= $150K and prior < 90% current', () => {
    // prior=30K, current=50K, AGI=120K => prior=30K, 90% current=45K => lesser=30K
    const result = computeSafeHarbor(30_000, 50_000, 120_000)
    expect(result.safeHarborAmount).toBe(30_000)
    expect(result.method).toBe('100% prior year')
  })

  it('returns 110% of prior year when AGI > $150K and prior < 90% current', () => {
    // prior=40K, current=60K, AGI=200K => 110% prior=44K, 90% current=54K => lesser=44K
    const result = computeSafeHarbor(40_000, 60_000, 200_000)
    expect(result.safeHarborAmount).toBe(44_000)
    expect(result.method).toBe('110% prior year (AGI > $150K)')
  })

  it('returns 90% current year when lower than prior year', () => {
    // prior=50K, current=40K, AGI=120K => 100% prior=50K, 90% current=36K => lesser=36K
    const result = computeSafeHarbor(50_000, 40_000, 120_000)
    expect(result.safeHarborAmount).toBe(36_000)
    expect(result.method).toBe('90% current year')
  })

  it('uses $150K threshold exactly', () => {
    const atThreshold = computeSafeHarbor(30_000, 50_000, 150_000)
    expect(atThreshold.safeHarborAmount).toBe(30_000) // 100%, not 110%

    const aboveThreshold = computeSafeHarbor(30_000, 50_000, 150_001)
    expect(aboveThreshold.safeHarborAmount).toBe(33_000) // 110%
  })

  it('returns 0 for zero prior year tax when current is also 0', () => {
    const result = computeSafeHarbor(0, 0, 100_000)
    expect(result.safeHarborAmount).toBe(0)
  })
})

describe('computeQuarterlyEstimates', () => {
  const baseInputs: QuarterlyInputs = {
    annualWithholding: 28_500,
    priorYearTax: 45_000,
  }

  it('returns total tax liability from the tax engine', () => {
    const result = computeQuarterlyEstimates(baseProfile, baseInputs)
    expect(result.totalTaxLiability).toBeGreaterThan(40_000)
  })

  it('subtracts withholding from total liability', () => {
    const result = computeQuarterlyEstimates(baseProfile, baseInputs)
    expect(result.remainingLiability).toBe(result.totalTaxLiability - baseInputs.annualWithholding)
  })

  it('divides remaining by 4 for quarterly payment', () => {
    const result = computeQuarterlyEstimates(baseProfile, baseInputs)
    expect(result.quarterlyPayment).toBeCloseTo(result.remainingLiability / 4, 0)
  })

  it('returns due dates matching the tax year', () => {
    const result = computeQuarterlyEstimates(baseProfile, baseInputs)
    expect(result.dueDates).toHaveLength(4)
    expect(result.dueDates[0].quarter).toBe('Q1')
  })

  it('detects when no estimated payments needed (de minimis)', () => {
    const highWithholding: QuarterlyInputs = {
      annualWithholding: 60_000, // more than enough
      priorYearTax: 45_000,
      }
    const result = computeQuarterlyEstimates(baseProfile, highWithholding)
    expect(result.noPaymentNeeded).toBe(true)
    expect(result.noPaymentReason).toContain('less than $1,000')
  })

  it('computes safe harbor amount', () => {
    const result = computeQuarterlyEstimates(baseProfile, baseInputs)
    expect(result.safeHarbor.safeHarborAmount).toBeGreaterThan(0)
  })

  it('computes W-4 increase suggestion', () => {
    const result = computeQuarterlyEstimates(baseProfile, baseInputs)
    expect(result.w4Increase).toBeDefined()
    expect(result.w4Increase.annualIncrease).toBe(result.remainingLiability)
    expect(result.w4Increase.perPaycheck26).toBeCloseTo(result.remainingLiability / 26, 0)
    expect(result.w4Increase.perPaycheck24).toBeCloseTo(result.remainingLiability / 24, 0)
  })

  it('handles zero LLC income', () => {
    const zeroLLC: TaxProfile = { ...baseProfile, llcNetIncome: 0 }
    const result = computeQuarterlyEstimates(zeroLLC, baseInputs)
    expect(result.totalTaxLiability).toBeGreaterThan(0) // W-2 still has tax
  })

  it('remaining liability floors at 0 (no negative)', () => {
    const highWithholding: QuarterlyInputs = {
      annualWithholding: 200_000,
      priorYearTax: 45_000,
      }
    const result = computeQuarterlyEstimates(baseProfile, highWithholding)
    expect(result.remainingLiability).toBe(0)
    expect(result.quarterlyPayment).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/__tests__/quarterly-engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/quarterly-engine.test.ts
git commit -m "test: add quarterly estimated tax engine tests"
```

---

### Task 2: Implement the quarterly engine

**Files:**
- Create: `lib/quarterly-engine.ts`

- [ ] **Step 1: Create `lib/quarterly-engine.ts`**

```ts
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

export function computeQuarterlyEstimates(
  profile: TaxProfile,
  inputs: QuarterlyInputs,
): QuarterlyResult {
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
    ? `You owe less than $1,000 after withholding — no estimated payments required`
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
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run lib/__tests__/quarterly-engine.test.ts`
Expected: All tests pass

- [ ] **Step 3: Run full validation**

Run: `npx eslint lib/quarterly-engine.ts && npx vitest run`

- [ ] **Step 4: Format and commit**

```bash
npx prettier --write lib/quarterly-engine.ts lib/__tests__/quarterly-engine.test.ts
git add lib/quarterly-engine.ts lib/__tests__/quarterly-engine.test.ts
git commit -m "feat: add quarterly estimated tax engine with safe harbor and W-4 strategy"
```

---

## Chunk 2: Quarterly Calculator UI (Tasks 3–4)

---

### Task 3: Create QuarterlyCalculator component

**Files:**
- Create: `components/QuarterlyCalculator.tsx`

This component follows the receipt pattern. Read `components/Calculator.tsx` and `components/HomeOfficeCalculator.tsx` for the patterns to follow.

### Layout (top to bottom, inside a `.receipt` div)

1. **Header**: "Quarterly Estimates" + state/year subtitle
2. **SharedProfile**: collapsible
3. **Withholding & Prior Year section** (`.profile-section`):
   - Section label: "Your Withholding"
   - Annual W-2 withholding input (profile-row). Helper text below: "Check your pay stub for YTD federal withholding, or multiply per-paycheck amount by number of pay periods"
   - Prior year total tax input (profile-row). Helper text below: "Line 24 on your prior year Form 1040"
4. **Results section** (shown when withholding > 0 or LLC income > 0):
   - **If `noPaymentNeeded`**: Show a green "NO PAYMENTS NEEDED" badge with explanation
   - **If payments needed**:
     - Tax picture breakdown:
       - Total tax liability (from engine)
       - Minus W-2 withholding (green, negative)
       - = Remaining LLC portion (bold)
     - **Quarterly payment box** (amber/warning color, like the mockup):
       - "SET ASIDE EACH QUARTER" label
       - Large quarterly payment amount
       - Due dates listed below (Q1 through Q4 with dates)
     - Safe harbor method note: "Based on [method] — avoids underpayment penalty"
5. **W-4 Alternative tip** (`.profile-section`):
   - Section label: "Alternative: Increase Your W-4"
   - Explain: "Instead of quarterly payments, you can increase your W-2 withholding. The IRS treats withholding as paid evenly throughout the year, making this a simpler approach."
   - Show: "Add $X per paycheck (bi-weekly)" and "Add $X per paycheck (semi-monthly)"
6. **Receipt footer** (same as other calculators)

### Input handling
Same focus/blur formatting pattern as other calculators. Use `parseCurrencyInput` and display formatted values.

### Engine integration
```ts
const result = computeQuarterlyEstimates(profile, {
  annualWithholding,
  priorYearTax,
})
```

### Visual notes
- The quarterly payment box should use amber colors (#fff8e1 background, #f9a825 border, #e65100 text) — this is NOT a discount, it's an amount to pay
- The de minimis "no payment needed" case should use green (#15803d) similar to the discount badge
- The W-4 tip section should feel informational, not like a result

### ESLint constraints
Split into sub-components if needed to stay under 150 lines per function. Good splits:
- `TaxPictureBreakdown` — the liability/withholding/remaining calculation display
- `QuarterlyPaymentBox` — the amber box with payment amount and due dates
- `W4AlternativeTip` — the W-4 increase suggestion

- [ ] **Step 1: Create the component (and sub-components if needed)**

- [ ] **Step 2: Run lint, tests, and build**

```bash
npx prettier --write components/QuarterlyCalculator.tsx
npx eslint components/QuarterlyCalculator.tsx
npx vitest run && npx next build
```

- [ ] **Step 3: Commit**

```bash
git add components/QuarterlyCalculator.tsx
git commit -m "feat: add QuarterlyCalculator component with receipt-themed UI"
```

(Include any sub-component files)

---

### Task 4: Create the quarterly estimates page and update hub

**Files:**
- Create: `components/QuarterlyLoader.tsx`
- Create: `app/calculators/quarterly-estimates/page.tsx`
- Modify: `app/calculators/page.tsx` — remove `comingSoon` from quarterly link

- [ ] **Step 1: Create `components/QuarterlyLoader.tsx`**

Same pattern as `CalculatorLoader.tsx` and `HomeOfficeLoader.tsx`:

```tsx
'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

function ReceiptSkeleton() {
  return (
    <div className="receipt" style={{ minHeight: '600px' }}>
      <div className="receipt-header">
        <h1>Quarterly Estimates</h1>
        <div className="subtitle" style={{ color: '#ccc' }}>
          Loading...
        </div>
      </div>
      <div style={{ padding: '20px 0' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: '16px',
              background: '#eee',
              borderRadius: '3px',
              marginBottom: '12px',
              width: `${70 + (i % 3) * 10}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const QuarterlyCalculator = dynamic(() => import('@/components/QuarterlyCalculator'), {
  ssr: false,
  loading: () => <ReceiptSkeleton />,
})

export default function QuarterlyLoader() {
  return (
    <ErrorBoundary>
      <QuarterlyCalculator />
    </ErrorBoundary>
  )
}
```

- [ ] **Step 2: Create `app/calculators/quarterly-estimates/page.tsx`**

```tsx
import type { Metadata } from 'next'
import QuarterlyLoader from '@/components/QuarterlyLoader'

export const metadata: Metadata = {
  title: 'Quarterly Estimated Tax Calculator 2025–2026 — W-2 + Self-Employment',
  description:
    'Calculate how much to set aside each quarter when you have W-2 income and an LLC. Includes safe harbor rules and W-4 withholding strategy.',
}

export default function QuarterlyEstimatesPage() {
  return (
    <main className="page">
      <QuarterlyLoader />
    </main>
  )
}
```

- [ ] **Step 3: Update hub page — remove comingSoon from quarterly link**

In `app/calculators/page.tsx`, find the quarterly estimates entry and remove `comingSoon: true`.

- [ ] **Step 4: Validate**

```bash
npx prettier --write components/QuarterlyLoader.tsx app/calculators/quarterly-estimates/page.tsx app/calculators/page.tsx
npm run validate
```

- [ ] **Step 5: Commit**

```bash
git add components/QuarterlyLoader.tsx app/calculators/quarterly-estimates/page.tsx app/calculators/page.tsx
git commit -m "feat: add quarterly estimates calculator page at /calculators/quarterly-estimates"
```

---

## Post-Implementation Verification

- [ ] `npm run validate` — all checks pass
- [ ] `/calculators/quarterly-estimates` route generated
- [ ] Hub page shows all three calculators as active links (no "coming soon")
- [ ] Quarterly calculator loads with skeleton, then receipt
- [ ] SharedProfile works and persists across all three calculator pages
- [ ] Entering withholding and prior year tax shows quarterly payment breakdown
- [ ] Due dates show correct 2025 dates (including Q2 June 16)
- [ ] De minimis case shows "no payments needed" when withholding covers liability
- [ ] W-4 alternative tip shows per-paycheck increase amounts
- [ ] Safe harbor method is displayed
