# SEO Infrastructure & Social Sharing — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OpenGraph/Twitter social sharing, sitemap, robots.txt, JSON-LD structured data, and canonical URLs so the site is discoverable by search engines and looks great when shared.

**Architecture:** A shared site config constant holds the base URL (used by sitemap, robots, and JSON-LD). The root layout gets `metadataBase` and default OG/Twitter fields. Each page gets OG overrides, a canonical URL, a JSON-LD script tag, and a dynamic OG image generated via `opengraph-image.tsx` using the `ImageResponse` API with the JetBrains Mono font.

**Tech Stack:** Next.js 16 Metadata API, `next/og` ImageResponse, Satori (JSX-to-image), JetBrains Mono TTF

**Spec:** `docs/superpowers/specs/2026-03-25-seo-infrastructure-design.md`

---

## Chunk 1: Foundation + Metadata + Sitemap/Robots

### Task 1: Create shared site config constant

**Files:**
- Create: `lib/site-config.ts`

The base URL is used in sitemap, robots.txt, and JSON-LD. Rather than hardcoding it in three places, extract it to one constant. When a custom domain is connected, only this file and `metadataBase` in `app/layout.tsx` need to change.

- [ ] **Step 1: Create `lib/site-config.ts`**

```ts
export const SITE_URL = 'https://writeoff-calc.vercel.app'
```

- [ ] **Step 2: Commit**

```bash
git add lib/site-config.ts
git commit -m "feat: add shared site URL constant for SEO infrastructure"
```

---

### Task 2: Add metadataBase and default OG/Twitter to root layout

**Files:**
- Modify: `app/layout.tsx:15-22`

- [ ] **Step 1: Add metadataBase, openGraph defaults, and twitter defaults**

In `app/layout.tsx`, expand the existing `metadata` export. Add `metadataBase`, `openGraph`, and `twitter` fields alongside the existing `title` and `description`.

Change the metadata export from:

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

to:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://writeoff-calc.vercel.app'),
  title: {
    default: 'Tax Calculators for W-2 + LLC Owners',
    template: '%s | Tax Calculators',
  },
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Tax Calculators for W-2 + LLC Owners',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds. The `metadataBase` and OG defaults are now active.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add metadataBase and default OG/Twitter metadata to root layout"
```

---

### Task 3: Add OG metadata, canonical URLs, and JSON-LD to hub page

**Files:**
- Modify: `app/calculators/page.tsx:1-9,29-77`

The hub page is a server component, so JSON-LD goes directly in the JSX return. Note: `dangerouslySetInnerHTML` is used here with hardcoded strings only (no user input) — this is the standard Next.js pattern for structured data injection.

- [ ] **Step 1: Add SITE_URL import and expand metadata**

In `app/calculators/page.tsx`, add the import for `SITE_URL` and expand the metadata export to include OpenGraph overrides and a canonical URL.

Add import at the top (after existing imports):

```ts
import { SITE_URL } from '@/lib/site-config'
```

Change the metadata export from:

```ts
export const metadata: Metadata = {
  title: 'Tax Calculators for W-2 + LLC Owners — 2025–2026',
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
}
```

to:

```ts
export const metadata: Metadata = {
  title: 'Tax Calculators for W-2 + LLC Owners — 2025–2026',
  description:
    'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
  alternates: { canonical: '/calculators' },
  openGraph: {
    title: 'That $2,000 laptop? It actually costs $1,320.',
    description:
      'See the real price of business expenses after write-offs. Free tax calculators for W-2 employees with an LLC.',
  },
}
```

- [ ] **Step 2: Add JSON-LD script tag**

In the same file, add a JSON-LD `<script>` tag inside the `CalculatorsHub` component, just before the closing `</main>` tag. All values are hardcoded constants — no user input is involved.

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Tax Calculators for W-2 + LLC Owners',
      description:
        'Free tax calculators for W-2 employees with a side business. See the real cost of write-offs, home office deductions, and quarterly estimated taxes.',
      url: `${SITE_URL}/calculators`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      browserRequirements: 'Requires JavaScript',
    }),
  }}
/>
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/calculators/page.tsx
git commit -m "feat: add OG metadata, canonical URL, and JSON-LD to hub page"
```

