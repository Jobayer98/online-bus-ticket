# Online Bus Ticket Platform (SaaS)

A multi-tenant-ready bus ticketing platform: public booking (guest or logged-in), counter POS, and admin operations.

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/CONTRACTS.md](docs/CONTRACTS.md) | Contract-first workflow (Zod + per-endpoint specs) |
| [docs/contracts/](docs/contracts/) | HTTP endpoint contract documents |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, modules, API boundaries, scaling path |
| [docs/DESIGN-PRINCIPLES.md](docs/DESIGN-PRINCIPLES.md) | Code quality, layering, testing, reliability |
| [docs/FEATURES.md](docs/FEATURES.md) | Independent epics + micro-tasks (implementation backlog) |
| [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md) | Branching, commits, PR conventions |
| [AGENTS.md](AGENTS.md) | Rules and workflow for AI coding agents |

## Tech Stack

- **Runtime:** TypeScript
- **API:** Express (modular monolith)
- **Web:** Next.js (App Router)
- **Database:** PostgreSQL + Prisma 7
- **Validation:** Zod (shared schemas)

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- **API:** http://localhost:4000/api/v1/health  
- **Web:** http://localhost:3000  
- **Admin:** `01700000001` / `password123`  
- **Counter:** `01700000002` / `password123`

## Roles

| Role | Capabilities |
|------|----------------|
| **Guest / User** | Search, book (no login), pay, download ticket; optional login + history dashboard |
| **Counter seller** | Sell, change, refund, cancel; scheduling & rescheduling |
| **Admin** | Full access + sales reports & analytics |
