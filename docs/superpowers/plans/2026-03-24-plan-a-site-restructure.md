# Plan A: Site Restructure — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the single-page write-off calculator into a multi-tool site with shared routing, a collapsible tax profile component, and a hub page — laying the foundation for the home office and quarterly calculators.

**Architecture:** Extract the profile logic from `Calculator.tsx` into a reusable `SharedProfile.tsx` with collapsible behavior. Move the existing calculator to `/calculators/write-off`. Add a hub page at `/calculators`. Redirect `/` to `/calculators`. Each page uses `dynamic()` with `ssr: false` for the interactive calculator while server-rendering the page shell.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest

**Spec:** `docs/superpowers/specs/2026-03-24-multi-tool-site-design.md`
**Test runner:** `npx vitest run`
**Build check:** `npx next build`
**Lint check:** `npx eslint app components lib`
**Path alias:** `@/` maps to project root

---

## Chunk 1: SharedProfile extraction (Tasks 1–2)

---

### Task 1: Extract profile persistence into a shared hook

**Files:**
- Create: `lib/use-profile.ts`
- Create: `lib/__tests__/use-profile.test.ts` (optional — hook is thin, tested indirectly)

The profile load/save logic currently lives inside `Calculator.tsx` (lines 12–41, 44–62). Extract it into a custom hook `useProfile()` that any calculator page can use.

- [ ] **Step 1: Create `lib/use-profile.ts`**

```ts
'use client'

import { useState, useEffect } from 'react'
import type { TaxProfile } from '@/lib/tax-engine'

const STORAGE_KEY = 'writeoff-calc-profile'

const DEFAULT_PROFILE: TaxProfile = {
  w2Income: 0,
  llcNetIncome: 0,
  filingStatus: 'single',
  taxYear: 2025,
  state: 'Arizona',
}

function loadProfile(): TaxProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_PROFILE
    const parsed = JSON.parse(stored)
    if (
      typeof parsed.w2Income === 'number' &&
      typeof parsed.llcNetIncome === 'number' &&
      ['single', 'mfj', 'mfs', 'hoh'].includes(parsed.filingStatus) &&
      [2025, 2026].includes(parsed.taxYear) &&
      typeof parsed.state === 'string'
    ) {
      return parsed as TaxProfile
    }
    return DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<TaxProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProfile(loadProfile())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore write errors
    }
  }, [profile, mounted])

  return { profile, setProfile, mounted }
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build`

- [ ] **Step 3: Commit**

```bash
git add lib/use-profile.ts
git commit -m "refactor: extract profile persistence into useProfile hook"
```

---

### Task 2: Create SharedProfile component with collapsible behavior

**Files:**
- Create: `components/SharedProfile.tsx`
- Modify: `components/Calculator.tsx` — use `SharedProfile` instead of `TaxProfileComponent`, remove profile logic
- Delete: `components/TaxProfile.tsx` — replaced by SharedProfile

The new `SharedProfile` component wraps the existing profile form fields with collapsible behavior: when the profile has non-zero income (W-2 or LLC > 0), it shows a one-line summary and collapses the form. Users can click to expand/edit.

- [ ] **Step 1: Create `components/SharedProfile.tsx`**