---

### Task 4: Add OG metadata, canonical URLs, and JSON-LD to calculator pages

**Files:**
- Modify: `app/calculators/write-off/page.tsx`
- Modify: `app/calculators/home-office/page.tsx`
- Modify: `app/calculators/quarterly-estimates/page.tsx`
- Modify: `app/calculators/profile/page.tsx`

All four pages follow the same pattern: add `SITE_URL` import, expand metadata with OG overrides and canonical, add JSON-LD script. All JSON-LD values are hardcoded constants — no user input.

- [ ] **Step 1: Update write-off page**

In `app/calculators/write-off/page.tsx`, add the import:

```ts
import { SITE_URL } from '@/lib/site-config'
```

Change the metadata export from:

```ts
export const metadata: Metadata = {
  title: 'Business Write-Off Calculator 2025–2026 — See Your Real Cost',
  description:
    'Enter a business purchase and see what it actually costs after tax write-offs. Free calculator for W-2 employees with an LLC or side business.',
}
```

to:

```ts
export const metadata: Metadata = {
  title: 'Business Write-Off Calculator 2025–2026 — See Your Real Cost',
  description:
    'Enter a business purchase and see what it actually costs after tax write-offs. Free calculator for W-2 employees with an LLC or side business.',
  alternates: { canonical: '/calculators/write-off' },
  openGraph: {
    title: 'See What Business Expenses Actually Cost You',
    description:
      'Enter any purchase and see the real price after your tax write-off. Built for W-2 employees with a side business.',
  },
}
```

Add JSON-LD before `</main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Business Write-Off Calculator',
      description:
        'Enter a business purchase and see what it actually costs after tax write-offs.',
      url: `${SITE_URL}/calculators/write-off`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      browserRequirements: 'Requires JavaScript',
    }),
  }}
/>
```

- [ ] **Step 2: Update home office page**

In `app/calculators/home-office/page.tsx`, add the import:

```ts
import { SITE_URL } from '@/lib/site-config'
```

Change the metadata export to:

```ts
export const metadata: Metadata = {
  title: 'Home Office Deduction Calculator 2025–2026 — See Your Real Monthly Costs',
  description:
    'See the real cost of your rent, internet, phone, and utilities after your home office tax deduction. Free calculator for W-2 employees with an LLC or side business.',
  alternates: { canonical: '/calculators/home-office' },
  openGraph: {
    title: 'Your $2,400/mo Rent Actually Costs $1,632/mo',
    description:
      'See the real monthly cost of rent, internet, and utilities after your home office deduction.',
  },
}
```

Add JSON-LD before `</main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Home Office Deduction Calculator',
      description:
        'See the real cost of your rent, internet, phone, and utilities after your home office tax deduction.',
      url: `${SITE_URL}/calculators/home-office`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      browserRequirements: 'Requires JavaScript',
    }),
  }}
/>
```

- [ ] **Step 3: Update quarterly estimates page**

In `app/calculators/quarterly-estimates/page.tsx`, add the import:

```ts
import { SITE_URL } from '@/lib/site-config'
```

Change the metadata export to:

```ts
export const metadata: Metadata = {
  title: 'Quarterly Estimated Tax Calculator 2025–2026 — W-2 + Self-Employment',
  description:
    'Calculate how much to set aside each quarter when you have W-2 income and an LLC. Includes safe harbor rules and W-4 withholding strategy.',
  alternates: { canonical: '/calculators/quarterly-estimates' },
  openGraph: {
    title: 'How Much Should You Set Aside Each Quarter?',
    description:
      'Calculate quarterly estimated taxes when you have a W-2 job and an LLC. Includes safe harbor rules.',
  },
}
```

Add JSON-LD before `</main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Quarterly Estimated Tax Calculator',
      description:
        'Calculate how much to set aside each quarter when you have W-2 income and an LLC.',
      url: `${SITE_URL}/calculators/quarterly-estimates`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      browserRequirements: 'Requires JavaScript',
    }),
  }}
/>
```

