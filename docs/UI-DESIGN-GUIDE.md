# UI Design Guide — Online Bus Ticket SaaS Platform

> **Philosophy:** Premium, calm, and trustworthy. Green as the soul of the brand — not loud, but alive. Every pixel serves a traveller making a real decision with their money. Airbnb-level information hierarchy, Uber-level speed feedback, Stripe-level detail polish.

---

## 1. Design Principles

| Principle | What it means in practice |
|-----------|--------------------------|
| **Clarity first** | One primary action per screen. Never compete with yourself. |
| **Motion with purpose** | Framer Motion only on the tenant public site. Internal tools (admin, counter) are static — speed matters more there. |
| **Data-faithful** | Every component maps to a real API field. No decorative data. |
| **Accessible defaults** | Contrast ≥ 4.5:1 everywhere, focus rings always visible, no icon-only interactive elements without `aria-label`. |
| **Green is nature, not alert** | Green = brand trust, not "success state". Use it for identity, CTAs, and accents — not to replace semantic feedback colours. |

---

## 2. Colour System

### 2.1 Green Palette (Brand Foundation)

```
--green-950: #052e16   ← logo on white, darkest text on green bg
--green-900: #14532d   ← navbar bg (dark variant), deep headings
--green-800: #166534   ← primary CTA hover
--green-700: #15803d   ← primary CTA default                 ★ PRIMARY
--green-600: #16a34a   ← links, active nav, seat-selected
--green-500: #22c55e   ← progress indicators, live badge
--green-400: #4ade80   ← icon accent on dark backgrounds
--green-100: #dcfce7   ← subtle highlight bg, chip selected bg
--green-50:  #f0fdf4   ← page section tint, card hover bg
```

### 2.2 Neutral Palette

```
--gray-950: #0a0a0a   ← body text
--gray-900: #111827
--gray-700: #374151   ← secondary text
--gray-500: #6b7280   ← muted / meta text
--gray-300: #d1d5db   ← borders
--gray-200: #e5e7eb   ← dividers, input borders
--gray-100: #f3f4f6   ← section backgrounds
--gray-50:  #f9fafb   ← page background
--white:    #ffffff
```

### 2.3 Semantic Colours

```
--success:  #16a34a   (reuse green-600)
--warning:  #d97706
--danger:   #dc2626
--info:     #2563eb
```

### 2.4 CSS Custom Properties Convention

Define once in `globals.css`, reference everywhere:

```css
:root {
  /* Brand */
  --color-primary:       #15803d;
  --color-primary-hover: #166534;
  --color-primary-light: #dcfce7;
  --color-primary-subtle:#f0fdf4;

  /* Neutrals */
  --color-surface:       #ffffff;
  --color-bg:            #f9fafb;
  --color-border:        #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-text:          #111827;
  --color-text-secondary:#6b7280;

  /* Semantic */
  --color-success:       #16a34a;
  --color-warning:       #d97706;
  --color-danger:        #dc2626;

  /* Elevation shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.05);
  --shadow-xl: 0 20px 25px rgba(0,0,0,.1), 0 8px 10px rgba(0,0,0,.04);

  /* Radius */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-pill:9999px;
}
```

---

## 3. Typography

**Font:** `Inter` (already in stack) — clean, legible at all sizes, excellent number rendering (critical for fares and times).

### Type Scale

| Token | Size | Weight | Line-height | Use |
|-------|------|--------|-------------|-----|
| `--text-xs`    | 11px | 400 | 1.4 | Badges, legal micro-text |
| `--text-sm`    | 13px | 400 | 1.5 | Table cells, secondary meta |
| `--text-base`  | 15px | 400 | 1.6 | Body copy |
| `--text-md`    | 17px | 500 | 1.5 | Card labels, form labels |
| `--text-lg`    | 20px | 600 | 1.4 | Section subheadings |
| `--text-xl`    | 24px | 700 | 1.3 | Page headings (search results count, etc.) |
| `--text-2xl`   | 30px | 700 | 1.2 | Hero tagline secondary line |
| `--text-3xl`   | 38px | 800 | 1.1 | Hero headline |
| `--text-fare`  | 22px | 700 | 1.0 | Fare display — tabular-nums, letter-spacing -0.02em |

```css
:root {
  --font-base: 'Inter', system-ui, sans-serif;
  font-feature-settings: "cv02","cv03","cv04","cv11"; /* Inter contextual alternates */
}
.fare, .pnr, .time { font-variant-numeric: tabular-nums; }
```

---

## 4. Spacing & Layout

Use an **8px base grid**. All spacing values are multiples of 4px (half-steps allowed for micro-spacing only).

```
4px   — micro gap (icon+label)
8px   — tight internal padding
12px  — compact card padding
16px  — standard padding
24px  — card padding, section gap
32px  — between related sections
48px  — between major page sections
64px  — hero vertical padding
96px  — large section separation
```

**Max-width containers:**

| Context | Max Width |
|---------|-----------|
| Content pages | 720px |
| App shell (search, booking) | 1100px |
| Admin / Counter | 1280px |
| Hero widget | 1100px |

---

## 5. Component Library

### 5.1 Navbar — Tenant Public Site

