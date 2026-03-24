# Plan B: Home Office Cost Calculator — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Home Office Cost Calculator — an engine that computes the real monthly cost of home expenses (rent, internet, phone, electric) after business-use deductions, and a receipt-themed UI that shows each expense with a "% OFF" badge and crossed-out original price.

**Architecture:** A new `home-office-engine.ts` handles the calculations (simplified vs actual method, per-expense allocation, income cap). The UI in `HomeOfficeCalculator.tsx` follows the same receipt pattern as the existing write-off calculator. The page at `/calculators/home-office` uses `SharedProfile` and `useProfile` from Plan A. The engine is called with the tax profile + home office inputs, and returns per-expense savings using the existing `computeSavings` function.

**Tech Stack:** TypeScript, React 19, Next.js 16, Vitest

**Spec:** `docs/superpowers/specs/2026-03-24-multi-tool-site-design.md` (section: "Home Office Cost Calculator")
**Test runner:** `npx vitest run`
**Build check:** `npx next build`
**Lint check:** `npx eslint app components lib`
**Path alias:** `@/` maps to project root

---

## Chunk 1: Home Office Engine (Tasks 1–2)

---

### Task 1: Write tests for the home office engine

**Files:**
- Create: `lib/__tests__/home-office-engine.test.ts`

These tests define the engine's API before implementation. The engine should:
- Calculate business-use percentage from sqft
- Calculate simplified method deduction ($5/sqft, max 300 sqft, max $1,500/yr)
- Calculate actual method deduction (sum of business portions, capped at LLC net income)
- Compare simplified vs actual and recommend the better one
- Calculate per-expense tax savings using the existing tax engine
- Return per-expense breakdown with effective cost and discount %

- [ ] **Step 1: Create test file**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/__tests__/home-office-engine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Commit test file**

```bash
git add lib/__tests__/home-office-engine.test.ts
git commit -m "test: add home office engine tests"
```

---

### Task 2: Implement the home office engine

**Files:**
- Create: `lib/home-office-engine.ts`

- [ ] **Step 1: Create `lib/home-office-engine.ts`**

The engine exports types and four functions:
- `computeBusinessUsePct(officeSqft, homeSqft)` — returns percentage
- `computeSimplifiedDeduction(officeSqft)` — $5/sqft, max 300, max $1500
- `computeActualDeduction(expenses, sqftPct, llcNetIncome)` — sums business portions, caps at income
- `computeHomeOfficeSavings(profile, inputs)` — main function, returns full breakdown

The key insight: call `computeSavings(profile, totalAnnualDeduction)` from the existing tax engine to get the aggregate tax savings, then derive the effective discount rate and apply it proportionally to each expense.

```ts
import type { TaxProfile } from './tax-engine'
import { computeSavings } from './tax-engine'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface HomeOfficeExpense {
  name: string
  monthlyAmount: number
  /** Business-use percentage override. null = use sqft ratio. */
  businessUsePct: number | null
}

export interface HomeOfficeInputs {
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

export function computeHomeOfficeSavings(
  profile: TaxProfile,
  inputs: HomeOfficeInputs,
): HomeOfficeSavingsResult {
  const sqftPct = computeBusinessUsePct(inputs.officeSqft, inputs.homeSqft)
  const simplified = { annualDeduction: computeSimplifiedDeduction(inputs.officeSqft) }
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
  const capRatio = recommendActual && actual.capped && actual.uncappedTotal > 0
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
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run lib/__tests__/home-office-engine.test.ts`
Expected: All tests pass

- [ ] **Step 3: Run full validation**

Run: `npx eslint lib/home-office-engine.ts && npx vitest run`

- [ ] **Step 4: Format and commit**

```bash
npx prettier --write lib/home-office-engine.ts
git add lib/home-office-engine.ts lib/__tests__/home-office-engine.test.ts
git commit -m "feat: add home office deduction engine with simplified vs actual comparison"
```

---

## Chunk 2: Home Office Calculator UI (Tasks 3–4)

---

### Task 3: Create HomeOfficeCalculator component

**Files:**
- Create: `components/HomeOfficeCalculator.tsx`

This component follows the same receipt pattern as the existing Calculator. It renders:
1. SharedProfile (collapsible)
2. Home office inputs (sqft fields)
3. Expense inputs (rent, internet, phone, electric with editable business-use %)
4. Results: per-expense line items with "% OFF" badge, crossed-out price, and effective cost
5. Simplified vs actual comparison
6. Total monthly savings and annual projection

The component should use `useProfile` from `lib/use-profile.ts` and call `computeHomeOfficeSavings` from the engine.

**Important constraints:**
- Use existing CSS classes from `globals.css` (`.receipt`, `.receipt-header`, `.profile-section`, `.profile-row`, `.discount-badge`, `.effective-cost-row`, `.receipt-footer`, etc.)
- Follow the exact same visual patterns as `Calculator.tsx`
- The expense inputs should be editable with the same focus/blur formatting pattern as income fields
- Each expense has an editable business-use % field (small input next to the expense name)
- Expenses with `businessUsePct: null` default to the sqft ratio
- Internet and Phone default to 50%, Rent and Electric default to sqft ratio
- Helper text for rent: "For mortgages, enter monthly interest only (not principal)"
- Helper text for internet/phone: "IRS provides no specific percentage — use your reasonable estimate"
- Show simplified vs actual comparison section below the results
- Show "deduction capped at net income" warning if actual method is capped