- [ ] **Step 4: Update profile page**

In `app/calculators/profile/page.tsx`, add the import:

```ts
import { SITE_URL } from '@/lib/site-config'
```

Change the metadata export to:

```ts
export const metadata: Metadata = {
  title: 'Your Tax Profile — Used Across All Calculators',
  description:
    'Set your W-2 income, LLC income, filing status, and state. Your profile is shared across all tax calculators and saved locally in your browser.',
  alternates: { canonical: '/calculators/profile' },
  openGraph: {
    title: 'Your Tax Profile — Shared Across All Calculators',
    description:
      'Set your W-2 income, LLC income, filing status, and state. Saved locally — nothing sent to any server.',
  },
}
```

Add JSON-LD before `</main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Tax Profile Settings',
      description:
        'Set your W-2 income, LLC income, filing status, and state. Shared across all tax calculators.',
      url: `${SITE_URL}/calculators/profile`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      browserRequirements: 'Requires JavaScript',
    }),
  }}
/>
```

- [ ] **Step 5: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add app/calculators/write-off/page.tsx app/calculators/home-office/page.tsx app/calculators/quarterly-estimates/page.tsx app/calculators/profile/page.tsx
git commit -m "feat: add OG metadata, canonical URLs, and JSON-LD to all calculator pages"
```

---

### Task 5: Create sitemap and robots.txt

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/calculators`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/calculators/write-off`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/home-office`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/quarterly-estimates`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/profile`, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds. All routes still listed as static.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add sitemap.xml and robots.txt for search engine crawlers"
```

---

## Chunk 2: Dynamic OG Images + Final Verification

### Task 6: Download JetBrains Mono font file

**Files:**
- Create: `assets/JetBrainsMono-Bold.ttf`

Satori (the image renderer behind `ImageResponse`) cannot use system fonts or `next/font`. It requires raw `.ttf` font data passed as an `ArrayBuffer`. We'll bundle a `.ttf` file in the project.

- [ ] **Step 1: Download JetBrains Mono Bold TTF**

```bash
mkdir -p assets
curl -L -o assets/JetBrainsMono-Bold.ttf "https://github.com/JetBrains/JetBrainsMono/raw/main/fonts/ttf/JetBrainsMono-Bold.ttf"
```

Verify the file downloaded (should be ~200-300KB):

```bash
ls -la assets/JetBrainsMono-Bold.ttf
```

- [ ] **Step 2: Commit**

```bash
git add assets/JetBrainsMono-Bold.ttf
git commit -m "chore: add JetBrains Mono Bold TTF for OG image generation"
```

---

### Task 7: Create hub page OG image

**Files:**
- Create: `app/calculators/opengraph-image.tsx`

This is the most important OG image — it's what shows when someone shares the hub page link. Receipt-themed, with the "clever & surprising" hook. Uses `readFile` from `node:fs/promises` to load the font at build time, per the Next.js docs pattern.

- [ ] **Step 1: Create `app/calculators/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Tax calculator showing a $2,000 laptop actually costs $1,320 after write-offs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), 'assets/JetBrainsMono-Bold.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111',
          padding: '40px',
          fontFamily: 'JetBrains Mono',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#faf9f6',
            color: '#1a1a1a',
            borderRadius: '8px',
            padding: '48px 56px',
            width: '1000px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              letterSpacing: '4px',
              color: '#888',
              marginBottom: '24px',
            }}
          >
            TAX CALCULATORS
          </div>
          <div
            style={{
              fontSize: 48,
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            That $2,000 laptop?
          </div>
          <div
            style={{
              fontSize: 48,
              textAlign: 'center',
              color: '#15803d',
              lineHeight: 1.2,
              marginBottom: '32px',
            }}
          >
            It actually costs $1,320.
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#888',
              borderTop: '2px dashed #ccc',
              paddingTop: '20px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            For W-2 + LLC Owners · writeoff-calc.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fontData,
          style: 'normal' as const,
          weight: 700,
        },
      ],
    },
  )
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds. The OG image is generated at build time for the static `/calculators` route.