**API data used:** `SiteProfile.companyName`, `SiteProfile.logoUrl`, `SiteTheme.primaryColor`

**Layout:** Sticky top. Two tiers.
- **Top bar** (32px tall): right-aligned "Our Counters" link with a subtle building icon. Background `--green-900`. Text `#ffffff` at 80% opacity.
- **Main bar** (64px tall): Logo left + company name, nav links centre-right, Login CTA button far right. Background `#ffffff`. Thin bottom border `--color-border`.

**Nav links:** `Home`, `About Us`, `Download Ticket`, `Contents ▾` (dropdown), `Contact Us`
- Default: `--color-text` weight 500
- Hover: `--color-primary` with 2px bottom underline animated via `scaleX` from 0→1 (0.2s ease)
- Active: `--color-primary`, underline always visible

**Login button:** Small pill button. Background `--color-primary`, white text, `--radius-pill`. 36px height.

**Scroll behaviour:** On scroll >80px — shadow `--shadow-md` appears via framer `useScroll` + `useMotionValue`. Logo shrinks from 48px → 36px with `useSpring`.

**Mobile (< 768px):** Hamburger menu. Full-screen slide-in panel from right using `AnimatePresence` + `x: "100%"` → `x: 0`. Green tinted overlay backdrop.

---

### 5.2 Hero Section

**API data used:** `SiteMedia[kind=HERO].url` → background image

**Design:**
- Full-width, min-height 520px on desktop, 380px on mobile.
- Background: hero image with a **dual-layer overlay**:
  - Bottom layer: `linear-gradient(to bottom, rgba(5,46,22,0.15) 0%, rgba(5,46,22,0.65) 100%)`
  - This keeps image visible at top, darkens at bottom where text/widget lives.
- **Hero copy block** (centred, above search widget):
  - Eyebrow: `SiteProfile.companyName` — uppercase, 14px, white at 82% opacity.
  - Headline: `SiteProfile.tagline` or fallback *"Search and book intercity bus tickets in minutes."* — `--text-2xl`/`--text-3xl`, weight 700, sentence case (never all-caps).
- Search widget floats at the bottom edge, translated up by 50% so it overlaps the next section (Airbnb pattern).

**Framer animations:**
```
tagline: { initial: { y: 24, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" } }
search widget: { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.25, duration: 0.5 } }
```

---

### 5.3 Search Widget (Home Page)

**API data used:** `GET /schedules/stops` → `Stop[]` (`id`, `name`, `city`, `code`)

**Design:** White card, `--shadow-xl`, `--radius-lg`. Overlaps hero by 50%.

```
┌─────────────────────────────────────────────────────────────────┐
│  Select Your Route & Search Coach Schedule           [subheading]│
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  FROM ▾      │  TO ▾        │  📅 Date     │  [AC] [Non AC]     │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                                                     [🔍 SEARCH →] │
```

**Fields:**
- `FROM` / `TO`: Custom styled dropdowns (not native `<select>`). Show city name in UPPERCASE, 15px Inter 600. Clicking opens a floating listbox with search/filter. Cities sourced from `Stop.city`.
- `Date`: Custom calendar picker. Current date pre-selected. Min = today (Asia/Dhaka).
- AC / Non AC toggles: Pill-shaped toggle buttons. Active state = `--color-primary` bg, white text. Inactive = `--color-border` bg, `--color-text-secondary`. Both on by default.
- Search button: `--color-primary` background, white text, right-aligned. Icon `→` or search icon. 48px height, `--radius-md`.

**Error state:** Shake animation on submit if validation fails. Red text below the row.

---

### 5.4 Schedule Result Card

