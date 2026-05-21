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

## Suggested Implementation Order

```
E00 → E02 → E03 → E04 → E05 → E06 → E07 → E08 → E09
                ↘ E01 (parallel after E00)
E04 + E06 → E10
E08 + E10 → E11
E12 last
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
| Counter sell/change/refund/cancel | E10 |
| Counter/admin scheduling | E04, E10 |
| Admin reports | E11 |

---

## Micro-Task Sizing Guide

| Size | Guideline |
|------|-----------|
| **S** | Schema + Zod only, or single endpoint |
| **M** | Endpoint + service + repo |
| **L** | Full vertical slice (API + UI) — split if > 400 LOC |

When a task feels too large, split into: `(db) → (api) → (web)`.
