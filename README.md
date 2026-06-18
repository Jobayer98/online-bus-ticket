# Online Bus Ticket Platform

Multi-tenant bus ticketing SaaS: public online booking, counter POS, and admin back-office. Each bus company is isolated by tenant and served on a subdomain. The codebase is a **modular monolith** (Express API + Next.js web) with contract-first APIs in `packages/shared`. Trip dates use **Asia/Dhaka**; payment uses a **mock provider** in development.

Architecture and module boundaries: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.15+ (`corepack enable` recommended)
- **Docker** (PostgreSQL and Redis for local dev)

---

## Quick start

```bash
git clone <repository-url>
cd online-bus-ticket
pnpm install

cp .env.example .env

pnpm db:up
pnpm db:migrate
pnpm db:seed

pnpm dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API health | http://localhost:4100/api/v1/health |
| Swagger UI | http://localhost:4100/api-docs |

**Dev-only reset:** `pnpm db:bootstrap` wipes the DB, clears CMS uploads, and reseeds the demo tenant.

---

## Seed accounts

Password for all users: `password123`

| Role | Phone | Where |
|------|-------|-------|
| Super Admin | `01700000000` | `/platform/login` → `/platform` (main domain) |
| Admin | `01700000001` | `/admin` (demo tenant) |
| Counter seller | `01700000002` | `/counter` (demo tenant) |

Sample route in seed data: **Dhaka (Gabtoli) → Pabna** (`dhaka-pabna`).

---

## Multi-tenant local dev

Tenants are resolved from the subdomain. Use **[lvh.me](http://lvh.me)** — `*.lvh.me` resolves to `127.0.0.1` with no hosts file changes. Middleware defaults to `NEXT_PUBLIC_MAIN_DOMAIN=lvh.me:3000` when unset.

| URL | Purpose |
|-----|---------|
| http://demo.lvh.me:3000 | Demo tenant public site |
| http://lvh.me:3000/onboarding | Self-service tenant signup |
| http://lvh.me:3000/platform/login | Platform super admin |

Register a new tenant via API:

```bash
curl -X POST http://localhost:4100/api/v1/platform/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "My Bus Co",
    "slug": "mybusco",
    "ownerName": "Rahim",
    "ownerPhone": "01800000001",
    "ownerPassword": "password123"
  }'
```

Then open http://mybusco.lvh.me:3000.

---

## Environment

Copy [`.env.example`](.env.example) to `.env` at the repo root. Required vars cover the database, JWT, and API/web URLs. Optional integrations (Redis/BullMQ notifications, Twilio, SMTP, Cloudinary CMS storage) are documented inline in that file.

---

## Stack

TypeScript · pnpm workspaces + Turborepo · Express 5 · Next.js 15 (App Router) · PostgreSQL · Prisma 6 · Zod (`@repo/shared`) · Vitest (API)

---

## Repository layout

```
online-bus-ticket/
├── apps/
│   ├── api/                 # Express API (modules per bounded context)
│   └── web/                 # Next.js (public, counter, admin, platform)
├── packages/
│   ├── database/            # Prisma schema, migrations, seed
│   ├── shared/              # Zod schemas, DTOs, enums, AppError
│   └── config/              # Shared TypeScript config
├── docs/                    # Architecture, contracts, feature backlog
├── scripts/                 # Manual API test helpers
├── docker-compose.yml       # Local PostgreSQL + Redis
├── AGENTS.md                # AI agent / contributor rules
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
| `pnpm db:bootstrap` | Dev only: reset DB, clear CMS uploads, reseed |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm smoke` | Curl API health check |
| `pnpm notifications:retry <bookingId>` | Retry failed booking notification job |

---

## Documentation

Full doc index: [docs/README.md](docs/README.md).

| Topic | Document |
|-------|----------|
| System design | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Contract-first workflow | [docs/CONTRACTS.md](docs/CONTRACTS.md) |
| HTTP endpoint specs | [docs/contracts/](docs/contracts/) |
| Feature backlog | [docs/FEATURES.md](docs/FEATURES.md) |
| OpenAPI / Swagger | [apps/api/openapi/README.md](apps/api/openapi/README.md) |
| AI-assisted development | [AGENTS.md](AGENTS.md) |

---

## License

Private project. All rights reserved unless otherwise stated by the repository owner.