**API data used:** `ScheduleCardDto`
- `coachNumber`, `startPoint`, `endPoint`, `departureAt`, `estimatedArrivalAt`
- `busType` (AC | NON_AC), `seatClasses[]`, `fareFrom`, `availableSeats`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [AC BADGE]  DH-101                                      ↗ from      │
│                                                        ৳ 850        │
│  GABTOLI ──────────────🚌──────────────► PABNA         32 seats     │
│  10:30 AM              4h 30m           3:00 PM                      │
│  [STANDARD] [PREMIUM] [BUSINESS]                   [SELECT SEAT →]  │
├─────────────────────────────────────────────────────────────────────┤
│  ROUTE: Dhaka → Pabna    Boarding: Gabtoli, Mirpur-10, ...          │
└─────────────────────────────────────────────────────────────────────┘
```

**Visual details:**
- White card, `--shadow-sm`, `--radius-md`, border `--color-border`. On hover: `--shadow-md`, border colour `--color-border-strong`. Transition 0.15s.
- `busType` badge: AC = green-100 text green-700, pill. NON_AC = amber-100 text amber-700.
- Route arrow line: thin 1px `--color-border` with bus icon centred. Animated bus icon slides right on card hover (framer `x: 0 → 8px`).
- `fareFrom` displayed as `৳ 850` (always divide by 100 for BDT display). Font `--text-fare`, `--color-primary`.
- `availableSeats`: Green dot + count when >10. Amber when ≤10. Red when ≤3.
- Seat class badges: small pills, `--green-100 / --green-700` colour. Stacked horizontally.
- `SELECT SEAT` button: `--color-primary`, white, `--radius-sm`, 40px. On expanded → becomes `CANCEL` in grey-100/gray-700.

**Expanded state (seat map):** Slides open below the card with `height: 0 → auto` (Framer `AnimatePresence` + `overflow: hidden`).

**Skeleton loader:** 3 shimmer cards (pulse animation) while fetching.

---

### 5.5 Filter Bar (Search Page)

**API data used:** `SearchSchedulesFacets` from `meta.facets`
- `timePeriod: { MORNING, NOON, AFTERNOON, NIGHT }` — counts drive chip badges
- `seatClass: { STANDARD, PREMIUM, BUSINESS }` — counts drive chip badges
- `total` — total result count label

**Layout:** Sticky top (below navbar). White background, `--shadow-sm` bottom only.

**Row 1 — Search inputs:** FROM | TO | Date | Time button | AC/NonAC | SEARCH — same style as home widget but more compact (40px height fields).

**Row 2 — Filter chips (expandable):** Collapses to hidden by default on mobile, visible on desktop.

```
Time Period:  [☀ Morning (2)]  [🌞 Noon (1)]  [🌤 Afternoon (0)]  [🌙 Night (1)]
Seat Type:    [Standard (3)]  [Premium (2)]  [Business (1)]
```

Chip design: `--radius-pill`, 32px height, border `--color-border`. Active: `--color-primary-light` bg, `--color-primary` border+text, green dot indicator. Count in a small muted badge inline.

**Prev/Next day navigation:** Clean row with `« Previous Day` | `Sat, 31 May 2026 | 10:42 AM` | `Next Day »`. Date is bold, time is muted. Animated fade when day changes.

---

### 5.6 Seat Map

**API data used:** `SeatMapDto` — `seats[]: { label, seatClass, status, price }`, `rows`, `cols`, `boardingPoints[]`

**Visual layout:** Bus body silhouette container. Seats rendered as a grid.

**Seat states:**

| State | Background | Border | Text | Cursor |
|-------|-----------|--------|------|--------|
| `AVAILABLE` | `#f0fdf4` | `#16a34a` | `#15803d` | pointer |
| `SELECTED` | `#15803d` | `#14532d` | `#ffffff` | pointer |
| `HELD` | `#fef3c7` | `#d97706` | `#92400e` | not-allowed |
| `SOLD` | `#f3f4f6` | `#d1d5db` | `#9ca3af` | not-allowed |

**Seat class visual distinction:**
- `STANDARD`: Square, `--radius-sm`
- `PREMIUM`: Square with a small gold dot top-right corner
- `BUSINESS`: Slightly larger seat tile, green accent left border (3px)

**Selection animation (Framer):** `scale: 1 → 0.9 → 1.05 → 1` spring on select.

**Side panel (Booking Summary):**
```
┌──────────────────┐
│ Boarding Point   │
│ [Select ▾]       │
├──────────────────┤
│ Seat  │  Fare    │
│ A1    │  ৳ 850  × │
│ A2    │  ৳ 850  × │
├──────────────────┤
│ Total (2 seats)  │
│      ৳ 1,700    │
├──────────────────┤
│ Journey: 31 May  │
│ Coach:   DH-101  │
├──────────────────┤
│  [Continue →]    │
└──────────────────┘
```

---

### 5.7 Booking Checkout Form

**API data used:** `BookingDto` — `holdExpiresAt`, `seatLabels[]`, `totalAmount`; Hold DTO `expiresAt`

**Layout:** Two-column on desktop (form left, order summary right). Single column on mobile.

**Hold timer:** Sticky top of the summary panel. Circular countdown ring in `--color-warning` that depletes. Text `12:00 → 0:00`. Under 2 minutes: colour shifts to `--color-danger`, slight pulse animation.

**Form fields:**
- Passenger Name: Standard input, 48px height, `--radius-sm`, border `--color-border`.
- Phone: Tel input, shows country flag BD 🇧🇩 prefix +88.
- Email: Optional, shown with `(optional)` label in muted text.
- All: Focus ring `2px solid --color-primary` with `box-shadow: 0 0 0 3px --color-primary-light`.

**Order summary card:** Sticky on desktop scroll. White, `--shadow-md`, `--radius-md`.
```
  Seat(s): A1, A2
  Fare:    ৳ 850 × 2
  Total:   ৳ 1,700
  [Proceed to Payment →]
```

---

### 5.8 E-Ticket Card

**API data used:** `TicketDto`
- `passengerNumber`, `passengerName`, `passengerPhone`
- `departureAt`, `routeSlug`, `seatLabels[]`, `totalAmount`, `boardingPoint`

**Design:** Boarding pass aesthetic. Horizontal card with tear-line notch dividers on both sides.

```
┌────┬────────────────────────────────────────────────────┬────┐
│    │  [LOGO] COMPANY NAME          [CONFIRMED ✓]        │    │
│    │  ─────────────────────────────────────────         │    │
│    │  DHAKA  ────────🚌────────►  PABNA                │    │
│ ·  │                                                     │ ·  │
│ ·  │  PNR: TK-2024-001234     Travel Date: 31 May 2026  │ ·  │
│ ·  │  Departure: 10:30 AM     Seat(s): A1, A2           │ ·  │
│ ·  │  Boarding: Gabtoli       Fare: ৳ 1,700             │ ·  │
│    │  ─────────────────────────────────────────         │    │
│    │  [||||||||| barcode ||||||||||||||]                 │    │
└────┴────────────────────────────────────────────────────┴────┘
```