```tsx
'use client'

import { useState } from 'react'
import type { TaxProfile } from '@/lib/tax-engine'
import { ALL_STATES, STATE_WARNINGS } from '@/lib/state-tax-data'
import { parseCurrencyInput } from '@/lib/format'

interface SharedProfileProps {
  profile: TaxProfile
  onChange: (profile: TaxProfile) => void
}

function formatForDisplay(amount: number): string {
  const abs = Math.abs(amount)
  const whole = Math.round(abs)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = `$${whole}`
  return amount < 0 ? `-${formatted}` : formatted
}

const FILING_STATUS_LABELS: Record<string, string> = {
  single: 'Single',
  mfj: 'MFJ',
  mfs: 'MFS',
  hoh: 'HoH',
}

function ProfileSummary({ profile }: { profile: TaxProfile }) {
  const parts: string[] = []
  if (profile.w2Income > 0) parts.push(`${formatForDisplay(profile.w2Income)} W-2`)
  if (profile.llcNetIncome > 0) parts.push(`${formatForDisplay(profile.llcNetIncome)} LLC`)
  parts.push(FILING_STATUS_LABELS[profile.filingStatus] || profile.filingStatus)
  parts.push(profile.state)
  parts.push(String(profile.taxYear))
  return <span>{parts.join(' · ')}</span>
}

export default function SharedProfile({ profile, onChange }: SharedProfileProps) {
  const hasFilled = profile.w2Income > 0 || profile.llcNetIncome > 0
  const [expanded, setExpanded] = useState(!hasFilled)
  const [w2Display, setW2Display] = useState(() => formatForDisplay(profile.w2Income))
  const [llcDisplay, setLlcDisplay] = useState(() => formatForDisplay(profile.llcNetIncome))

  const stateWarning = STATE_WARNINGS[profile.state]

  function handleW2Focus() {
    setW2Display(profile.w2Income === 0 ? '' : String(profile.w2Income))
  }

  function handleW2Blur(e: React.FocusEvent<HTMLInputElement>) {
    const value = parseCurrencyInput(e.target.value)
    const newProfile = { ...profile, w2Income: isNaN(value) ? 0 : value }
    onChange(newProfile)
    setW2Display(formatForDisplay(newProfile.w2Income))
  }

  function handleW2Change(e: React.ChangeEvent<HTMLInputElement>) {
    setW2Display(e.target.value)
  }

  function handleLlcFocus() {
    setLlcDisplay(profile.llcNetIncome === 0 ? '' : String(profile.llcNetIncome))
  }

  function handleLlcBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = parseCurrencyInput(e.target.value)
    const newProfile = { ...profile, llcNetIncome: isNaN(value) ? 0 : value }
    onChange(newProfile)
    setLlcDisplay(formatForDisplay(newProfile.llcNetIncome))
  }

  function handleLlcChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLlcDisplay(e.target.value)
  }

  if (!expanded && hasFilled) {
    return (
      <div className="profile-section">
        <button
          className="breakdown-toggle"
          style={{ borderBottom: 'none', marginBottom: 0, padding: '8px 0' }}
          onClick={() => setExpanded(true)}
        >
          <span className="section-label" style={{ marginBottom: 0 }}>Your Tax Profile</span>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
            <ProfileSummary profile={profile} />
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="profile-section">
      <div
        className="section-label"
        style={{ cursor: hasFilled ? 'pointer' : 'default' }}
        onClick={() => hasFilled && setExpanded(false)}
      >
        Your Tax Profile {hasFilled && '▾'}
      </div>

      <div className="profile-row">
        <span className="label">W-2 Income</span>
        <input
          type="text"
          inputMode="numeric"
          value={w2Display}
          onFocus={handleW2Focus}
          onBlur={handleW2Blur}
          onChange={handleW2Change}
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
        Sets your tax bracket and affects SE tax on LLC income — both change your write-off savings
      </div>

      <div className="profile-row">
        <span className="label">LLC Net Income</span>
        <input
          type="text"
          inputMode="numeric"
          value={llcDisplay}
          onFocus={handleLlcFocus}
          onBlur={handleLlcBlur}
          onChange={handleLlcChange}
        />
      </div>

      <div className="profile-row">
        <span className="label">Filing Status</span>
        <select
          value={profile.filingStatus}
          onChange={(e) =>
            onChange({ ...profile, filingStatus: e.target.value as TaxProfile['filingStatus'] })
          }
        >
          <option value="single">Single</option>
          <option value="mfj">Married Filing Jointly</option>
          <option value="mfs">Married Filing Separately</option>
          <option value="hoh">Head of Household</option>
        </select>
      </div>

      <div className="profile-row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <span className="label" style={{ paddingTop: '2px' }}>State</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <select value={profile.state} onChange={(e) => onChange({ ...profile, state: e.target.value })}>
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {stateWarning && (
            <span style={{ fontSize: '10px', color: '#999', marginTop: '4px', maxWidth: '200px', textAlign: 'right', lineHeight: '1.4' }}>
              {stateWarning}
            </span>
          )}
        </div>
      </div>

      <div className="profile-row">
        <span className="label">Tax Year</span>
        <select
          value={profile.taxYear}
          onChange={(e) => onChange({ ...profile, taxYear: Number(e.target.value) as TaxProfile['taxYear'] })}
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `components/Calculator.tsx` to use SharedProfile and useProfile**

Replace the profile-related imports and logic. The new Calculator should:

1. Import `useProfile` from `@/lib/use-profile`
2. Import `SharedProfile` from `@/components/SharedProfile`
3. Remove the `STORAGE_KEY`, `DEFAULT_PROFILE`, `loadProfile` constants and the two `useEffect` hooks
4. Replace `TaxProfileComponent` with `SharedProfile`
5. Remove the `mounted` state (it's in the hook now)

The component becomes:

```tsx
'use client'

