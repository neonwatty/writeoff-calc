# Hub Intro Copy & Navigation Home Link

## Problem

The app has three paragraphs of intro copy on the hub page (`/calculators`) that explain the core value prop. However, (1) the copy is too long — most users will skip it, and (2) users navigating via the tab bar never see the hub page because there's no tab or link pointing back to it.

## Design

### 1. Header tagline

Add a one-line tagline inside the `receipt-header` on the hub page, below the existing "For W-2 + LLC Owners" subtitle:

> See what business expenses actually cost you after tax savings.

Styled smaller and muted (e.g., `font-size: 11px`, `color: #888`) so it reads as part of the title block, not a separate section.

### 2. Two-sentence description

Replace the existing three-paragraph landing message with two sentences in the same location (between the header and the tool links):

> When you write off a business expense, you don't see the savings until you file your taxes. These calculators show you that discount now — like seeing the sale price before you buy.

Keep the existing `profile-section` container and styling approach (`font-size: 13px`, `color: #555`, `line-height: 1.7`), but the content shrinks from three paragraphs to two sentences.

### 3. Home tab in NavBar

Add "Home" as the first tab in the NavBar component, linking to `/calculators`:

```
Home | Write-Off | Home Office | Quarterly | Profile
```

The Home tab highlights (receives the `active` class) when the pathname is exactly `/calculators` — not on sub-routes like `/calculators/write-off`.

### 4. Clickable title

On every calculator page, the `<h1>` in the receipt-header becomes a link back to `/calculators`. Styled to look like a plain heading — no underline, inherit color, no visible link affordance except a subtle cursor change on hover. This gives users a second, intuitive way to return to the hub (clicking the app name).

This applies to the main page components only, not to skeleton/loader components (the loading state is brief and doesn't need interactivity).

## Files changed

| File | Change |
|------|--------|
| `app/calculators/page.tsx` | Replace three-paragraph intro with tagline in header + two-sentence description |
| `components/NavBar.tsx` | Add "Home" tab as first item, linking to `/calculators` |
| Calculator page components (`Calculator.tsx`, `HomeOfficeCalculator.tsx`, `QuarterlyCalculator.tsx`, `ProfilePage.tsx`) | Wrap `<h1>` in receipt-header with a `<Link>` to `/calculators` |

## Out of scope

- Changing intro copy on individual calculator pages (they have none today, and that's intentional)
- Redesigning the hub page layout beyond the intro section
- Any changes to the receipt footer