**Colours:** White card, green header band (logo area bg `--green-900`, text white). Tear notch sides: dashed border circle cut effect using `border-radius: 50%` negative-margin circles.

**CONFIRMED badge:** Pill, `--green-100` bg, `--green-700` text, checkmark icon.

**Download button:** Full-width below ticket. `--color-primary`, white, download icon + "Download Ticket (PNG)".

---

### 5.9 Popular Routes Section (Homepage)

**API data used:** `FeaturedRoute[]` — `fromStop.city`, `toStop.city`, `routeSlug`, `isVisible`, `sortOrder`

**Design:** Light section background `--color-bg`. Section header: title *Popular routes*, subtitle in `--color-text-secondary`. Grid of route cards (3 columns desktop, 2 tablet, 1 mobile).

**Route card:**
```
Dhaka  ──🚌──  Pabna
View schedules →
```
- White card, border `--color-border`, `--radius-md`, min-height 96px.
- City names in **sentence case**, font-weight 600 (not UPPERCASE).
- Bus icon centred, `--color-primary`.
- Secondary line: *View schedules* in primary colour.
- Hover: `--shadow-sm` + border `--color-primary` with 0.15s transition.
- Entire card is a `<Link>` to `/search/[routeSlug]/[today]`.
- Hide entire section when no visible featured routes.

**Framer stagger animation:** Cards enter with `staggerChildren: 0.07s`, each `y: 20 → 0, opacity: 0 → 1`.

---

### 5.10 Offers & Promos Carousel (Homepage)

**API data used:** `SiteMedia[kind=FEATURED][]` sorted by `sortOrder` — `url`, `alt`

Replaces the old static 4-column gallery. Featured images become **horizontal promo cards**; caption text comes from `alt`.

**Design:**
- Section title *Offers & promos* + muted subtitle.
- Horizontal scroll track with `scroll-snap-type: x mandatory`.
- Each card: 16:9 image, `--radius-lg`, border + light shadow. Caption below from `alt` when set.
- Prev/next circular nav buttons on desktop; touch scroll only on mobile.
- Hide section when no featured media.

**Do not** duplicate the same images in a separate gallery grid on the home page.

---

### 5.11 Photo Gallery (Optional / Secondary Pages)

**API data used:** `SiteMedia[kind=FEATURED][]` — reuse only on `/about` or dedicated gallery page, not home.

If shown elsewhere: 4-column grid on desktop, 2-column tablet, 1-column mobile.
- Images: `aspect-ratio: 4/3`, `object-fit: cover`, `--radius-md` corners.
- Hover overlay: dark scrim `rgba(0,0,0,0.25)` fades in (0.2s). No zoom.
- Framer scroll-triggered reveal: `whileInView={{ opacity: 1, scale: 1 }}` from `{ opacity: 0, scale: 0.97 }`.

---

### 5.12 Statistics Strip (Homepage)

**API data used (Phase 1):** Static defaults in `home-defaults.ts`.  
**API data used (Phase 2 — CMS):** `SiteStats[]` — `{ value, label, sortOrder }` *(future epic)*.

**Design:** Four equal cards in a row on desktop. Green gradient background per card (`--color-primary-hover` → `--color-primary`). White text.

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   25K+       │   100K+      │    75+       │    50+       │
│ Happy        │ Tickets      │ Bus routes   │ Coaches      │
│ customers    │ sold         │              │ in fleet     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- Value: `--text-xl`, weight 700, `tabular-nums`.
- Label: `--text-sm`, white at 88% opacity.
- Section title uses `{companyName} at a glance`.

---

### 5.13 Why Travel With Us (Homepage)

**API data used (Phase 1):** Static defaults — four value props with Lucide-style icons.  
**API data used (Phase 2 — CMS):** `SiteValueProp[]` — `{ title, description, icon, sortOrder }` *(future epic)*.

**Design:** Four cards on `--color-bg` section. Each card: icon in `--color-primary-light` square, title (600), description (`--color-text-secondary`). Bottom CTA: ghost secondary button → `/about`.

Default props: Comfortable seats · On-time service · Expert drivers · 24/7 support.

---

### 5.14 Payment Methods Strip (Homepage)

**API data used:** `FooterSettings.paymentBannerUrl`

**Design:** Centred section before final CTA. Title *Payment methods*, subtitle about secure pay. Banner image inside a rounded frame on `--color-bg` inset. Same asset as footer payment banner.

---

### 5.15 Final CTA Band (Homepage)

**API data used:** `SiteProfile.companyName`

**Design:** Full-width green gradient band. Left: *Ready to start your journey?* + one-line subtitle with company name. Right: three actions —
- Primary: *Book your ticket* → `/#home-search`
- Ghost on dark: *Download ticket* → `/ticket`
- Ghost on dark: *Contact support* → `/contact`

Stack vertically on mobile; full-width buttons.

---

### 5.16 Footer

