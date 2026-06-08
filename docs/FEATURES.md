# Feature Backlog (Epics & Micro-Tasks)

Each **Epic** is independently deliverable. Each **micro-task** should be one PR (or small PR series).  
**Format:** `[ ] E##-## — Title` → check when done.

**Contract-first:** For `shared` / `api` / `web` tasks, define Zod in `packages/shared` and document in `docs/contracts/` **before** implementation. See [CONTRACTS.md](CONTRACTS.md).

**Dependency legend:** `→` means must complete listed tasks first.

---

## Epic E00 — Project Foundation

**Goal:** Runnable monorepo, DB, API skeleton, web skeleton.  
**Depends on:** nothing.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E00-01 | Init pnpm workspace (`apps/api`, `apps/web`, `packages/database`, `packages/shared`) | infra | `pnpm install` works |
| [x] E00-02 | Shared TSConfig + ESLint + Prettier | infra | `pnpm lint` runs |
| [x] E00-03 | Prisma 7 + PostgreSQL; base `schema.prisma` with `User`, timestamps | db | `pnpm db:migrate` succeeds |
| [x] E00-04 | Export Prisma client from `packages/database` | db | API imports client |
| [x] E00-05 | Express app: health `GET /api/v1/health`, error middleware, request ID | api | Returns 200 JSON |
| [x] E00-06 | Next.js app shell + layout + API base URL env | web | Home renders |
| [x] E00-07 | `AppError` + global error handler; shared error codes enum | shared/api | Consistent JSON errors |
| [x] E00-08 | Optional: `tenantId` column pattern documented on base models | db/docs | SaaS-ready |

---

## Epic E01 — Identity & Access (Optional Login)