The implementer should read `components/Calculator.tsx` and `components/SharedProfile.tsx` to match patterns, and read `app/globals.css` for available CSS classes.

**Optional expenses:** Beyond the four defaults (Rent, Internet, Phone, Electric), include Insurance, Water/Trash, and HOA as additional rows defaulting to $0. HOA should show helper text: "Not explicitly addressed by IRS — consult your CPA." All optional expenses default to sqft % for business use.

**Warnings to display:**
- If actual method is income-capped: "Your deduction is limited to your LLC net income of $X"
- Depreciation recapture note in the simplified vs actual comparison: "Note: Using the actual method may trigger depreciation recapture (taxed at 25%) when you sell your home. The simplified method avoids this."
- Exclusive-use disclaimer near the sqft inputs: "Your home office must be used regularly and exclusively for business to qualify for this deduction."

**SEO content, FAQ, JSON-LD schema, and educational deep-dive are deferred to Plan D.** This plan creates only the interactive calculator and bare page shell.

The component will be large — if it exceeds `max-lines-per-function: 150`, split into sub-components (e.g., `ExpenseInput`, `ExpenseResult`, `MethodComparison`) within the same file or as separate files.

- [ ] **Step 1: Create the component**

Create `components/HomeOfficeCalculator.tsx`. The component should:

1. Use `useProfile()` for the shared tax profile
2. Manage local state for: `officeSqft`, `homeSqft`, and an array of expenses (defaulting to Rent, Internet, Phone, Electric)
3. Call `computeHomeOfficeSavings(profile, inputs)` whenever inputs change
4. Render the receipt with:
   - Header: "Home Office Costs" + state/year subtitle
   - SharedProfile (collapsible)
   - Home office sqft section (office sqft input, home sqft input, calculated %)
   - Monthly expenses section (each expense as a profile-row with amount + business-use % inputs)
   - Results section (each expense as a line item with mini "% OFF" badge, effective cost, crossed-out original)
   - Total section with discount badge showing overall % off, "YOU PAY" with effective total and crossed-out original, monthly and annual savings
   - Simplified vs actual comparison section
   - Receipt footer

- [ ] **Step 2: Run lint, tests, and build**

```bash
npx prettier --write components/HomeOfficeCalculator.tsx
npx eslint components/HomeOfficeCalculator.tsx
npx vitest run && npx next build
```

- [ ] **Step 3: Commit**

```bash
git add components/HomeOfficeCalculator.tsx
git commit -m "feat: add HomeOfficeCalculator component with receipt-themed UI"
```

---

### Task 4: Create the home office page and update hub

**Files:**
- Create: `components/HomeOfficeLoader.tsx`
- Create: `app/calculators/home-office/page.tsx`
- Modify: `app/calculators/page.tsx` — remove `comingSoon` from home office link

- [ ] **Step 1: Create `components/HomeOfficeLoader.tsx`**

Follow the exact same pattern as `CalculatorLoader.tsx`:

```tsx
'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

function ReceiptSkeleton() {
  return (
    <div className="receipt" style={{ minHeight: '600px' }}>
      <div className="receipt-header">
        <h1>Home Office Costs</h1>
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

const HomeOfficeCalculator = dynamic(() => import('@/components/HomeOfficeCalculator'), {
  ssr: false,
  loading: () => <ReceiptSkeleton />,
})

export default function HomeOfficeLoader() {
  return (
    <ErrorBoundary>
      <HomeOfficeCalculator />
    </ErrorBoundary>
  )
}
```

- [ ] **Step 2: Create `app/calculators/home-office/page.tsx`**

```tsx
import type { Metadata } from 'next'
import HomeOfficeLoader from '@/components/HomeOfficeLoader'

export const metadata: Metadata = {
  title: 'Home Office Deduction Calculator 2025–2026 — See Your Real Monthly Costs',
  description:
    'See the real cost of your rent, internet, phone, and utilities after your home office tax deduction. Free calculator for W-2 employees with an LLC or side business.',
}

export default function HomeOfficePage() {
  return (
    <main className="page">
      <HomeOfficeLoader />
    </main>
  )
}
```

- [ ] **Step 3: Update hub page — make home office link active**

In `app/calculators/page.tsx`, find the home office tool entry and remove the `comingSoon: true` property:

```ts
  {
    href: '/calculators/home-office',
    title: 'Home Office Costs',
    description: 'See the real monthly cost of your rent, internet, and utilities after your home office deduction.',
    comingSoon: true,  // ← DELETE THIS LINE
  },
```

- [ ] **Step 4: Run full validation**

```bash
npx prettier --write components/HomeOfficeLoader.tsx app/calculators/home-office/page.tsx app/calculators/page.tsx
npm run validate
```

- [ ] **Step 5: Commit**

```bash
git add components/HomeOfficeLoader.tsx app/calculators/home-office/page.tsx app/calculators/page.tsx
git commit -m "feat: add home office calculator page at /calculators/home-office"
```

---

## Post-Implementation Verification

- [ ] `npm run validate` — all checks pass
- [ ] `/calculators/home-office` route generated in build
- [ ] Hub page shows home office link as active (not "coming soon")
- [ ] Home office calculator loads with skeleton, then shows full receipt
- [ ] SharedProfile works and persists across calculator pages
- [ ] Entering sqft values auto-calculates business-use %
- [ ] Each expense shows "% OFF" badge and effective cost
- [ ] Simplified vs actual comparison shows both methods
- [ ] Total savings section shows monthly and annual amounts
- [ ] Changing tax profile updates all results reactively