**API data used:** `FooterSettings` — `contactLines[]`, `email`, `paymentBannerUrl`, `barLinks[]`, `poweredByText`; `SiteProfile.tradeLicenseNo`

**Layout:** Dark background `--green-900`. White / green-100 text.

```
┌─────────────────────────────────────────────────────┐
│  Contact Information                                 │
│  ──────────────────                                  │
│  📍 Head Office: 123 Road, Dhaka                    │
│  🏢 Branch: Pabna Counter                           │
│  ✉  info@company.com                                │
│  ─────────────────────────────────────────────────  │
│  [Payment banner image — SSLCommerz / bKash etc]    │
│  ─────────────────────────────────────────────────  │
│  Powered by BusSaaS | Privacy | Terms | Return      │
│                                  Trade License: xxx  │
└─────────────────────────────────────────────────────┘
```

**Back-to-top button:** Fixed bottom-right. Circular, `--color-primary`, 44×44px. Animates in on scroll (`y: 20 → 0, opacity: 0 → 1`) using Framer.

---

### 5.17 Dashboard (Passenger)

**API data used:** Booking history — `BookingDto[]`

**Layout:** Clean list. Each booking is a compact horizontal card:
- Left: Status badge (`PAID` green / `HELD` amber / `CANCELLED` red)
- Centre: Route name, date, seats
- Right: Fare amount + "View Ticket" ghost button

**Empty state:** Centred illustration (SVG bus) + "No bookings yet" heading + "Search Routes" CTA.

---

## 6. Framer Motion Patterns (Tenant Public Site Only)

### 6.1 Page Transition Wrapper
```tsx
// Wrap each page content
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } }
}
```

### 6.2 Scroll-Triggered Section Reveal
```tsx
const sectionVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}
// usage: whileInView="visible" initial="hidden" viewport={{ once: true, margin: "-80px" }}
```

### 6.3 Staggered List Children
```tsx
const containerVariants = {
  visible: { transition: { staggerChildren: 0.07 } }
}
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}
```

### 6.4 Sticky Navbar Shrink
```tsx
const { scrollY } = useScroll();
const navHeight = useTransform(scrollY, [0, 80], [72, 56]);
const shadowOpacity = useTransform(scrollY, [0, 80], [0, 1]);
```

### 6.5 Seat Selection Spring
```tsx
// On seat toggle
animate={{ scale: [1, 0.88, 1.08, 1] }}
transition={{ type: "spring", stiffness: 400, damping: 20 }}
```

### 6.6 Hold Timer Ring
```tsx
// SVG circle stroke-dashoffset driven by seconds remaining
const circumference = 2 * Math.PI * 18; // r=18
const offset = circumference * (1 - secondsLeft / totalSeconds);
// animate stroke-dashoffset with useSpring for smooth countdown
```

### 6.7 Rules: When NOT to animate
- Admin panel tables — no animation
- Counter POS — no animation (speed-critical)
- Error/validation messages — instant, no delay
- Anything that runs on every keystroke

---

## 7. Page-by-Page Component Map

### `/` — Home (Tenant Public)

**Section order (top → bottom):**

| # | Zone | Component | Data source |
|---|------|-----------|-------------|
| 1 | Sticky header | `HomeHeader` | `SiteProfile`, `SiteTheme` |
| 2 | Hero + tagline | `HomeHero` | `SiteMedia[HERO]`, `SiteProfile.tagline` |
| 3 | Search widget | `HomeSearchWidget` | `GET /schedules/stops` |
| 4 | Offers carousel | `HomePromos` | `SiteMedia[FEATURED]` (`alt` = caption) |
| 5 | Popular routes | `HomeAvailableRoutes` | `FeaturedRoute[]` |
| 6 | Statistics | `HomeStats` | defaults → future `SiteStats[]` |
| 7 | Value props | `HomeValueProps` | defaults → future `SiteValueProp[]` |
| 8 | Payment strip | `HomePaymentStrip` | `FooterSettings.paymentBannerUrl` |
| 9 | Final CTA band | `HomeCtaBand` | `SiteProfile.companyName` |
| 10 | Footer | `SiteFooter` | `FooterSettings`, `SiteProfile` |

**Home page content map (reference layout):**

```
┌ Header ─────────────────────────────────────────────┐
├ Hero (image + tagline + floating search widget) ────┤
├ Offers & promos (carousel) ─────────────────────────┤
├ Popular routes (grid) ──────────────────────────────┤
├ Statistics (4 KPI cards) ───────────────────────────┤
├ Why travel with us (4 feature cards) ─────────────────┤
├ Payment methods (banner) ───────────────────────────┤
├ Ready to start your journey? (CTA band) ────────────┤
└ Footer (contact + legal) ───────────────────────────┘
```

### `/search/[routeSlug]/[date]` — Search Results

| Zone | Component | Data source |
|------|-----------|-------------|
| Sticky filter bar | `SearchFilterBar` | `stops`, `meta.facets` |
| Result count | inline in `SearchResultsContent` | `meta.facets.total` |
| Result cards | `ScheduleCard` (list) | `ScheduleCardDto[]` |
| Expanded seat map | `ScheduleSeatPanel` | `GET /schedules/:id/seat-map` |
| Skeleton | `ScheduleCardSkeleton` × 3 | — |

