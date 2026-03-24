# Multi-Tool Calculator Site — Design Spec

## Vision

A suite of tax calculators for W-2 employees who also run an LLC from home. Every tool uses the same receipt-themed UI and the same core insight: **show the real cost after tax savings, not the deduction amount**. Rent isn't "$2,500/month minus a deduction" — it's "$2,233/month. You get 10.7% off."

## Target Persona

Someone with a full-time W-2 job and a side business (LLC/sole prop) operated from home. They want to understand the financial impact of their business in terms of purchase decisions, not annual tax returns.

## Tools

### 1. Write-Off Calculator (exists at `/`)

Move to `/calculators/write-off`. No functional changes — just routing.

- **What it does:** Enter a one-time business purchase, see the real after-tax cost.
- **Target keywords:** "business write off calculator" (10–100/mo, Medium), "tax write off calculator" (100–1K/mo, Low), "business tax write off calculator" (10–100, Low)
- **Page title:** "Business Write-Off Calculator 2025–2026 — See Your Real Cost"

### 2. Home Office Cost Calculator (new at `/calculators/home-office`)

- **What it does:** Enter monthly home expenses (rent/mortgage, internet, phone, electric, etc.) and home office dimensions. See the real monthly cost of each expense after the business-use deduction — framed as "% OFF" with crossed-out original price.
- **Target keywords:** "home office deduction calculator" (100–1K/mo, Low, +900% surge), "home office deduction calculator 2025" (autocomplete), "home office deduction simplified vs actual"
- **Page title:** "Home Office Deduction Calculator 2025–2026 — See Your Real Monthly Costs"

#### Inputs (beyond shared profile)
- Office square footage
- Total home square footage (auto-calculates business-use %)
- Monthly expenses, each with an editable business-use percentage:
  - Rent or mortgage interest (defaults to sqft %). Label includes helper text: "For mortgages, enter monthly interest only (not principal). Check your lender statement."
  - Internet (defaults to 50%, with note: "IRS provides no specific percentage — use your reasonable estimate")
  - Phone/cell (defaults to 50%, same note)
  - Electric (defaults to sqft %)
  - Optional: insurance, water/trash, HOA fees (with caveat for HOA)

#### Outputs (receipt format)
- Each expense shown as a line item: name, business-use %, "X% OFF" badge, real cost with crossed-out original
- Total monthly cost with total savings
- Annual savings projection
- Simplified vs actual method comparison: show both results, highlight which saves more
- Note about depreciation recapture risk if using actual method (for homeowners)

#### IRS Rules Implemented (Pub 587, Form 8829)
- Business-use % = office sqft / total home sqft
- Rent: business % of rent payments
- Mortgage: business % of **interest only** (not principal)
- Utilities (electric, gas, water): business % of total
- Insurance: business % of premium
- Internet: user-defined % (no IRS rule, practitioner convention)
- Phone: user-defined % (first landline base rate not deductible per Pub 587, but cell phone business portion is)
- Simplified method: $5/sqft, max 300 sqft = $1,500/year max, no carryforward
- Actual method: deduction capped at business net income, with carryforward
- Deduction flows to Schedule C line 30

#### Edge Cases to Surface
- Simplified vs actual comparison with recommendation (engine runs both methods internally)
- Depreciation recapture warning for homeowners using actual method
- HOA fees: include with caveat ("not explicitly addressed by IRS — consult your CPA")
- Deduction limited to net business income — `home-office-engine.ts` must cap the deductible amount before passing to `computeSavings` (show warning if exceeded)
- Exclusive-use disclaimer in educational content: "Your home office must be used regularly and exclusively for business to qualify"
- State estimated taxes are out of scope (federal only)

### 3. Quarterly Estimated Tax Calculator (new at `/calculators/quarterly-estimates`)

- **What it does:** For someone with W-2 withholding + LLC income, calculate how much to set aside each quarter to avoid underpayment penalty.
- **Target keywords:** "quarterly estimated tax calculator" (1K–10K/mo, Low), "quarterly tax calculator" (1K–10K/mo, Low), "quarterly tax payment calculator" (100–1K, Low), "1099 quarterly tax calculator" (100–1K, Medium)
- **Page title:** "Quarterly Estimated Tax Calculator 2025–2026 — W-2 + Self-Employment"

#### Inputs (beyond shared profile)
- Annual W-2 withholding — single field for total annual amount. Helper text: "Check your most recent pay stub for YTD federal withholding, or multiply per-paycheck withholding by number of pay periods."
- Prior year total tax liability (for safe harbor) — helper text: "Line 24 on your prior year Form 1040"
- Option: "First year with LLC income" checkbox (uses prior year W-2-only liability)

#### Outputs (receipt format)
- Total estimated tax liability (from existing tax engine)
- Minus W-2 withholding already covers
- = Remaining LLC tax obligation (home office and other deductions are already reflected in the LLC net income entered in the shared profile — users should enter their net income after expenses)
- ÷ 4 = quarterly payment amount
- Due dates for current tax year (with weekend adjustments)
- Safe harbor method used and explanation

#### Additional Features
- "Increase your W-4 instead" tip: explain that increasing W-2 withholding is treated as paid evenly throughout the year (IRC §6654(g)), making it a catch-up strategy. Show the per-paycheck increase needed.
- Safe harbor calculation: 100% of prior year (110% if AGI > $150K)
- Show whether $1,000 de minimis exception applies (no payments needed)