- [ ] **Step 3: Commit**

```bash
git add app/calculators/opengraph-image.tsx
git commit -m "feat: add receipt-themed OG image for hub page"
```

---

### Task 8: Create OG images for calculator and profile pages

**Files:**
- Create: `app/calculators/write-off/opengraph-image.tsx`
- Create: `app/calculators/home-office/opengraph-image.tsx`
- Create: `app/calculators/quarterly-estimates/opengraph-image.tsx`
- Create: `app/calculators/profile/opengraph-image.tsx`

All four follow the same template as the hub image but with page-specific copy. Each loads the same font file and uses the same receipt card layout.

- [ ] **Step 1: Create write-off OG image**

Create `app/calculators/write-off/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Write-off calculator showing the real cost of business expenses after tax savings'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), 'assets/JetBrainsMono-Bold.ttf'))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: '40px', fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf9f6', color: '#1a1a1a', borderRadius: '8px', padding: '48px 56px', width: '1000px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 16, letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>WRITE-OFF CALCULATOR</div>
          <div style={{ fontSize: 44, textAlign: 'center', lineHeight: 1.2, marginBottom: '8px' }}>See What Business Expenses</div>
          <div style={{ fontSize: 44, textAlign: 'center', color: '#15803d', lineHeight: 1.2, marginBottom: '32px' }}>Actually Cost You</div>
          <div style={{ fontSize: 18, color: '#888', borderTop: '2px dashed #ccc', paddingTop: '20px', width: '100%', textAlign: 'center' }}>For W-2 + LLC Owners · Free · No signup</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'JetBrains Mono', data: fontData, style: 'normal' as const, weight: 700 }] },
  )
}
```

- [ ] **Step 2: Create home office OG image**