### `/booking/[scheduleId]` — Checkout

| Zone | Component | Data source |
|------|-----------|-------------|
| Trip summary banner | inline | `ScheduleCardDto` + hold |
| Hold timer | `SeatHoldTimer` | `HoldDto.expiresAt` |
| Passenger form | `SearchCheckoutForm` | — |
| Order summary sidebar | inline | `HoldDto.lineItems`, `totalAmount` |

### `/booking/[scheduleId]/payment` — Payment

| Zone | Component | Data source |
|------|-----------|-------------|
| Booking recap | inline | `BookingDto` |
| Payment method selector | `PaymentPageContent` | — |
| Proceed CTA | inline | `POST /payments/initiate` |

### `/booking/[scheduleId]/confirmation` — Confirmation

| Zone | Component | Data source |
|------|-----------|-------------|
| Success header | inline | static |
| Phone verification (guest) | inline form | — |
| E-ticket | `BusTicketCard` | `TicketDto` |
| Download button | `BusTicketPreview` | PNG capture |

### `/ticket` — Ticket Lookup

| Zone | Component | Data source |
|------|-----------|-------------|
| Lookup form | `TicketDownloadForm` | `GET /tickets/lookup?passengerNumber&phone` |
| E-ticket display | `BusTicketCard` | `TicketDto` |

### `/dashboard` — Passenger History

| Zone | Component | Data source |
|------|-----------|-------------|
| Booking list | `CustomerDashboard` | `GET /users/me/bookings` |
| Empty state | inline | — |

---

## 8. Counter POS UI (Internal Tool)

> No Framer. Pure CSS transitions max 150ms. Density over aesthetics. Think Bloomberg Terminal, not Airbnb.

**Colour override:** Counter uses the same green palette but with a dark sidebar:

```
Sidebar bg:     --green-950  (#052e16)
Sidebar text:   #ffffff at 85% opacity
Active item:    --green-700 bg, white text
Content bg:     --color-bg (#f9fafb)
```

**Layout:** Fixed left sidebar 220px + scrollable main content area.

**Key panels and their data:**

| Panel | Key data shown |
|-------|---------------|
| Quick Search | Same stops dropdown → schedule list (compact row, no seat map animation) |
| Sell Flow | Seat map (static, fast) → passenger form → cash/online toggle → confirm |
| Schedule Card | `coachNumber`, `departureAt`, `availableSeats`, `status` badge |
| History | `CounterTransaction[]` — type badge (SELL/REFUND/CHANGE/CANCEL), amount, time |
| Manage | Schedule reschedule / cancel form |

**Transaction type badges:**

| Type | Colour |
|------|--------|
| SELL | green-100 / green-700 |
| CHANGE | blue-100 / blue-700 |
| REFUND | amber-100 / amber-700 |
| CANCEL | red-100 / red-700 |

---

## 9. Admin Panel UI

> Same density-first rules as Counter. Sidebar navigation. Data tables with inline actions.

**Layout:** Collapsible left sidebar 240px. Top bar shows tenant name + plan badge. Main area is a padded content region.

**Plan tier badges:**
- `FREE`: gray-100 / gray-600
- `PRO`: green-100 / green-700
- `ENTERPRISE`: purple-100 / purple-700

**Data tables:**
- Zebra striping: odd rows `#ffffff`, even rows `#f9fafb`
- Hover: `--color-primary-subtle` row highlight
- Sort indicators on column headers
- Inline action buttons: ghost style (border only) to avoid visual noise

**CMS Panel:** Split-view. Left = form/editor controls. Right = live preview iframe. Green accent on active panel tab.

**Reports:**
- KPI cards: 4-column grid. White cards with `--shadow-sm`. Icon top-left (green), big number, label below, trend indicator (▲/▼) in green/red.
- Charts: Line chart for sales over time. Bar chart for revenue by route. Green palette fills (`--green-500`, `--green-300`, `--green-100`).

---

## 10. Platform Super Admin UI

> Designed like a SaaS ops dashboard (think Stripe Dashboard / Vercel). Clean, data-dense, trustworthy.

**Colour scheme:** White with green accents. Status colours are semantic — not brand-tinted.

**Key panels and data displayed:**

| Panel | Data from |
|-------|----------|
| Overview | `PlatformDashboard` — tenant count, total bookings, MRR, active alerts |
| Tenants table | `Tenant[]` — name, slug, planTier, planStatus, createdAt |
| Tenant detail | Plan, subscription, members, usage metrics, wallet balance |
| Alerts | `PlatformAlert[]` — severity badge, title, source, status |
| Billing | `PlatformInvoice[]` — invoiceNumber, amount, status, paidAt |
| Audit logs | `PlatformAuditLog[]` — actor, action, resourceType, timestamp |

**Tenant status badges:**

| Status | Style |
|--------|-------|
| TRIAL | blue-100/blue-700 |
| ACTIVE | green-100/green-700 |
| SUSPENDED | amber-100/amber-700 |
| CANCELLED | red-100/red-700 |

**Alert severity badges:**

| Severity | Style |
|----------|-------|
| INFO | blue-100/blue-700 |
| WARNING | amber-100/amber-700 |
| CRITICAL | red-100/red-700 + pulsing dot |