#### IRS Rules Implemented (Pub 505, Form 1040-ES)
- Must pay if expect to owe ≥ $1,000 after withholding
- Safe harbor: lesser of 90% current year OR 100%/110% prior year
- W-2 withholding counts toward obligation
- Due dates: Apr 15, Jun 15, Sep 15, Jan 15 (adjusted for weekends/holidays)
- Due date adjustments: hardcoded lookup table for 2025 and 2026 (e.g., 2025 Q2 = June 16 because June 15 is Sunday). Not algorithmic — just a data table matching the tax year field.
- Underpayment penalty: 7% annual interest, per-quarter
- W-4 withholding treated as paid evenly throughout year
- State estimated taxes: out of scope (federal only)

## Site Architecture

### Routing
```
/                           → redirect to /calculators (via next.config.ts redirects array)
/calculators                → hub page (links to all three tools)
/calculators/write-off      → existing calculator, moved here
/calculators/home-office    → new home office cost calculator
/calculators/quarterly-estimates → new quarterly estimated tax calculator
```

Each calculator page uses `dynamic(() => import(...), { ssr: false })` for the interactive calculator component (preserving the existing pattern from `CalculatorLoader`), while the page shell, educational content, H1, and FAQ are server-rendered for SEO.

### Shared Tax Profile
- Collapsible section at top of each calculator page
- Auto-collapses when profile has non-zero income values (either W-2 or LLC > 0), shows one-line summary (e.g., "$150K W-2 · $80K LLC · Single · AZ · 2025")
- Persisted in localStorage under key `'writeoff-calc-profile'` (existing key, shared across all tools)
- Fields: W-2 income, LLC net income, filing status, state, tax year
- Replaces existing `components/TaxProfile.tsx` (which is deleted)
- Assumes single-member LLC taxed as sole proprietorship (Schedule C). S-corp and partnership elections are out of scope.

### Hub Page (`/calculators`)
- Links to all three calculators with brief descriptions
- No interactive calculator on this page — just navigation
- Target keywords: "tax calculator for W-2 and side business", "LLC owner tax tools"

### Per-Calculator Page Structure (SEO)
Each calculator page follows the pattern from NerdWallet/SmartAsset research:
1. H1 title (keyword-rich, includes year)
2. Brief intro (1–2 sentences)
3. The interactive calculator tool (above the fold)
4. "How to Use This Calculator" section
5. "Understanding Your Results" section
6. Educational deep-dive content (1,000–1,500 words covering the tax rules, common mistakes, examples)
7. FAQ section with `FAQPage` schema markup
8. Internal links to the other two calculators
9. Footer disclaimers

### SEO Requirements
- Server-side rendering for all content (Next.js SSR/SSG — calculator is client-side interactive but page shell and educational content must be in initial HTML)
- `FAQPage` JSON-LD schema on each calculator page
- `WebApplication` schema for each calculator
- Sitemap generation
- Meta titles include year (2025–2026)
- Canonical URLs
- Open Graph tags for social sharing

## Visual Design

All three tools use the existing receipt theme:
- Off-white receipt paper (#faf9f6) on dark background (#0a0a0a)
- JetBrains Mono monospace font
- Dashed borders between sections
- Torn-edge bottom effect
- Green (#15803d) for savings/discounts
- "% OFF" badge + "You Pay / ~~Original~~" pattern for write-off and home office tools
- Amber (#f9a825) for quarterly payment amounts (different framing — not a discount)
- Max width 480px, centered

## Technical Architecture

### Shared Code
- `lib/tax-engine.ts` — existing, powers all three calculators
- `lib/tax-data.ts` — existing federal bracket data
- `lib/state-tax-data.ts` — existing state data (already includes state standard deductions)
- `lib/format.ts` — existing formatting utilities
- `lib/w2-equivalent.ts` — existing W2 pre-tax equivalent

### New Code
- `lib/home-office-engine.ts` — home office deduction calculations (simplified vs actual, per-expense allocation)
- `lib/quarterly-engine.ts` — quarterly estimated tax calculations (safe harbor, W-2 withholding offset, due dates)
- `components/SharedProfile.tsx` — extracted from current Calculator, collapsible, shared across tools
- `components/HomeOfficeCalculator.tsx` — home office tool UI
- `components/QuarterlyCalculator.tsx` — quarterly estimates tool UI
- `app/calculators/page.tsx` — hub page
- `app/calculators/write-off/page.tsx` — existing calculator at new route
- `app/calculators/home-office/page.tsx` — home office page with educational content
- `app/calculators/quarterly-estimates/page.tsx` — quarterly page with educational content

### Data Flow
1. User fills out shared tax profile on any calculator page
2. Profile saved to localStorage under shared key
3. Each calculator reads profile from localStorage on mount
4. Calculator-specific inputs (expenses, withholding, etc.) are local to that page
5. Each calculator calls the appropriate engine function with the shared profile + local inputs
6. Results rendered in receipt format

## Assumptions and Limitations
- **Single-member LLC taxed as sole proprietorship** (Schedule C). S-corp elections and partnerships are out of scope.
- **State tax brackets are single-filer only.** MFJ/MFS/HOH state calculations will be approximate. This is a pre-existing limitation documented in `state-tax-data.ts`.
- **State estimated taxes are out of scope.** Only federal quarterly payments are calculated.
- **2025 and 2026 tax year data are both complete** in the existing `tax-data.ts` and `state-tax-data.ts`.

## What This Spec Does NOT Cover
- Domain name selection (deferred)
- Blog/content marketing beyond on-page educational content
- User accounts or server-side storage
- Mobile app
- State-specific calculator pages (future programmatic SEO opportunity)
- Profession-specific calculator pages (future)
- Cross-calculator data sharing (each calculator's local inputs are independent; the quarterly tool does not auto-import home office deductions)
