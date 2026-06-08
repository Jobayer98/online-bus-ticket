# Documentation

Canonical project documentation for the Online Bus Ticket platform.

## Start here

| Document | Purpose |
|----------|---------|
| [../AGENTS.md](../AGENTS.md) | Rules and workflow for AI agents and contributors |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Modular monolith boundaries, flows, data model |
| [CONTRACTS.md](CONTRACTS.md) | Contract-first HTTP and shared-type workflow |
| [FEATURES.md](FEATURES.md) | Epics, micro-tasks, and progress checkboxes |
| [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md) | Engineering quality bar (API, UX, security) |
| [GIT-WORKFLOW.md](GIT-WORKFLOW.md) | Branches, commits, and PR conventions |

## API contracts

Per-endpoint specs live under [contracts/](contracts/), grouped by module (`booking`, `schedule`, `admin`, `platform`, etc.).  
Add or update the Zod schema in `packages/shared` first, then the matching markdown contract, then implement API/web.

## Web UI styling

The tenant web app (`apps/web`) uses **Tailwind CSS v4** with design tokens in `apps/web/src/app/globals.css`.  
CMS brand colors are applied at runtime via CSS variables from the site theme bundle.
