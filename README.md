# Online Bus Ticket Platform

A full-stack bus ticketing platform for online booking, counter point-of-sale, and back-office operations. Built as a **modular monolith** with contract-first APIs, shared validation, and a clear path toward service extraction if you need to scale out later.

---

## Overview

The platform supports three audiences:

| Audience | What they can do |
|----------|------------------|
| **Passengers** | Search trips, select seats, book as a guest or logged-in user, pay online, and download tickets |
| **Counter sellers** | Sell, change, refund, and cancel tickets; create and manage schedules |
| **Administrators** | Configure stops, routes, coaches, seat layouts, boarding points; view sales reports and analytics |

Default timezone for trip dates is **Asia/Dhaka**. Payment uses a **mock provider** suitable for development; the API is designed for swappable payment adapters.

---

## Features

### Public booking

- Route search with filters (bus type, time period, seat class)
- Results at `/search/[routeSlug]/[date]` with shareable query parameters
- Interactive seat map with holds (TTL), boarding point selection, and live pricing
- Guest checkout (phone required) or authenticated booking history on `/dashboard`
- Mock SSLCommerz-style payment flow and branded e-ticket confirmation
- Ticket lookup and download by passenger number + phone (`/ticket`)

### Counter POS (`/counter`)

- Quick search and walk-in sales (cash or recorded online)
- Schedule create, reschedule, and cancel
- Change, refund, and cancel with audit trail
- Shift-style transaction history

### Admin (`/admin`)

- CRUD for stops, routes, coaches, seat layouts, and boarding points
- Schedule management
- Sales reports, KPI overview, and CSV export

### API & quality

- Versioned REST API under `/api/v1`
- Zod schemas and DTOs in `packages/shared`; per-endpoint specs in `docs/contracts/`
- OpenAPI (Swagger) UI at `/api-docs` when the API is running
- Role-based access control for admin and counter routes

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Monorepo | pnpm workspaces + Turborepo |
| API | Express 5 (modular monolith) |
| Web | Next.js 15 (App Router) |
| Database | PostgreSQL 15 |
| ORM | Prisma 6 |
| Validation | Zod (`@repo/shared`) |
| Auth | JWT (httpOnly cookies on web) |
| Tests | Vitest (API) |

---

## Architecture

```
apps/web          →  HTTP  →  apps/api  →  packages/database (Prisma)  →  PostgreSQL
                              ↑
                    packages/shared (Zod schemas, DTOs, errors)
```

Bounded contexts in the API include **identity**, **schedule**, **booking**, **payment**, **counter**, and **admin**. Modules follow **routes → controller → service → repository**; cross-module access goes through services, not foreign repositories.

For diagrams, module boundaries, and scaling notes, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.15+ (`corepack enable` recommended)
- **Docker** (for local PostgreSQL and Redis)

---

## Quick start

```bash
# Clone and install
git clone <repository-url>
cd online-bus-ticket
pnpm install

# Environment
cp .env.example .env

# Database
pnpm db:up
pnpm db:migrate
pnpm db:seed

# Run API + web (Turborepo)
pnpm dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API health | http://localhost:4000/api/v1/health |
| Swagger UI | http://localhost:4000/api-docs |

### Seed accounts

Password for both users: `password123`

| Role | Phone | Use |
|------|-------|-----|
| Admin | `01700000001` | `/admin`, full API access |
| Counter seller | `01700000002` | `/counter`, POS and scheduling |

Sample route in seed data: **Dhaka (Gabtoli) → Pabna** (`dhaka-pabna`).

---

## Environment variables

Copy `.env.example` to `.env` at the repository root:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs (change in production) |
| `API_PORT` | API listen port (default `4000`) |
| `API_URL` | Base URL for server-side API calls |
| `NEXT_PUBLIC_API_URL` | Base URL exposed to the Next.js client |
| `NODE_ENV` | `development` or `production` |
| `REDIS_URL` | Redis for BullMQ notification jobs (default `redis://localhost:6379`) |
| `TWILIO_*` | Twilio SMS credentials |
| `SMTP_*` | Nodemailer SMTP settings |

After payment, ticket SMS (Twilio) and email with PNG (Nodemailer) are sent via a **BullMQ** worker. See `.env.example` for all notification variables.

**Notifications not arriving?**