Create `app/calculators/home-office/opengraph-image.tsx` — same template, different copy:

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Home office calculator showing rent costs less after tax deductions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), 'assets/JetBrainsMono-Bold.ttf'))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: '40px', fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf9f6', color: '#1a1a1a', borderRadius: '8px', padding: '48px 56px', width: '1000px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 16, letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>HOME OFFICE CALCULATOR</div>
          <div style={{ fontSize: 44, textAlign: 'center', lineHeight: 1.2, marginBottom: '8px' }}>Your $2,400/mo Rent</div>
          <div style={{ fontSize: 44, textAlign: 'center', color: '#15803d', lineHeight: 1.2, marginBottom: '32px' }}>Actually Costs $1,632/mo</div>
          <div style={{ fontSize: 18, color: '#888', borderTop: '2px dashed #ccc', paddingTop: '20px', width: '100%', textAlign: 'center' }}>For W-2 + LLC Owners · Free · No signup</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'JetBrains Mono', data: fontData, style: 'normal' as const, weight: 700 }] },
  )
}
```

- [ ] **Step 3: Create quarterly estimates OG image**

Create `app/calculators/quarterly-estimates/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Quarterly tax calculator for W-2 employees with an LLC'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), 'assets/JetBrainsMono-Bold.ttf'))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: '40px', fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf9f6', color: '#1a1a1a', borderRadius: '8px', padding: '48px 56px', width: '1000px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 16, letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>QUARTERLY ESTIMATES</div>
          <div style={{ fontSize: 44, textAlign: 'center', lineHeight: 1.2, marginBottom: '8px' }}>How Much Should You</div>
          <div style={{ fontSize: 44, textAlign: 'center', color: '#15803d', lineHeight: 1.2, marginBottom: '32px' }}>Set Aside Each Quarter?</div>
          <div style={{ fontSize: 18, color: '#888', borderTop: '2px dashed #ccc', paddingTop: '20px', width: '100%', textAlign: 'center' }}>For W-2 + LLC Owners · Free · No signup</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'JetBrains Mono', data: fontData, style: 'normal' as const, weight: 700 }] },
  )
}
```

- [ ] **Step 4: Create profile OG image**

Create `app/calculators/profile/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Tax profile settings shared across all calculators'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), 'assets/JetBrainsMono-Bold.ttf'))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: '40px', fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf9f6', color: '#1a1a1a', borderRadius: '8px', padding: '48px 56px', width: '1000px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 16, letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>TAX PROFILE</div>
          <div style={{ fontSize: 44, textAlign: 'center', lineHeight: 1.2, marginBottom: '8px' }}>Your Tax Profile</div>
          <div style={{ fontSize: 44, textAlign: 'center', color: '#15803d', lineHeight: 1.2, marginBottom: '32px' }}>Shared Across All Calculators</div>
          <div style={{ fontSize: 18, color: '#888', borderTop: '2px dashed #ccc', paddingTop: '20px', width: '100%', textAlign: 'center' }}>Saved locally · Nothing sent to any server</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'JetBrains Mono', data: fontData, style: 'normal' as const, weight: 700 }] },
  )
}
```

- [ ] **Step 5: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds. All OG images generated at build time.

- [ ] **Step 6: Commit**

```bash
git add app/calculators/write-off/opengraph-image.tsx app/calculators/home-office/opengraph-image.tsx app/calculators/quarterly-estimates/opengraph-image.tsx app/calculators/profile/opengraph-image.tsx
git commit -m "feat: add receipt-themed OG images for all calculator and profile pages"
```

---

### Task 9: Create root OG image for redirect route

**Files:**
- Create: `app/opengraph-image.tsx`

The root `/` route redirects to `/calculators`, but crawlers and social previews may still request metadata for `/`. This OG image shows the same hub content.

- [ ] **Step 1: Create `app/opengraph-image.tsx`**

Same receipt design as the hub page OG image:

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Free tax calculators for W-2 employees with a side business'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(join(process.cwd(), 'assets/JetBrainsMono-Bold.ttf'))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: '40px', fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf9f6', color: '#1a1a1a', borderRadius: '8px', padding: '48px 56px', width: '1000px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 16, letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>TAX CALCULATORS</div>
          <div style={{ fontSize: 48, textAlign: 'center', lineHeight: 1.2, marginBottom: '8px' }}>That $2,000 laptop?</div>
          <div style={{ fontSize: 48, textAlign: 'center', color: '#15803d', lineHeight: 1.2, marginBottom: '32px' }}>It actually costs $1,320.</div>
          <div style={{ fontSize: 18, color: '#888', borderTop: '2px dashed #ccc', paddingTop: '20px', width: '100%', textAlign: 'center' }}>For W-2 + LLC Owners · Free · No signup</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'JetBrains Mono', data: fontData, style: 'normal' as const, weight: 700 }] },
  )
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`

Expected: Build succeeds. The root OG image does not conflict with the redirect.

- [ ] **Step 3: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "feat: add root OG image for redirect route"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run the build**

Run: `npm run build`

Expected: Build succeeds with no errors. All routes generate as static content.

- [ ] **Step 2: Run existing tests**

Run: `npm test`

Expected: All existing tests pass.

- [ ] **Step 3: Verify OG tags in HTML output**

Run: `npm run dev`

Use curl to check the HTML head for OG tags:

```bash
curl -s http://localhost:3000/calculators | grep -E 'og:|twitter:' | head -10
```

Expected: `<meta property="og:title"`, `<meta property="og:description"`, `<meta property="og:image"`, and `<meta name="twitter:card"` tags are present.

- [ ] **Step 4: Verify sitemap and robots**

```bash
curl -s http://localhost:3000/sitemap.xml
curl -s http://localhost:3000/robots.txt
```

Expected: Sitemap lists all 5 pages. Robots.txt shows `User-Agent: *`, `Allow: /`, and the sitemap URL.

- [ ] **Step 5: Verify JSON-LD**

```bash
curl -s http://localhost:3000/calculators | grep -o 'application/ld+json.*</script>' | head -1
```

Expected: JSON-LD script tag with `WebApplication` schema is present.

- [ ] **Step 6: Verify OG image renders**

Visit `http://localhost:3000/calculators/opengraph-image` in a browser.

Expected: A 1200x630 PNG image with the receipt-themed card showing "That $2,000 laptop? It actually costs $1,320." in JetBrains Mono font.