import { useState } from 'react'
import { computeTaxLiability, computeSavings, SavingsBreakdown, TaxResult } from '@/lib/tax-engine'
import { useProfile } from '@/lib/use-profile'
import SharedProfile from '@/components/SharedProfile'
import RatesSummary from '@/components/RatesSummary'
import PurchaseInput from '@/components/PurchaseInput'
import ResultHero from '@/components/ResultHero'
import Breakdown from '@/components/Breakdown'
import QuickCompare from '@/components/QuickCompare'

export default function Calculator() {
  const { profile, setProfile } = useProfile()
  const [expenseAmount, setExpenseAmount] = useState<number>(0)

  const baseline: TaxResult = computeTaxLiability(profile)
  const breakdown: SavingsBreakdown | null = expenseAmount > 0 ? computeSavings(profile, expenseAmount) : null

  return (
    <div className="receipt">
      <div className="receipt-header">
        <h1>Write-Off Calculator</h1>
        <div className="subtitle">
          {profile.state} · {profile.taxYear}
        </div>
      </div>

      <SharedProfile profile={profile} onChange={setProfile} />
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
  )
}
```

- [ ] **Step 3: Delete `components/TaxProfile.tsx`**

```bash
rm components/TaxProfile.tsx
```

- [ ] **Step 4: Run tests, lint, and build**

```bash
npx vitest run && npx eslint app components lib && npx next build
```

- [ ] **Step 5: Commit**

```bash
git add lib/use-profile.ts components/SharedProfile.tsx components/Calculator.tsx
git rm components/TaxProfile.tsx
git commit -m "refactor: extract SharedProfile with collapsible behavior and useProfile hook"
```

---

## Chunk 2: Routing restructure (Tasks 3–5)

---

### Task 3: Move existing calculator to `/calculators/write-off`

**Files:**
- Create: `app/calculators/write-off/page.tsx`
- Modify: `components/CalculatorLoader.tsx` — keep as-is (reused)

- [ ] **Step 1: Create `app/calculators/write-off/page.tsx`**

```tsx
import type { Metadata } from 'next'
import CalculatorLoader from '@/components/CalculatorLoader'

export const metadata: Metadata = {
  title: 'Business Write-Off Calculator 2025–2026 — See Your Real Cost',
  description:
    'Enter a business purchase and see what it actually costs after tax write-offs. Free calculator for W-2 employees with an LLC or side business.',
}