---

## 11. Form Design Standards

### Input anatomy
```
[Label text]                    (optional) hint
┌─────────────────────────────────────────────┐
│  placeholder or value                        │
└─────────────────────────────────────────────┘
  ✗ Error message in red below if invalid
```

- Height: 48px (standard), 40px (compact / filter bars)
- Border: 1px `--color-border`. Focus: 2px `--color-primary` + 3px `--color-primary-light` box-shadow
- Border-radius: `--radius-sm` (6px)
- Error border: `--color-danger`. Shake animation (`translateX: -4px → 4px → -2px → 0`, 0.3s`).
- Disabled: `--color-bg` background, `--color-text-secondary` text, `cursor: not-allowed`

### Button variants

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| Primary | `--color-primary` | white | none | Main CTA (Search, Continue, Pay) |
| Primary hover | `--color-primary-hover` | white | none | — |
| Secondary | white | `--color-primary` | 1.5px `--color-primary` | Secondary action |
| Ghost | transparent | `--color-text-secondary` | 1px `--color-border` | Tertiary / destructive |
| Danger | `--color-danger` | white | none | Destructive confirm |
| Busy | primary + 60% opacity | white + spinner | none | Loading state |

All buttons: min-width 120px, height 48px (36px compact), `--radius-sm`, font-weight 600, `letter-spacing: 0.01em`.

---

## 12. Status & Feedback Patterns

### Booking status colours (mapped to API `BookingStatus`)

| Status | Display | Style |
|--------|---------|-------|
| `DRAFT` | Draft | gray |
| `HELD` | Pending | amber |
| `PAID` | Confirmed | green |
| `CANCELLED` | Cancelled | red |
| `REFUNDED` | Refunded | blue |

### Toast / notification pattern
- Bottom-right, slide-up animation (Framer `y: 48 → 0`)
- Auto-dismiss 4s with progress bar
- Types: success (green-700 left border), error (red-700), warning (amber-700), info (blue-700)
- Never stack more than 3

### Loading states
- **Page-level:** Brand loading overlay (`BrandLoadingOverlay`) — centered logo + green spinning ring
- **Section-level:** Skeleton shimmer (CSS animation, `linear-gradient` sweep)
- **Button:** Spinner replaces icon, text changes to progressive label ("Reserving…", "Processing…")
- **Data table:** Row-level pulse skeleton, same column widths as real data

---

## 13. Responsive Breakpoints

```
mobile:  < 640px   — single column, full-width cards, bottom-sheet modals
tablet:  640–1023px — 2-column grids, side panels collapse
desktop: ≥ 1024px  — full layouts as documented above
wide:    ≥ 1280px  — admin/counter benefit from wider table columns
```

Key mobile adaptations:
- Search widget: Fields stack vertically, AC/NonAC toggles full-width
- Schedule card: Route on its own row, fare/seats on bottom row
- Seat map: Horizontal scroll within a fixed-height container
- Admin sidebar: Hidden, toggle via hamburger → drawer overlay

---

## 14. Iconography

Use **Lucide Icons** (consistent with the Inter/clean aesthetic, well-maintained, tree-shakeable).

Key icon assignments:

| Context | Icon |
|---------|------|
| Bus / route | `Bus` |
| From stop | `MapPin` |
| To stop | `MapPinOff` or second `MapPin` |
| Departure time | `Clock` |
| Calendar / date | `Calendar` |
| Search | `Search` |
| Seat | `Armchair` |
| Ticket | `Ticket` |
| Download | `Download` |
| Payment | `CreditCard` |
| AC | `Wind` |
| User / passenger | `User` |
| Admin | `Settings2` |
| Counter | `Store` |
| Alert | `AlertTriangle` |
| Success | `CheckCircle2` |
| Danger | `XCircle` |

Icon sizes: 16px inline/label, 20px button, 24px section heading, 32px feature card, 48px empty state.

---

## 15. Implementation Notes

### CSS architecture
- Keep global tokens in `globals.css` (custom properties only, no utility classes)
- Per-component `.css` files co-located with the component (existing pattern — maintain it)
- No inline styles except dynamic values (e.g. `backgroundImage`, `strokeDashoffset`, theme colours from `SiteTheme.primaryColor`)

### Framer Motion scope
- Install in `apps/web` only (not packages)
- Create a `components/motion/` folder for shared animation variants
- Guard with `typeof window !== "undefined"` or `"use client"` — never in Server Components
- Use `LazyMotion` with `domAnimation` feature bundle to reduce bundle size:
  ```tsx
  import { LazyMotion, domAnimation } from "framer-motion"
  // Wrap tenant public layout root only
  ```

### Theme colours from API
`SiteTheme.primaryColor` is a hex string from the DB. Apply it as:
```tsx
// In SiteThemeProvider, set on :root
document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
```
All components automatically pick up the tenant's custom colour through `--color-primary`.

### Money display
- Store as integer paise/poisa (`totalAmount = 85000` = ৳ 850.00)
- Display: always divide by 100, `৳` symbol prefix, no decimal if `.00`
- Use `Intl.NumberFormat('bn-BD')` or simple `toLocaleString` for thousands separators

### Date/time display
- All stored in UTC, displayed in `Asia/Dhaka` (+06:00)
- Departure time: `10:30 AM` (12h format)
- Trip date: `31 May 2026` (dd MMM yyyy)
- Ticket date: `31-05-2026` (existing `formatDateDdMmYyyy`)

---

## 17. Premium Polish Addendum

> Apply these rules **on top of** the base guide when targeting Airbnb / Stripe-tier perceived quality. The base guide is complete and shippable; this section tightens visual restraint and editorial calm.

### 17.1 Visual restraint

| Avoid | Prefer |
|-------|--------|
| UPPERCASE city names and nav labels | Sentence case; reserve caps for eyebrows only |
| Emoji in filter chips or section titles | Lucide icons at 16–20px, or text only |
| Heavy `--shadow-xl` on every card | Border-first: `1px --color-border` + `--shadow-xs`; lift on hover only |
| Green on every badge, link, and heading | Green on primary CTAs, active states, and fare emphasis only |
| Two-tier navbar with dark top bar | Single white navbar; counters link inline or in footer |
| Red accent for active nav (legacy) | `--color-primary` underline only |

### 17.2 Typography polish

- **Hero headline:** weight 700, not 800; `letter-spacing: -0.03em`; max ~18 characters per line on desktop.
- **Section titles:** `--text-lg` to `--text-xl`, weight 700; always paired with a muted `--text-sm` subtitle.
- **Body / meta:** `--color-text-secondary` for descriptions; never pure black `#000`.
- **Fares and times:** `font-variant-numeric: tabular-nums` (already required).
- **Optional upgrade:** display font for hero headline only (e.g. tenant `SiteTheme.fontFamily`); keep Inter for UI chrome.

### 17.3 Colour & surface

- Page background: warm off-white `#fafaf9` (`--home-section-bg`), not cool `#f0f0f0`.
- Cards: `#ffffff` on tinted sections; avoid grey-on-grey panels.
- Primary green: tenant `--primary` from `brandPaletteToCssVars`; never hardcode `#2e7d32` in new components.
- Gradients: use sparingly — hero overlay, stats cards, final CTA band only.

### 17.4 Spacing & rhythm

- Section vertical padding: **56px (`3.5rem`)** minimum between major home blocks.
- Max content width: **1100px** with `1rem` horizontal gutter.
- Let sections breathe — reference premium travel sites use ~40% whitespace on marketing pages.

### 17.5 Photography & media

- Hero: min 1920×800 source; subject centred; faces/vehicles sharp; no obvious watermarked stock.
- Promo carousel: 16:9 crop; `alt` text required for caption (admin CMS media panel).
- No image zoom on hover (scrim fade only if needed).

### 17.6 Motion

- Home sections: optional `whileInView` fade-up (`y: 20 → 0`, `0.4s`) — one pass, `viewport.once: true`.
- No stagger on above-the-fold content (hero, search).
- Respect `prefers-reduced-motion` (see §18).

### 17.7 Home page content completeness

A tenant home must not feel empty. Minimum viable sections (all implemented):

1. Hero + search  
2. Offers (if featured media exist)  
3. Popular routes (if featured routes exist)  
4. Statistics (defaults until CMS)  
5. Value props (defaults until CMS)  
6. Payment methods  
7. Final CTA  
8. Footer  

Sections with no CMS data **hide gracefully** (promos, routes) or show **sensible defaults** (stats, value props).

### 17.8 Future CMS fields (not yet in schema)

| Model | Fields | Admin panel |
|-------|--------|-------------|
| `SiteStats` | `value`, `label`, `sortOrder` | Home → Statistics |
| `SiteValueProp` | `title`, `description`, `icon`, `sortOrder` | Home → Why us |
| `SitePromo` | `title`, `imageUrl`, `linkUrl`, `sortOrder` | Optional split from FEATURED media |

Until then, defaults live in `apps/web/src/lib/home-defaults.ts`.

### 17.9 Premium checklist (home page)

- [ ] Hero shows `SiteProfile.tagline` (not hardcoded Shahzadpur copy)
- [ ] City names sentence case on route cards
- [ ] No duplicate gallery + carousel of same images
- [ ] Payment banner visible before footer CTA
- [ ] All colours from CSS vars (`--primary`, `--border`, `--text`, `--muted`)
- [ ] Section has title + subtitle pattern via `HomeSectionHeader`
- [ ] Mobile tested at 375px — CTA band stacks, carousel scrolls horizontally

---

## 18. Design Checklist Before Shipping Any Screen

- [ ] Every interactive element has a visible focus state
- [ ] All colour pairs pass WCAG AA contrast (4.5:1 text, 3:1 large text)
- [ ] Loading, empty, and error states are designed (not just happy path)
- [ ] Mobile layout tested at 375px width
- [ ] Framer animations are behind `"use client"` and respect `prefers-reduced-motion`
- [ ] Money amounts use the correct divide-by-100 display
- [ ] Date/time converted to Asia/Dhaka before display
- [ ] No hardcoded company names — all from `SiteProfile.companyName`
- [ ] Skeleton loaders match the real component's structure

```css
/* Respect reduced motion globally */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
