# Mobile Polish & Visual Refinement

## Problem

The site has zero media queries and no responsive adaptation. It works passably on mobile because the layout is capped at 480px, but there are real issues: the 5-tab top nav has tiny tap targets, body padding wastes vertical space on phones, inputs don't look obviously editable, and Quick Compare buttons overflow at 375px. The overall feel is functional but unpolished on mobile.

## Goals

1. **iOS-native navigation:** Replace the top nav bar with a sticky bottom tab bar following iOS Human Interface Guidelines — icons + labels, 44px+ touch targets, thumb-friendly placement.
2. **Mobile-optimized spacing:** Add a responsive breakpoint that tightens padding on small screens without changing the desktop experience.
3. **Polished inputs:** Make interactive elements feel intentional — visible input styling, proper touch targets, responsive button layout, focus states.

## Design

### 1. Bottom Tab Bar (iOS-style)

Replace the current top `nav-bar` with a sticky bottom tab bar.

**Position & sizing:**
- `position: fixed; bottom: 0; left: 0; right: 0`
- Height: 56px (matching iOS tab bar)
- Background: `#faf9f6` (receipt cream) with a subtle `border-top: 1px solid #ddd`
- `z-index: 50` to sit above content

**Layout:**
- 5 equal-width flex items
- Each item: SVG icon (20px) centered above label text (10px font)
- Full cell is the tap target (minimum 44px height satisfied by the 56px bar)
- Centered horizontally and vertically within each cell

**Active state:**
- Active: icon + label in `#1a1a1a` (dark)
- Inactive: icon + label in `#999`
- No background highlight — just color change (clean, iOS-like)

**Icons (inline SVG, no library):**
- Home: 4-square grid icon (represents calculator hub)
- Write-Off: price tag icon
- Home Office: house icon
- Quarterly: calendar icon
- Profile: person/circle icon

All icons are simple 20x20 stroke-based SVGs with `stroke="currentColor"` so they inherit the active/inactive color.

**Content padding adjustment:**
- Add `padding-bottom: calc(72px + env(safe-area-inset-bottom))` to `.page` (56px tab bar + 16px breathing room + iPhone home indicator safe area) so content isn't hidden behind the fixed bar. The padding goes on `.page`, not `body`, because the NavBar renders inside each page component.
- The tab bar itself gets `padding-bottom: env(safe-area-inset-bottom)` so the bar extends into the safe area but the icons/labels sit above the home indicator.
- This requires adding `viewport-fit=cover` via the Next.js viewport export in `app/layout.tsx`.
- Remove the top nav bar styles (`.nav-bar`, `.nav-item`, etc.) and replace with bottom tab bar styles

**NavBar structural change:**
- Move `<NavBar />` from being rendered inside each of the 5 page components (Calculator.tsx, HomeOfficeCalculator.tsx, QuarterlyCalculator.tsx, ProfilePage.tsx, hub page.tsx) into `app/calculators/layout.tsx`. This way the tab bar renders once outside the page flow, persists across route changes (no flash on navigation), and is the natural home for fixed navigation.
- Remove the `<NavBar />` call from all 5 consumer components.

**Receipt adjustment:**
- The receipt currently has `border-radius: 0 0 4px 4px` (flat top, rounded bottom) because it connected to the top nav. With the nav at the bottom, change to `border-radius: 4px` (all corners rounded).

### 2. Mobile Responsive Spacing

Add a `@media (max-width: 480px)` breakpoint:

**Body:**
- Reduce padding from `40px 20px` to `16px 12px`

**Receipt:**
- Reduce padding from `36px 32px` to `24px 16px`

**Receipt header:**
- Reduce `padding-bottom` from `20px` to `14px`
- Reduce `margin-bottom` from `20px` to `14px`

**Profile sections:**
- Reduce `margin-bottom` from `20px` to `14px`

**Receipt footer:**
- Reduce font size slightly for the disclaimer text on mobile

Desktop (>480px) remains unchanged. The receipt stays at `max-width: 480px`, centered on the dark background.

### 3. Input & Touch Target Polish

**Touch targets:**
- All `input` and `select` elements: `min-height: 44px` (iOS HIG minimum)
- Increase existing padding to make inputs feel more spacious

**Input visibility:**
- Inputs already have `border-bottom: 1px dashed #aaa` (profile-row) and `border-bottom: 2px dashed #ccc` (purchase-input). Strengthen the focus state: on focus, change to `border-bottom-color: #1a1a1a` for a clear active indicator. Keep the existing dashed style (it fits the receipt aesthetic).

**Select styling:**
- Match input height (44px)
- Consistent border treatment with inputs

**Quick Compare items:**
- The Quick Compare row uses `.compare-item` elements with `flex: 1` inside `.compare-row`.
- On mobile (≤480px): add `flex-wrap: wrap` to `.compare-row` and change `.compare-item` from `flex: 1` to `flex: 0 0 48%` so items wrap to a 2×2 grid. This prevents horizontal overflow at 375px width.
- On desktop: stays as a single row with `flex: 1`.

**Focus states:**
- Add `outline: 2px solid #1a1a1a; outline-offset: 2px` on `:focus-visible` for inputs, selects, and buttons
- Improves keyboard accessibility

## Files changed

| File | Change |
|------|--------|
| `app/globals.css` | Replace top nav styles with bottom tab bar styles, add `@media (max-width: 480px)` breakpoint, input/select touch target and focus improvements, Quick Compare responsive grid, receipt border-radius update, `.page` padding-bottom for tab bar |
| `components/NavBar.tsx` | Restructure from horizontal top links to bottom tab bar with inline SVG icons above labels, update className references |
| `app/layout.tsx` | Add `viewport-fit=cover` via viewport export for iOS safe area support |
| `app/calculators/layout.tsx` | Render `<NavBar />` here instead of per-page |
| `components/Calculator.tsx` | Remove `<NavBar />` rendering |
| `components/HomeOfficeCalculator.tsx` | Remove `<NavBar />` rendering |
| `components/QuarterlyCalculator.tsx` | Remove `<NavBar />` rendering |
| `components/ProfilePage.tsx` | Remove `<NavBar />` rendering |
| `app/calculators/page.tsx` | Remove `<NavBar />` rendering |

## Out of scope

- Desktop layout changes (receipt stays narrow + centered at 480px)
- Component logic or calculator behavior
- Content changes or new pages
- Animations or transitions (keep it simple for now)
- Dark mode