1. Run `pnpm db:migrate` — requires `notification_logs` table (BullMQ jobs fail without it).
2. Ensure Redis is up: `pnpm db:up` (includes Redis).
3. Check API logs for `Notification job failed` or query `notification_logs` in the DB.
4. **Twilio:** `TWILIO_FROM_NUMBER` must belong to your Twilio account (error 21660 = mismatch). Trial accounts must verify destination numbers.
5. **Email:** check spam; Gmail needs an [App Password](https://support.google.com/accounts/answer/185833) in `SMTP_PASS`.
6. Retry a booking: `pnpm notifications:retry <bookingId>`

---

## Project structure

```
online-bus-ticket/
├── apps/
│   ├── api/                 # Express API (modules per bounded context)
│   └── web/                 # Next.js (public, counter, admin UIs)
├── packages/
│   ├── database/            # Prisma schema, migrations, seed
│   ├── shared/              # Zod schemas, DTOs, enums, AppError
│   └── config/              # Shared TypeScript config
├── docs/                    # Architecture, contracts, feature backlog
├── scripts/                 # Manual API test helpers
├── docker-compose.yml       # Local PostgreSQL + Redis
├── AGENTS.md                # Guidelines for AI-assisted development
└── turbo.json
```

---

## Scripts

Run from the repository root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API and web in development |
| `pnpm build` | Production build (all packages) |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Run tests (Turbo) |
| `pnpm test:api` | API unit/integration tests (Vitest) |
| `pnpm db:up` / `pnpm db:down` | Start/stop PostgreSQL + Redis containers |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:seed` | Load demo users, route, schedules |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm smoke` | Curl API health check |

---

## API documentation

- **Interactive docs:** http://localhost:4000/api-docs (with API running)
- **OpenAPI sources:** `apps/api/openapi/` — see [apps/api/openapi/README.md](apps/api/openapi/README.md)
- **Contract specs:** `docs/contracts/` — request/response shapes aligned with `packages/shared`

**Swagger quick test**

1. `POST /api/v1/auth/login` with admin phone and password above.
2. Copy `data.token` from the response.
3. **Authorize** → **bearerAuth** → paste the JWT.
4. Call protected routes (e.g. `GET /api/v1/admin/stops`).

Responses use a consistent envelope: `{ "data": ... }` on success and `{ "error": { "code", "message" } }` on failure.

---

## Development

### Contract-first workflow

For any HTTP or shared-type change:

1. Add or update Zod schemas in `packages/shared`
2. Document the endpoint in `docs/contracts/` when applicable
3. Implement API and/or web against those contracts

Details: [docs/CONTRACTS.md](docs/CONTRACTS.md).

### Implementation backlog

Features are tracked as epics and micro-tasks in [docs/FEATURES.md](docs/FEATURES.md) (e.g. `E05-03`). Prefer one micro-task per change set.

### Commits

Follow [Conventional Commits](docs/GIT-WORKFLOW.md), for example:

```
feat(booking): add seat hold expiry job
fix(api): reject past trip dates on search
chore(web): add ESLint flat config
```

### Contributing with AI tools

See [AGENTS.md](AGENTS.md) for repository rules, module boundaries, and the expected implementation order.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, modules, data flows |
| [docs/CONTRACTS.md](docs/CONTRACTS.md) | Contract-first workflow |
| [docs/contracts/](docs/contracts/) | Per-endpoint HTTP specifications |
| [docs/DESIGN-PRINCIPLES.md](docs/DESIGN-PRINCIPLES.md) | Quality bar and conventions |
| [docs/FEATURES.md](docs/FEATURES.md) | Epic backlog and task checklist |
| [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md) | Branching and PR conventions |
| [AGENTS.md](AGENTS.md) | AI agent implementation guide |

---

## Domain highlights

- Trip **date** must be today or later (validated on the server).
- Seat lifecycle: `AVAILABLE` → `HELD` (time-limited) → `SOLD`, or direct `SOLD` at the counter.
- **Guest bookings** store `userId` as null; phone is required for ticket lookup.
- **Ticket download** requires matching passenger number and phone (generic 404 on mismatch).
- Search filters (`busType`, `timePeriod`, `seatClass`) combine with **AND** logic.

---

## License

Private project. All rights reserved unless otherwise stated by the repository owner.
