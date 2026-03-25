# Hub Intro Copy & Navigation Home Link — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Condense the hub page intro to a tagline + two sentences, and add a Home tab and clickable titles so users can always navigate back to the hub.

**Architecture:** Three independent changes to existing files — no new files, no new components. The hub page (`app/calculators/page.tsx`) gets its intro rewritten in-place. The NavBar gets a new first tab. Four calculator/profile page components get their `<h1>` wrapped in a `<Link>`. A CSS rule handles the link-styled-as-heading.

**Tech Stack:** Next.js 16, React, CSS (globals.css)

**Spec:** `docs/superpowers/specs/2026-03-25-hub-intro-and-nav-design.md`

---

## Chunk 1: All Tasks

### Task 1: Add Home tab to NavBar

**Files:**
- Modify: `components/NavBar.tsx:6-11` (TABS array)

- [ ] **Step 1: Add the Home entry to the TABS array**

In `components/NavBar.tsx`, add `{ label: 'Home', href: '/calculators' }` as the first item in the `TABS` array. The existing active-state logic (`pathname === tab.href`) already handles exact matching, so the Home tab will highlight only on `/calculators` — not on sub-routes.

```tsx
const TABS = [
  { label: 'Home', href: '/calculators' },
  { label: 'Write-Off', href: '/calculators/write-off' },
  { label: 'Home Office', href: '/calculators/home-office' },
  { label: 'Quarterly', href: '/calculators/quarterly-estimates' },
  { label: 'Profile', href: '/calculators/profile' },
]
```

- [ ] **Step 2: Verify the dev server shows the new tab**

Run: `npm run dev`

Open any calculator page. Confirm "Home" appears as the first tab. Click it — should navigate to `/calculators`. Confirm it highlights when on the hub page and does not highlight on other pages.

- [ ] **Step 3: Commit**

```bash
git add components/NavBar.tsx
git commit -m "feat: add Home tab to NavBar linking to hub page"
```

---

### Task 2: Add clickable title CSS rule

**Files:**
- Modify: `app/globals.css:100-106` (`.receipt-header h1` section)

- [ ] **Step 1: Add a CSS rule for links inside the receipt-header h1**

In `app/globals.css`, add a rule immediately after the existing `.receipt-header h1` block (after line 106). This makes the `<Link>` wrapper invisible — it inherits the heading's color, has no underline, and only shows a pointer cursor on hover.

```css
.receipt-header h1 a {
  color: inherit;
  text-decoration: none;
}
```

No hover underline or color change — just the cursor change (which the browser provides by default for `<a>` tags).

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add receipt-header h1 link reset for clickable titles"
```

---

### Task 3: Wrap h1 in Link on all calculator/profile pages

**Files:**
- Modify: `components/Calculator.tsx:26`
- Modify: `components/HomeOfficeCalculator.tsx:73`
- Modify: `components/QuarterlyCalculator.tsx:177`
- Modify: `components/ProfilePage.tsx:175`

All four files follow the same pattern: add `import Link from 'next/link'` (if not already imported) and wrap the `<h1>` text in `<Link href="/calculators">`.

- [ ] **Step 1: Update Calculator.tsx**

`components/Calculator.tsx` — add the Link import and wrap the h1:

Add to imports:
```tsx
import Link from 'next/link'
```

Change line 26 from:
```tsx
<h1>Write-Off Calculator</h1>
```
to:
```tsx
<h1><Link href="/calculators">Write-Off Calculator</Link></h1>
```

- [ ] **Step 2: Update HomeOfficeCalculator.tsx**

`components/HomeOfficeCalculator.tsx` — add the import and wrap the h1:

Add to imports:
```tsx
import Link from 'next/link'
```

Change line 73 from:
```tsx
<h1>Home Office Costs</h1>
```
to:
```tsx
<h1><Link href="/calculators">Home Office Costs</Link></h1>
```

- [ ] **Step 3: Update QuarterlyCalculator.tsx**

`components/QuarterlyCalculator.tsx` — add the import and wrap the h1:

Add to imports:
```tsx
import Link from 'next/link'
```

Change line 177 from:
```tsx
<h1>Quarterly Estimates</h1>
```
to:
```tsx
<h1><Link href="/calculators">Quarterly Estimates</Link></h1>
```

- [ ] **Step 4: Update ProfilePage.tsx**

`components/ProfilePage.tsx` — add the import and wrap the h1:

Add to imports:
```tsx
import Link from 'next/link'
```

Change line 175 from:
```tsx
<h1>Your Tax Profile</h1>
```
to:
```tsx
<h1><Link href="/calculators">Your Tax Profile</Link></h1>
```

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev`

Visit each page (`/calculators/write-off`, `/calculators/home-office`, `/calculators/quarterly-estimates`, `/calculators/profile`). Confirm:
- The h1 looks exactly the same as before (no underline, same color)
- Hovering shows a pointer cursor
- Clicking navigates to `/calculators`

- [ ] **Step 6: Commit**

```bash
git add components/Calculator.tsx components/HomeOfficeCalculator.tsx components/QuarterlyCalculator.tsx components/ProfilePage.tsx
git commit -m "feat: make receipt-header titles clickable links to hub page"
```

---

### Task 4: Rewrite hub page intro copy

**Files:**
- Modify: `app/calculators/page.tsx:34-57`

- [ ] **Step 1: Add tagline to the receipt-header**

In `app/calculators/page.tsx`, inside the `receipt-header` div (after the subtitle on line 36), add a tagline line:

Change the receipt-header block from:
```tsx
<div className="receipt-header">
  <h1>Tax Calculators</h1>
  <div className="subtitle">For W-2 + LLC Owners</div>
</div>
```
to:
```tsx
<div className="receipt-header">
  <h1>Tax Calculators</h1>
  <div className="subtitle">For W-2 + LLC Owners</div>
  <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', lineHeight: '1.5' }}>
    See what business expenses actually cost you after tax savings.
  </div>
</div>
```

- [ ] **Step 2: Replace the three-paragraph landing message with two sentences**

Replace the entire `{/* Landing message */}` section (lines 39-57) — the `profile-section` div containing three `<p>` tags — with a shorter version:

```tsx
{/* Landing message */}
<div className="profile-section">
  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
    When you write off a business expense, you don&rsquo;t see the savings until you file your
    taxes. These calculators show you that discount now &mdash; like seeing the sale price before
    you buy.
  </div>
</div>
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`

Visit `/calculators`. Confirm:
- The tagline appears below "For W-2 + LLC Owners", smaller and muted
- The two-sentence description appears between the header and the tool links
- The old three paragraphs are gone
- The tool links and footer are unchanged

- [ ] **Step 4: Commit**

```bash
git add app/calculators/page.tsx
git commit -m "feat: condense hub intro to tagline + two-sentence description"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run the build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run existing tests**

Run: `npm test`

Expected: All existing tests pass (these are lib tests — no component tests exist, so nothing should break).

- [ ] **Step 3: Manual smoke test**

With `npm run dev` running, verify the full flow:
1. Visit `/` — redirects to `/calculators` (hub page)
2. Hub page shows tagline in header, two-sentence description, three tool links
3. "Home" tab is highlighted
4. Click "Write-Off" tab — navigates to calculator, Home tab is not highlighted
5. Click the "Write-Off Calculator" h1 title — navigates back to hub
6. Click "Home" tab — navigates back to hub, tab highlights
7. Repeat quick check for Home Office, Quarterly, and Profile pages