export default function WriteOffPage() {
  return (
    <main className="page">
      <CalculatorLoader />
    </main>
  )
}
```

- [ ] **Step 2: Verify the new route works**

Run: `npx next build`
Expected: Build succeeds, `/calculators/write-off` route is generated.

- [ ] **Step 3: Commit**

```bash
git add app/calculators/write-off/page.tsx
git commit -m "feat: add /calculators/write-off route for existing calculator"
```

---

### Task 4: Create hub page at `/calculators`

**Files:**
- Create: `app/calculators/page.tsx`
- Create: `app/calculators/layout.tsx`

- [ ] **Step 1: Create `app/calculators/layout.tsx`**

A simple layout that wraps all calculator pages:

```tsx
export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 2: Create `app/calculators/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tax Calculators for W-2 + LLC Owners — 2025–2026',
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
}

const tools = [
  {
    href: '/calculators/write-off',
    title: 'Write-Off Calculator',
    description: 'Enter a business purchase and see what it actually costs you after tax savings.',
  },
  {
    href: '/calculators/home-office',
    title: 'Home Office Costs',
    description: 'See the real monthly cost of your rent, internet, and utilities after your home office deduction.',
    comingSoon: true,
  },
  {
    href: '/calculators/quarterly-estimates',
    title: 'Quarterly Estimates',
    description: 'Calculate how much to set aside each quarter when you have W-2 income and an LLC.',
    comingSoon: true,
  },
]

export default function CalculatorsHub() {
  return (
    <main className="page">
      <div className="receipt">
        <div className="receipt-header">
          <h1>Tax Calculators</h1>
          <div className="subtitle">For W-2 + LLC Owners</div>
        </div>

        {/* Landing message */}
        <div className="profile-section">
          <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '12px' }}>
              When you buy a $2,000 laptop for your business, you pay $2,000 today. Months later, at tax time,
              you &ldquo;write it off&rdquo; and get some of that money back. But how much? 30%? 40%? It depends on
              your tax bracket, your state, your self-employment tax &mdash; and nobody does that math at checkout.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Your tax rate is a discount on every business expense. A 34% marginal rate means everything you buy
              for your business is permanently 34% off. Your rent, your internet, your phone &mdash; all discounted.
              You just don&rsquo;t see it on the receipt.
            </p>
            <p>
              These calculators show you the real price &mdash; what things{' '}
              <em>actually</em> cost you after the write-off. Not at tax time. Right now, at the moment
              you&rsquo;re deciding whether to buy.
            </p>
          </div>
        </div>

        {/* Tool links */}
        <div style={{ padding: '0' }}>
          {tools.map((tool) => (
            <div key={tool.href} className="profile-section">
              {tool.comingSoon ? (
                <div style={{ opacity: 0.5 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    {tool.title}
                    <span style={{ fontSize: '10px', color: '#888', marginLeft: '8px', letterSpacing: '1px' }}>
                      COMING SOON
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{tool.description}</div>
                </div>
              ) : (
                <Link href={tool.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#1a1a1a' }}>
                    {tool.title} →
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{tool.description}</div>
                </Link>
              )}
            </div>
          ))}
        </div>

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
    </main>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build`

- [ ] **Step 4: Commit**

```bash
git add app/calculators/page.tsx app/calculators/layout.tsx
git commit -m "feat: add calculator hub page at /calculators"
```

---

### Task 5: Redirect `/` to `/calculators` and update root layout

**Files:**
- Modify: `next.config.ts` — add redirect
- Modify: `app/page.tsx` — replace with redirect
- Modify: `app/layout.tsx` — update default metadata

- [ ] **Step 1: Update `next.config.ts` with redirect**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/calculators',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 2: Update `app/page.tsx`**

Replace contents with a simple redirect fallback (the `next.config.ts` redirect handles the actual redirect, but this catches edge cases):

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/calculators')
}
```

- [ ] **Step 3: Update root layout metadata**

In `app/layout.tsx`, replace the entire existing `metadata` const (lines 15–18) with this site-wide metadata:

```ts
export const metadata: Metadata = {
  title: {
    default: 'Tax Calculators for W-2 + LLC Owners',
    template: '%s | Tax Calculators',
  },
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
}
```

- [ ] **Step 4: Run full validation**

```bash
npx vitest run && npx eslint app components lib && npx next build
```

- [ ] **Step 5: Commit**

```bash
git add next.config.ts app/page.tsx app/layout.tsx
git commit -m "feat: redirect / to /calculators and update site metadata"
```

---

## Post-Implementation Verification

- [ ] `npx vitest run` — all tests pass
- [ ] `npx next build` — build succeeds
- [ ] Routes generated: `/calculators`, `/calculators/write-off`
- [ ] `/` redirects to `/calculators`
- [ ] Hub page shows three tools (write-off active, home office + quarterly as "coming soon")
- [ ] Write-off calculator works at new route with collapsible SharedProfile
- [ ] Profile data persists in localStorage across page navigation
- [ ] Profile collapses to one-line summary when filled out