**Goal:** Register/login, JWT, guest checkout allowed, user dashboard for history.  
**Depends on:** E00.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E01-01 | Prisma: `Role` enum, `User` fields (phone, email, passwordHash) | db | Migrated |
| [x] E01-02 | Zod: `registerSchema`, `loginSchema` | shared | Tests for invalid input |
| [x] E01-03 | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` | api | Returns tokens |
| [x] E01-04 | JWT middleware `authenticateOptional` + `authenticateRequired` | api | Guest routes work |
| [x] E01-05 | `GET /api/v1/users/me` | api | Returns profile |
| [x] E01-06 | Web: login/register pages | web | Tokens stored httpOnly cookie |
| [x] E01-07 | `GET /api/v1/users/me/bookings` (paginated) | api | Only own bookings |
| [x] E01-08 | Web: `/dashboard` booking history list | web | Shows past trips |

---

## Epic E02 — Master Data (Stops, Routes, Coaches)

**Goal:** Admin can configure geography and fleet.  
**Depends on:** E00, E01 (admin role).

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E02-01 | Prisma: `Stop`, `Route` (fromStop, toStop, slug) | db | Unique slug |
| [x] E02-02 | Prisma: `Coach`, `BusType` (AC, NON_AC), `SeatClass` enum | db | — |
| [x] E02-03 | Zod CRUD schemas for stops, routes, coaches | shared | — |
| [x] E02-04 | Admin API: CRUD stops ` /api/v1/admin/stops` | api | RBAC ADMIN |
| [x] E02-05 | Admin API: CRUD routes | api | Slug auto-generated |
| [x] E02-06 | Admin API: CRUD coaches | api | — |
| [x] E02-07 | Web admin: stops/routes/coaches management UI | web | Basic tables + forms |
| [x] E02-08 | Seed script: sample Dhaka–Pabna route | db | Dev data |
| [x] E02-09 | Admin API + UI: boarding points per route | api/web | CRUD under `/admin/routes/:routeId/boarding-points` |

---

## Epic E03 — Seat Layout Templates

**Goal:** Reusable seat maps per coach/layout.  
**Depends on:** E02.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E03-01 | Prisma: `SeatLayout`, `SeatTemplate` (row, col, label, seatClass) | db | Linked to coach type |
| [x] E03-02 | Admin API: create/update layout | api | Validates duplicate labels |
| [x] E03-03 | `GET /api/v1/schedules/:id/seat-map` returns layout + status placeholders | api | Structure only OK first |
| [x] E03-04 | Admin UI: simple layout editor (grid) | web | Save layout |

---

## Epic E04 — Scheduling (Create & Reschedule)

**Goal:** Counter/Admin add and reschedule bus runs.  
**Depends on:** E02, E03.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E04-01 | Prisma: `Schedule` (route, coach, departureAt, arrivalEstimate, status, baseFare) | db | Indexed by date+route |
| [x] E04-02 | Zod: `createScheduleSchema`, `rescheduleSchema` | shared | No past departure |
| [x] E04-03 | `POST /api/v1/admin/schedules` | api | ADMIN or COUNTER role |
| [x] E04-04 | `PATCH /api/v1/admin/schedules/:id/reschedule` + `RescheduleLog` | api | Audit row created |
| [x] E04-05 | `PATCH /api/v1/admin/schedules/:id/cancel` | api | Cannot book cancelled |
| [x] E04-06 | Counter UI: create schedule form | web | Seller can create |
| [x] E04-07 | Counter UI: reschedule / cancel actions | web | Confirmation modal |

---

## Epic E05 — Search & Schedule Listing (User Flow Step 1)

**Goal:** Search form + results URL with filters.  
**Depends on:** E04.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E05-01 | Zod: `searchSchedulesSchema` (from, to, date, busType?, timePeriod?, seatClass?) | shared | Rejects past `date` |
| [x] E05-02 | Time period helper: map departure time → MORNING/NOON/AFTERNOON/NIGHT | shared | Unit tested |
| [x] E05-03 | `GET /api/v1/schedules/search` with filters + available seat count | api | Performance: uses indexes |
| [x] E05-04 | Web: search form (from, to, date picker min=today, bus type, filters) | web | Client + server validation |
| [x] E05-05 | Web: navigate to `/search/[routeSlug]/[date]` with query params | web | Matches spec |
| [x] E05-06 | Web: schedule card component (coach, points, times, fare, seats, CTA) | web | Matches design fields |
| [x] E05-07 | Empty state + loading skeletons | web | UX complete |

---

## Epic E06 — Seat Selection & Boarding (User Flow Step 2)

**Goal:** Expand seat map, select seats, boarding point, price.  
**Depends on:** E03, E05.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E06-01 | Prisma: `ScheduleSeat` (scheduleId, seatLabel, status: AVAILABLE|HELD|SOLD) | db | Unique per schedule+seat |
| [x] E06-02 | Prisma: `BoardingPoint` on route; link to schedule if needed | db | — |
| [x] E06-03 | `GET /api/v1/schedules/:id/seat-map` with live availability | api | SOLD/AVAILABLE/HELD |
| [x] E06-04 | Prisma: `SeatHold` (expiresAt, sessionId, seatIds[]) | db | TTL 10 min |
| [x] E06-05 | `POST /api/v1/bookings/hold` — transactional seat lock | api | 409 if seat taken |
| [x] E06-06 | Fare calculator service (per seat class + bus type rules) | api | Returns line items |
| [x] E06-07 | Web: expandable row → seat map UI (colors: available/selected/sold) | web | Max seats config |
| [x] E06-08 | Web: boarding point dropdown | web | Required before continue |
| [x] E06-09 | Web: selected seats summary + total price | web | Updates live |
| [x] E06-10 | `DELETE /api/v1/bookings/hold/:id` release on navigate away (optional job) | api | Cron releases expired |

---

## Epic E07 — Passenger Details & Checkout Prep

**Goal:** Collect passenger info for guest and logged-in users.  
**Depends on:** E06.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E07-01 | Zod: `passengerSchema` (name, phone, email optional) | shared | Phone format validated |
| [x] E07-02 | Prisma: `Booking` (status DRAFT|HELD|PAID|CANCELLED, userId?, holdId) | db | — |
| [x] E07-03 | `POST /api/v1/bookings` from hold + passenger + boardingPointId | api | Creates DRAFT booking |
| [x] E07-04 | Web: passenger form step before payment | web | Pre-fill if logged in |
| [x] E07-05 | Link booking to user if authenticated | api | Optional userId set |

---

## Epic E08 — Payment

**Goal:** Payment page; online + record for counter.  
**Depends on:** E07.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E08-01 | Prisma: `Payment` (amount, method, status, idempotencyKey) | db | — |
| [x] E08-02 | Payment provider interface + mock adapter | api | Swappable impl |
| [x] E08-03 | `POST /api/v1/payments/initiate` | api | Returns client secret / redirect URL |
| [x] E08-04 | `POST /api/v1/payments/confirm` idempotent | api | Booking → PAID, seats SOLD |
| [x] E08-05 | Web: `/booking/.../payment` page | web | Handles success/fail |
| [x] E08-06 | Webhook stub `POST /api/v1/payments/webhook` | api | Signature verify placeholder |

---

## Epic E09 — Ticketing & Download

**Goal:** Issue ticket; download by passenger number + phone.  
**Depends on:** E08.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E09-01 | Prisma: `Ticket` (passengerNumber unique, bookingId, qrPayload?) | db | — |
| [x] E09-02 | Generate `passengerNumber` (human-readable, unique) | api | No collisions |
| [x] E09-03 | `POST /api/v1/tickets/issue` on payment success (internal) | api | One ticket per booking |
| [x] E09-04 | `GET /api/v1/tickets/lookup` (passengerNumber + phone) | api | Rate limited |
| [x] E09-05 | PDF or HTML ticket generator | api | Returns downloadable file |
| [x] E09-06 | Web: `/ticket` lookup page + download | web | Wrong phone → 404 |
| [x] E09-07 | Web: confirmation page with ticket summary | web | After payment |

---

## Epic E10 — Counter POS (Sell, Change, Refund, Cancel)

**Goal:** Counter seller serves walk-in customers.  
**Depends on:** E06, E08, E09.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E10-01 | Prisma: `CounterTransaction` audit (type, sellerId, bookingId, amount) | db | Append-only |
| [x] E10-02 | RBAC: `COUNTER_SELLER` role + middleware | api | — |
| [x] E10-03 | `POST /api/v1/counter/sell` (cash/online, passenger, schedule, seats) | api | Same inventory rules |
| [x] E10-04 | `POST /api/v1/counter/change` (reissue seats/date per policy) | api | Logged |
| [x] E10-05 | `POST /api/v1/counter/refund` (release seats, payment status) | api | Logged |
| [x] E10-06 | `POST /api/v1/counter/cancel` | api | Logged |
| [x] E10-07 | Web: `/counter` POS layout (quick search + sell flow) | web | Optimized for keyboard |
| [x] E10-08 | Web: transaction history for seller shift | web | List today's sales |

---

## Epic E11 — Admin Reporting & Analytics

**Goal:** Sales reports and dashboards.  
**Depends on:** E08, E10.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E11-01 | `GET /api/v1/admin/reports/sales` (date range, route, channel) | api | Counter vs online split |
| [x] E11-02 | `GET /api/v1/admin/analytics/overview` (KPIs: revenue, tickets, occupancy) | api | Cached optional |
| [x] E11-03 | Export CSV endpoint | api | Downloadable |
| [x] E11-04 | Web: `/admin/reports` charts (daily revenue, top routes) | web | Date filter |
| [x] E11-05 | Web: `/admin` dashboard home KPI cards | web | — |

---

## Epic E13 — Notifications (SMS & Email)

**Goal:** After payment, send SMS confirmation; if email provided, send ticket PNG by email. Non-blocking background delivery.  
**Depends on:** E08, E09.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E13-01 | Prisma: `NotificationLog` (channel, status, bookingId) | db | Unique per booking+channel |
| [x] E13-02 | Zod: `BookingTicketNotificationDto` | shared | Matches ticket + optional email |
| [x] E13-03 | Twilio SMS + Nodemailer email adapters | api | Env-configured |
| [x] E13-04 | Server ticket PNG generator (SVG → PNG) | api | Attached to email |
| [x] E13-05 | BullMQ queue + worker on payment confirm | api | Redis + HTTP not blocked |
| [x] E13-06 | Contract doc `docs/contracts/notification/booking-confirmed.md` | docs | — |

---

## Epic E12 — Hardening & Operations (Post-MVP)

**Goal:** Production readiness.  
**Depends on:** core epics done.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E12-01 | Rate limiting on auth + ticket lookup | api | — |
| [x] E12-02 | Background job: expire seat holds | api | Every minute |
| [x] E12-03 | Structured logging + error tracking hook | api | — |
| [x] E12-04 | E2E: search → hold → pay → ticket | test | CI green |
| [x] E12-05 | API OpenAPI or typed client generation | docs | — |
| [x] E12-06 | Docker Compose for api + web + postgres | infra | One command up |

---

## Epic E14 — Correctness, Security & Reporting (Staff Review Remediation)

**Goal:** Fix financial/state bugs, secure public flows without breaking guest checkout, align pricing and reports with product rules.  
**Depends on:** E08–E11 (core flows live).  
**Source:** Senior staff review (2026-05-31).

### Product constraints (non-negotiable)

| # | Rule | Implication |
|---|------|-------------|
| 1 | **Refunds are counter-only** | No online self-service refund; no payment-gateway reversal. Only `POST /api/v1/counter/refund` (and counter UI). Counter staff (`COUNTER_SELLER` / `ADMIN`) act with policy conditions — not open to public or webhook. |
| 2 | **Guest checkout stays** | Users without an account must complete search → hold → booking → pay → ticket. Security fixes must use session-bound holds, scoped booking tokens, or phone proof — **not** mandatory login. |
| 3 | **Flat fare by schedule** | `STANDARD`, `PREMIUM`, and `BUSINESS` are **labels/filters only**. Every seat on a schedule pays `schedule.baseFare`. Remove class multipliers everywhere (admin init, seat-map fallback, seed). |

### Refund conditions (counter desk)

Apply on `POST /counter/refund` before mutating state:

- Booking `status === PAID`
- Schedule not departed (trip `departureAt` > now, Asia/Dhaka)
- Refund amount = `booking.totalAmount` (full refund only for MVP)
- Audit row on `CounterTransaction` (already exists)
- **Online bookings:** may be refunded **at counter only** (cash/handling offline); payment row → `REFUNDED` in DB — no gateway API call

**Cancel vs refund:** `cancel` is for unpaid / held bookings only. **Never** cancel a `PAID` booking — use refund. Counter UI must hide/disable Cancel for PAID.

---

### Phase P0 — Stop data corruption & fraud (do first)

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E14-01 | **Flat pricing:** shared constant `FLAT_SEAT_CLASS_MULTIPLIER = 1`; remove 1.3/1.6 from `schedules.service.ts`, `seed.ts`; document seat class ≠ price | shared/api/db | All new schedule seats priced at `baseFare`; seat-map prices match DB |
| [x] E14-02 | **Payment confirm guards:** require `booking.status === HELD`; reject `CANCELLED`/`REFUNDED`/`PAID`; optional signed `clientSecret` from initiate (guest-safe, no login) | shared/api | Cannot re-pay cancelled booking; guest flow unchanged |
| [x] E14-03 | **Protect `GET /bookings/:id`:** return summary only with `bookingAccessToken` (issued at create) or authenticated owner; never expose PII to anonymous UUID guess | shared/api/web | Guest checkout works via token in checkout URL/state; no public PII leak |
| [x] E14-04 | **Seat hold concurrency:** `updateMany` with `status: AVAILABLE` + verify affected count; reject partial lock | api | Two concurrent holds cannot take same seat |
| [x] E14-05 | **Counter cancel/refund split:** cancel only `HELD`/`DRAFT`; refund only `PAID`; cancel must not touch `Payment` | api/web | PAID + cancel impossible; counter UI matches |
| [x] E14-06 | **Remove debug auth telemetry** (`auth.ts` ingest to localhost) | api | No outbound debug calls in auth path |

---

### Phase P1 — Financial truth & counter policy

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E14-07 | **Refund conditions:** enforce PAID + not departed + full amount; Zod + contract doc `docs/contracts/counter/refund.md` | shared/api | 409 with clear code if policy fails |
| [x] E14-08 | **Block online refund surface:** no public refund route; webhook stub cannot trigger refund | api | Only counter refund mutates refund state |
| [x] E14-09 | **Counter sell atomicity:** wrap sell flow in single `$transaction` (hold → booking → pay → audit → channel) | api | Partial sell failure rolls back |
| [x] E14-10 | **Payment + ticket atomicity:** move `issueTicket` inside confirm transaction or compensating retry | api | PAID booking always has ticket |
| [x] E14-11 | **Hold session binding:** `createBooking` verifies `sessionId`; release hold requires matching session or booking token | shared/api/web | Guest isolation; no hold hijack |
| [x] E14-12 | **Rate limit** `POST /bookings/hold` | api | Per-IP limit configured |

---

### Phase P2 — Reporting & admin accuracy

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E14-13 | **Net revenue reports:** gross (PAID) + refunds (`CounterTransaction` type REFUND) + net; Zod DTOs in shared | shared/api/web | Dashboard shows gross/refund/net |
| [x] E14-14 | **Date range fix:** parse `from`/`to` in Asia/Dhaka with end-of-day inclusive | shared/api | Last day of range fully counted |
| [x] E14-15 | **KPI scope fix:** label `soldSeats` / `activeSchedules` correctly; optional “upcoming schedules” metric | api/web | No misleading 30d vs lifetime mix |
| [x] E14-16 | **CSV export:** include refunds as negative rows or separate refund sheet | api | Export reconciles with counter shift |
| [x] E14-17 | **Restore contract docs** for counter refund, search schedules (`seatClasses`), reports | docs | Matches CONTRACTS.md workflow |

---

### Phase P3 — Performance & RBAC cleanup

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E14-18 | **Search API:** filter `timePeriod`/`seatClass` in SQL; stop loading all seats when only counts needed | api | Single query or aggregated counts endpoint |
| [x] E14-19 | **Search web:** one API call for results + filter counts (or server facet counts) | web | No 2–5× duplicate search calls |
| [x] E14-20 | **Search date window:** Dhaka calendar day boundaries in `searchSchedules` | shared/api | Aligns with `isValidTripDate` |
| [x] E14-21 | **Schedule mutations ADMIN-only:** create/reschedule/cancel; counter read-only on schedules | api | COUNTER_SELLER cannot cancel trips |
| [x] E14-22 | **DB indexes:** `Booking(status, createdAt)`, `Stop(city)`, `Schedule(routeId, status, departureAt)` | db | Migration reviewed |
| [x] E14-23 | **JWT hardening:** fail startup without `JWT_SECRET` in production; `Secure` cookie flag | api | No default secret in prod |

---

### Phase P4 — Ops & maintainability (backlog)

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [ ] E14-24 | Hold expiry → BullMQ job (durable, `DISABLE_HOLD_EXPIRY_WORKER` flag) | api | Safe multi-instance |
| [ ] E14-25 | Admin schedule cancel policy: block new holds; document existing PAID booking handling | api/docs | No silent valid tickets on cancelled trip |
| [ ] E14-26 | Integration tests: counter refund/cancel guards, payment confirm guards, flat pricing | test | CI covers P0/P1 |
| [ ] E14-27 | Align return-policy page with counter refund-at-desk policy | web | Legal copy matches product |
| [ ] E14-28 | Idempotency: require `Idempotency-Key` on payment confirm | api | Duplicate confirm safe |

---

### E14 priority order

```
P0 (E14-01 … E14-06)  →  ship before any production traffic
P1 (E14-07 … E14-12)  →  counter policy + guest-safe security complete
P2 (E14-13 … E14-17)  →  trustworthy admin numbers
P3 (E14-18 … E14-23)  →  scale + RBAC
P4 (E14-24 … E14-28)  →  ops polish
```

**One micro-task per PR.** Check `[x]` when done.

---

## Epic E15 — Content Management (CMS)

**Goal:** Admin manages public-site branding, pages, media, featured routes, footer, theme, and preview/publish — replacing hardcoded web content.  
**Depends on:** E01 (ADMIN RBAC), E02 (routes for featured-route curation).  
**Suggested start:** after MVP core (E08–E11) or in parallel with E14 P4.

### Product notes

- **Draft / publish:** CMS entities carry `ContentStatus` (`DRAFT` \| `PUBLISHED`). Public API returns published only; admin preview returns drafts.
- **Assets (MVP):** storage driver (`local` filesystem or `cloudinary` CDN); local assets served at `GET /api/v1/cms/assets/:tenantId/:fileKey`.
- **Content format:** Markdown stored in DB; sanitized HTML on web.
- **Featured routes:** curate from existing `Route` records — not duplicate route CRUD.
- **Brand palette:** admin picks primary hex + font; `generateBrandPalette()` in `@repo/shared` produces semantic CSS tokens with WCAG AA on primary buttons.

### Phase 1 — Foundation

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E15-01 | Prisma CMS models + migration (`SiteProfile`, `SiteTheme`, `ContentPage`, `SiteMedia`, `FeaturedRoute`, `FooterSettings`, `ContentStatus`) | db | `pnpm db:migrate` succeeds |
| [x] E15-02 | Seed script: import current Shahzadpur static content + image refs into CMS tables as `PUBLISHED` | db | Dev home matches today |
| [x] E15-03 | Zod request schemas + response DTOs for all CMS endpoints in `packages/shared/src/schemas/admin/cms/` and `dtos/admin/cms/` | shared | Exported types; invalid hex rejected |
| [x] E15-04 | `generateBrandPalette(primaryHex)` + WCAG contrast helper + unit tests | shared | Palette JSON matches contract; AA on primary button |
| [x] E15-05 | Contract docs under `docs/contracts/admin/cms/` (profile, theme, pages, media, routes, footer, assets, publish, preview) | docs | Matches CONTRACTS.md workflow |

### Phase 2 — API (admin + public)

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E15-06 | Asset upload `POST /api/v1/admin/cms/assets` (multipart, image types, size limit) + `GET /api/v1/cms/assets/:key` | api | ADMIN RBAC; files on disk |
| [x] E15-07 | Admin `GET/PATCH /api/v1/admin/cms/profile` (company name, logo, tagline, trade license) | api | Saves draft; returns DTO |
| [x] E15-08 | Admin `GET/PATCH /api/v1/admin/cms/theme` — recomputes `paletteJson` on PATCH | api | Palette in response |
| [x] E15-09 | Admin CRUD `/api/v1/admin/cms/pages/:slug` (about, contact, terms, privacy, return-policy) | api | Markdown body validated |
| [x] E15-10 | Admin CRUD `/api/v1/admin/cms/media` (hero, featured, footer payment banner; reorder) | api | sortOrder unique per kind |
| [x] E15-11 | Admin CRUD `/api/v1/admin/cms/featured-routes` (pick `routeId`, order, visibility) | api | FK to Route; 409 if duplicate |
| [x] E15-12 | Admin `GET/PATCH /api/v1/admin/cms/footer` | api | JSON contact lines + bar links |
| [x] E15-13 | Public `GET /api/v1/cms/site` (published bundle) + `GET /api/v1/cms/pages/:slug` | api | No auth; drafts hidden |
| [x] E15-14 | Admin `GET /api/v1/admin/cms/preview` (all drafts) + `POST /api/v1/admin/cms/publish` (transactional) | api | Publish atomically flips status |

### Phase 3 — Web (consume published content)

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E15-15 | `SiteThemeProvider` + update `BrandLogo`, metadata title from CMS profile/theme | web | CSS vars applied site-wide |
| [x] E15-16 | Dynamic content pages: about, contact (new `/contact`), policies — fetch markdown, render safe HTML | web | Existing URLs unchanged |
| [x] E15-17 | Home: hero background, gallery, featured routes from CMS (remove `home-routes-data.ts`) | web | Links still resolve to search |
| [x] E15-18 | Dynamic `SiteFooter` from CMS footer settings | web | Contact + bar links editable |

### Phase 4 — Admin UI

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E15-19 | Admin CMS nav + **Profile** panel (name, logo upload) | web | Saves draft |
| [x] E15-20 | Admin **Theme** panel: color picker, font select, generated palette swatches + mini preview | web | Shows E15-04 tokens live |
| [x] E15-21 | Admin **Pages** panel: markdown editor per slug with preview | web | All 5 pages editable |
| [x] E15-22 | Admin **Media** panel: hero upload, featured gallery drag-reorder | web | Image preview |
| [x] E15-23 | Admin **Featured routes** panel: route picker + reorder | web | Uses existing routes list |
| [x] E15-24 | Admin **Footer** panel: contact lines, email, links, payment banner | web | Matches public footer |
| [x] E15-25 | Admin **Preview & Publish**: iframe/tab preview of draft site + Publish button | web | Preview uses admin preview API |
| [x] E15-26 | CMS asset storage port + Cloudinary adapter; local fallback; GET proxy for legacy assets | api | Driver swappable; Cloudinary when creds set |

### E15 dependency order

```
E15-01 → E15-02
E15-01 → E15-03 → E15-05
E15-03 → E15-04
E15-03 + E15-05 → E15-06 … E15-14
E15-13 + E15-14 → E15-15 … E15-18
E15-06 … E15-14 → E15-19 … E15-25
```

Recommended PR sequence: **01 → 03 → 04 → 05 → 06 → 07 → 08 → 09–12 → 13–14 → 15–18 → 19–25**.

---

## Epic E16 — SaaS Multi-Tenancy

**Goal:** Convert the single-tenant platform into a multi-tenant SaaS. Each bus company (tenant) is isolated by `tenantId`, identified via subdomain. Custom domain support is deferred but the resolver is built as a pluggable strategy. Plan tiers (FREE/PRO/ENTERPRISE) with status are stored on the Tenant record.  
**Depends on:** E00–E15 (all prior epics).

### Phase 1 — Database

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E16-01 | Prisma: `Tenant` model (slug unique, subdomainPrefix unique, customDomain nullable+unique, planTier, planStatus); add `SUPER_ADMIN` to `Role` enum; migrate | db | `pnpm db:migrate` succeeds |
| [x] E16-02 | Prisma: `TenantMembership` (tenantId, userId, role ADMIN\|COUNTER_SELLER, @@unique); add nullable `tenantId` + `@@index([tenantId])` to all 16 scoped models; migrate | db | No cross-tenant leaks |

### Phase 2 — Shared Contracts

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E16-03 | `packages/shared`: `PlanTier`/`PlanStatus` enums; `createTenantSchema`, `updateTenantSchema`, `TenantDto`, `TenantListDto` | shared | Zod validates |
| [x] E16-04 | `packages/shared`: `inviteMemberSchema`, `TenantMemberDto`; contract docs `docs/contracts/platform/tenant.md` + `member.md` | shared/docs | Contract docs written |

### Phase 3 — API

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E16-05 | `ITenantResolver` port + `SubdomainTenantResolver` (LRU cache, 60 s TTL); `TenantResolverMiddleware`; 404 on unknown slug; skip `/api/v1/platform/*` + `/api/v1/auth/*` | api | Returns 404 for unknown slug |
| [x] E16-06 | Scope all existing repository/service queries with `tenantId` (Stop, Route, Coach, Schedule, Booking, Ticket, CounterTransaction, CMS — 8 modules) | api | No cross-tenant data |
| [x] E16-07 | New `platform/` module: `GET/POST/PATCH /api/v1/platform/tenants`; requires `SUPER_ADMIN` | api | RBAC enforced |
| [x] E16-08 | `POST /api/v1/platform/register` (no auth; creates Tenant + ADMIN User in `$transaction`; auto-sets TRIAL plan; returns JWT) | api | Transaction atomic |
| [x] E16-09 | `GET /api/v1/admin/members`, `POST /api/v1/admin/members` (tenant ADMIN invites COUNTER_SELLER via TenantMembership) | api | Tenant-scoped |
| [x] E16-10 | Plan limit middleware: FREE ≤ 5 routes + 50 schedules/mo; PRO/ENTERPRISE unlimited; `PLAN_LIMIT_EXCEEDED` error code | api | 403 on cap breach |

### Phase 4 — Web

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E16-11 | `apps/web/src/middleware.ts`: parse Host → extract subdomain → set `X-Tenant-Slug` on all API requests; main domain routes to platform/onboarding only | web | Subdomain resolved |
| [x] E16-12 | `/onboarding` page: company sign-up form → `POST /api/v1/platform/register` → redirect to `{slug}.domain/admin` | web | Creates tenant |
| [x] E16-13 | `/platform` page (SUPER_ADMIN): tenant list table with plan/status badges; status toggle | web | SUPER_ADMIN only |
| [x] E16-14 | Tenant settings in `/admin` panel: plan display, member list, invite member form | web | Tenant-scoped ADMIN |
| [x] E16-15 | Update seed: demo tenant + SUPER_ADMIN user; Docker Compose `MAIN_DOMAIN` env; README: lvh.me dev tip | db/infra | Dev setup works |

### E16 dependency order

```
E16-01 → E16-02 → E16-03 → E16-04 → E16-05 → E16-06 → E16-07 → E16-08 → E16-09 → E16-10 → E16-11 → E16-12 → E16-13 → E16-14 → E16-15
```

---

## Epic E20 — Platform Admin Dashboard (Phase 1 MVP)

**Goal:** Professional SaaS platform admin: tabbed dashboard, overview KPIs, enhanced tenant CRUD, audit trail.  
**Depends on:** E16. See `docs/SAAS-PLATFORM-ADMIN-*.md`.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E20-04 | Tabbed `/platform` shell (Overview, Tenants, Audit); reuse admin CSS patterns | web | SUPER_ADMIN nav + logout |
| [x] E20-05 | `GET /api/v1/platform/dashboard/overview`; KPI cards, top tenants, plan bars | shared/api/web | Real MRR + booking aggregates |
| [x] E21-01 | Tenant list filters/search/pagination + enriched list DTO (members, monthly stats) | shared/api/web | Filters work without reload |
| [x] E21-03 | `GET /api/v1/platform/tenants/:id` detail DTO; `/platform/tenants/[id]` page | shared/api/web | Members + monthly stats shown |
| [x] E21-04 | Create tenant modal → `POST /platform/tenants` | web | Redirects to detail on success |
| [x] E26-01 | Prisma `PlatformAuditLog` model + migration | db | Append-only audit table |
| [x] E26-02 | `logPlatformAudit()` on tenant create/update with actor/IP/changes | api | Sensitive fields excluded |
| [x] E26-03 | `GET /api/v1/platform/audit-logs`; Audit tab with filters + JSON diff | shared/api/web | Paginated audit viewer |

---

## Epic E22–E24 — Platform Admin Phase 2

**Goal:** Usage analytics, billing/subscriptions, basic system health.  
**Depends on:** E20.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E22-01 | `PlatformApiLog` model + telemetry middleware on `/api/v1` | db/api | Logs tenant, endpoint, status, latency |
| [x] E22-02 | `GET /platform/usage`, `/usage/:tenantId`, `/usage/export` | shared/api | Aggregates bookings + API logs |
| [x] E22-03 | Analytics tab: KPIs, tenant table, bookings trend bars | web | Period filter 7/30/90d |
| [x] E23-01 | `Subscription` model + backfill migration; create on tenant register | db/api | One sub per tenant |
| [x] E23-02 | Billing subscription list, upgrade, suspend, refund endpoints | shared/api | Audit logged |
| [x] E23-03 | `GET /platform/billing/revenue` — MRR, churn, ARPU | shared/api | From subscriptions |
| [x] E23-04 | Billing tab: revenue KPIs + subscription table | web | Upgrade/suspend actions |
| [x] E24-02 | `GET /platform/health`, `/health/metrics` | shared/api | DB ping + log aggregates |
| [x] E24-03 | System tab: service status, uptime bars, recent errors | web | No external APM required |

---

## Epic E21/E23/E24/E25/E26 — Platform Admin Phase 3

**Goal:** Support tickets, alerts, invoicing, announcements, bulk tenant ops, audit export.  
**Depends on:** E20, E22–E24.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E21-05 | Bulk tenant suspend, CSV export, announcement from tenant list | shared/api/web | Checkbox selection + confirm |
| [x] E23-05 | `PlatformInvoice` model; list/download HTML invoice; mock payment retry | db/shared/api/web | Retry updates invoice status |
| [x] E24-04 | `PlatformAlert` model + threshold rules; acknowledge/resolve in System tab | db/shared/api/web | Auto-evaluates from API logs |
| [x] E25-01 | `SupportTicket` + `TicketMessage` models + migration | db | Relations to Tenant |
| [x] E25-02 | Support ticket CRUD/reply API | shared/api | Paginated list + detail |
| [x] E25-03 | Support tab: ticket list + thread modal | web | Reply, resolve, close |
| [x] E25-04 | `PlatformAnnouncement` model + send to all/selected tenants | shared/api/web | Stored with sentAt |
| [x] E26-04 | `GET /platform/audit-logs/export`; date range filters on Audit tab | shared/api/web | CSV download |

---

## Epic E27 — Real Payment Providers (bKash + SSLCommerz)

**Goal:** Replace mock payment with pluggable bKash/SSLCommerz adapters, tenant/system gateway config, wallet + withdrawals, platform subscription billing.  
**Depends on:** E08, E16, E23.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E27-01 | Prisma: providers, wallet, ledger, withdrawal, Payment extensions | db | Migration applied |
| [x] E27-02 | Credential encryption + provider credential Zod schemas | shared/api | AES-256-GCM at rest |
| [x] E27-03 | `payment.ports.ts` + registry + `GatewayResolver` | api | Tenant-own vs system fallback |
| [x] E27-04 | Platform system provider CRUD API | shared/api/web | SUPER_ADMIN configures gateways |
| [x] E27-05 | Tenant admin payment provider CRUD | shared/api/web | Only system-enabled codes |
| [x] E27-06 | SSLCommerz adapter + tests | api | Session + IPN verify |
| [x] E27-07 | bKash adapter | api | Token grant + checkout |
| [x] E27-08 | Extend `POST /payments/initiate` → redirect URL | shared/api/web | No mock confirm |
| [x] E27-09 | Webhook/callback → atomic confirm | api | Idempotent providerRef |
| [x] E27-10 | Wallet credit on system-route booking payment | api | Same transaction as ticket |
| [x] E27-11 | Web gateway picker + redirect flow | web | Mock gateway removed |
| [x] E27-12 | Tenant bank accounts + withdrawal requests | shared/api | PENDING workflow |
| [x] E27-13 | Platform withdrawal approve/reject/mark-paid | shared/api | Atomic wallet debit |
| [x] E27-14 | Admin + platform payment/wallet UI | web | Payments tab + billing |
| [x] E27-15 | Platform invoice pay via system gateway | shared/api/web | Replaces mock retry |
| [x] E27-16 | Remove mock payment paths; env `PAYMENT_CREDENTIALS_KEY` | api/docs | Prod requires encryption key |

---

## Epic E17 — SaaS Post-Migration Fixes

**Goal:** Fix tenant isolation gaps and misleading errors after E16 multi-tenancy rollout.  
**Depends on:** E16.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E17-01 | Route `@@unique([tenantId, slug])` and `@@unique([tenantId, fromStopId, toStopId])`; migration drops global uniques | db | Two tenants can share slug |
| [x] E17-04 | P2002 error handler maps `meta.target` / model to route, stop, coach, booking, CMS, generic messages | api | Route create no longer says "hold" |
| [x] E17-05 | Admin route create pre-check uses tenant-scoped slug + stop pair; distinct 409 messages | api | Same-tenant duplicate is clear |
| [x] E17-07 | Shared `buildApiHeaders()` / `resolveTenantSlug()` for web API calls | web | Single header builder |
| [x] E17-08 | CMS upload + `apiDownload` send `x-tenant-slug`; dev localhost reads `tenant-slug` cookie | web | CMS assets work on demo subdomain |
| [x] E17-10 | `seedTenantCmsDefaults(tenantId, companyName)` in `@repo/database` | db | Reusable DRAFT CMS seed |
| [x] E17-11 | `registerTenant` transaction seeds DRAFT profile/theme/footer | api | New tenant CMS preview works |

---

## Epic E18 — CMS Professional Overhaul

**Goal:** Remove hardcoded Shahzadpur fallbacks, fix tenant-aware public CMS SSR, dev bootstrap, demo seed branding, generic loader, upload previews, and admin CMS polish.  
**Depends on:** E15, E16, E17.

| ID | Task | Layer | Acceptance |
|----|------|-------|------------|
| [x] E18-01 | Server CMS fetch forwards `x-tenant-slug`; contract doc updated | web/docs | `demo.lvh.me` shows DB content |
| [x] E18-02 | Minimal neutral `cms-defaults`; BrandLogo/metadata/notifications generic | web/api | API down → no Shahzadpur bundle |
| [x] E18-03 | `cms-seed-data` → Demo Bus Company rich generic content | db | Seed matches tenant name |
| [x] E18-04 | `pnpm db:bootstrap` dev-only (migrate reset + wipe uploads + seed) | db/infra | Blocked in production |
| [x] E18-05 | Preview panel: tenant live URL iframe + full draft preview route | web | Published iframe ≠ admin host |
| [x] E18-06 | `CmsImageUploadField` with Object URL preview on upload panels | web | Thumbnail before upload completes |
| [x] E18-07 | Generic loading overlay (CSS vars, optional tenant logo) | web | No hardcoded `/images/logo` |
| [x] E18-08 | Search/booking/admin use `--primary` instead of fixed `--sp-green` | web | Theme picker affects flows |
| [x] E18-09 | CMS admin UI polish + `cms-ui-specialist` subagent | web | Professional admin CMS layout |
| [x] E18-10 | Tenant-scoped CMS assets `uploads/cms/{tenantId}/` + URL path | api | Assets isolated per tenant |

### E18 dependency order

```
E18-02 → E18-01 → E18-03 → E18-04 → E18-05 → E18-07 → E18-08 → E18-06 → E18-09 → E18-10
```

---

## Epic E19 — Public Site UI Redesign

Align tenant public site with [docs/UI-DESIGN-GUIDE.md](UI-DESIGN-GUIDE.md). Admin/counter/platform out of scope.

| ID | Task | Area | Done when |
|----|------|------|-----------|
| [x] E19-01 | Design tokens in `globals.css`; `framer-motion` + `lucide-react`; `PublicMotionProvider` | web | LazyMotion on public routes only |
| [x] E19-02 | Home header (single bar + scroll), hero animations, search widget polish | web | Sentence-case cities; pill toggles |
| [x] E19-03 | Home sections: promos, routes, stats, value props, payment, CTA, footer | web | Back-to-top; green footer |
| [x] E19-04 | Search: `--sp-red` removed; schedule card + filter chips redesign | web | Horizontal route card layout |
| [x] E19-05 | Seat map states/animation; hold timer SVG ring; checkout form tokens | web | Seat class visual distinction |
| [x] E19-06 | Booking, payment, confirmation page visual alignment | web | Two-column checkout layout CSS |
| [x] E19-07 | E-ticket boarding pass; ticket lookup; customer dashboard empty state | web | CMS company name on ticket |
| [x] E19-08 | Shared `ui/form.css` primitives; Lucide sweep; `FEATURES.md` epic | web | Global reduced-motion rule |

---

## Suggested Implementation Order

```
E00 → E02 → E03 → E04 → E05 → E06 → E07 → E08 → E09
                ↘ E01 (parallel after E00)
E04 + E06 → E10
E08 + E10 → E11
E12 last
E14 (P0→P1→P2→P3→P4) — after E08/E10/E11; P0 before production
E15 — after E02 + E01; start E15-01 after MVP or parallel with E14 P4
E16 — after E15; SaaS multi-tenancy
E20 — after E16; platform admin dashboard Phase 1
E17 — after E16; post-migration fixes (routes, headers, CMS defaults)
E18 — after E17; CMS professional overhaul
```

---

## User Story Traceability

| User story | Epics |
|------------|-------|
| Search buses with filters | E05 |
| View schedule card + select seat | E05, E06 |
| Pay and get ticket | E07, E08, E09 |
| Download without login | E09 |
| Login + history | E01, E07 |
| Counter sell/change/refund/cancel | E10, E14 |
| Counter/admin scheduling | E04, E10, E14 |
| Admin reports | E11, E14 |
| Guest purchase (no account) | E01, E07, E14 (must preserve) |
| Counter-only refund at desk | E10, E14 |
| Flat fare (all seat classes) | E14 |
| Admin sets company name and logo | E15 |
| Admin edits policies / terms | E15 |
| Admin edits about / contact | E15 |
| Admin manages hero and featured images | E15 |
| Admin curates home available routes | E15 |
| Admin manages footer | E15 |
| Admin picks brand color + font; system generates palette | E15 |
| Admin previews CMS before go-live | E15 |

---

## Micro-Task Sizing Guide

| Size | Guideline |
|------|-----------|
| **S** | Schema + Zod only, or single endpoint |
| **M** | Endpoint + service + repo |
| **L** | Full vertical slice (API + UI) — split if > 400 LOC |

When a task feels too large, split into: `(db) → (api) → (web)`.
