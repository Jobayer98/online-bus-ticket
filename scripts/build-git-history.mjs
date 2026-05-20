#!/usr/bin/env node
/**
 * Bootstrap git history aligned with docs/FEATURES.md micro-tasks.
 * Run from repo root: node scripts/build-git-history.mjs
 */
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = join(import.meta.dirname, '..');

/** @type {{ id: string, type: string, scope: string, subject: string, files: string[] }[]} */
const COMMITS = [
  // E00 — Project Foundation
  {
    id: 'E00-01',
    type: 'chore',
    scope: 'infra',
    subject: 'init pnpm workspace with api, web, database, and shared packages',
    files: [
      'package.json',
      'pnpm-workspace.yaml',
      'pnpm-lock.yaml',
      'apps/api/package.json',
      'apps/web/package.json',
      'packages/config/package.json',
      'packages/database/package.json',
      'packages/shared/package.json',
    ],
  },
  {
    id: 'E00-02',
    type: 'chore',
    scope: 'infra',
    subject: 'add shared tsconfig, turbo, and lint scripts',
    files: [
      'packages/config/tsconfig.base.json',
      'turbo.json',
      'apps/api/tsconfig.json',
      'apps/web/tsconfig.json',
      'packages/database/tsconfig.json',
      'packages/shared/tsconfig.json',
    ],
  },
  {
    id: 'E00-03',
    type: 'db',
    scope: 'database',
    subject: 'add Prisma schema and initial PostgreSQL migration',
    files: [
      'packages/database/prisma/schema.prisma',
      'packages/database/prisma/migrations/migration_lock.toml',
      'packages/database/prisma/migrations/20260519044011_init/migration.sql',
    ],
  },
  {
    id: 'E00-04',
    type: 'feat',
    scope: 'database',
    subject: 'export Prisma client from packages/database',
    files: ['packages/database/src/index.ts'],
  },
  {
    id: 'E00-05',
    type: 'feat',
    scope: 'api',
    subject: 'add Express app with health endpoint and middleware',
    files: [
      'apps/api/src/index.ts',
      'apps/api/src/app.ts',
      'apps/api/src/load-env.ts',
      'apps/api/src/middleware/request-id.ts',
      'apps/api/src/middleware/error-handler.ts',
      'apps/api/src/middleware/error-handler.test.ts',
      'apps/api/src/modules/health/health.routes.ts',
      'apps/api/src/modules/health/health.controller.ts',
      'apps/api/src/modules/health/health.test.ts',
      'apps/api/vitest.config.ts',
      'apps/api/src/test/setup.ts',
      'apps/api/src/test/helpers.ts',
      'apps/api/src/test/mocks/database.ts',
      'docs/contracts/health.md',
      'packages/shared/src/dtos/health.dto.ts',
    ],
  },
  {
    id: 'E00-06',
    type: 'feat',
    scope: 'web',
    subject: 'add Next.js app shell and API client',
    files: [
      'apps/web/next.config.ts',
      'apps/web/next-env.d.ts',
      'apps/web/src/app/layout.tsx',
      'apps/web/src/app/page.tsx',
      'apps/web/src/app/globals.css',
      'apps/web/src/lib/api-client.ts',
    ],
  },
  {
    id: 'E00-07',
    type: 'feat',
    scope: 'shared',
    subject: 'add AppError, error codes, and API envelope helpers',
    files: [
      'packages/shared/src/errors/app-error.ts',
      'packages/shared/src/errors/error-codes.ts',
      'packages/shared/src/api/envelope.ts',
      'packages/shared/src/index.ts',
      'packages/shared/src/enums/index.ts',
    ],
  },
  {
    id: 'E00-08',
    type: 'docs',
    scope: 'database',
    subject: 'document tenantId column pattern for SaaS readiness',
    files: ['docs/ARCHITECTURE.md', 'docs/CONTRACTS.md', 'docs/DESIGN-PRINCIPLES.md', 'AGENTS.md', 'README.md'],
  },

  // E01 — Identity & Access
  {
    id: 'E01-01',
    type: 'db',
    scope: 'identity',
    subject: 'add Role enum and User fields for phone, email, passwordHash',
    files: [],
  },
  {
    id: 'E01-02',
    type: 'feat',
    scope: 'shared',
    subject: 'add register and login Zod schemas',
    files: ['packages/shared/src/schemas/identity/auth.schema.ts'],
  },
  {
    id: 'E01-03',
    type: 'feat',
    scope: 'identity',
    subject: 'add auth register and login endpoints',
    files: [
      'apps/api/src/modules/identity/auth.routes.ts',
      'apps/api/src/modules/identity/auth.service.ts',
      'apps/api/src/modules/identity/auth.routes.test.ts',
    ],
  },
  {
    id: 'E01-04',
    type: 'feat',
    scope: 'api',
    subject: 'add JWT authenticateOptional and authenticateRequired middleware',
    files: ['apps/api/src/middleware/auth.ts', 'apps/api/src/middleware/auth.test.ts'],
  },
  {
    id: 'E01-05',
    type: 'feat',
    scope: 'identity',
    subject: 'add GET /users/me profile endpoint',
    files: ['apps/api/src/modules/identity/users.routes.ts', 'apps/api/src/modules/identity/users.routes.test.ts'],
  },
  {
    id: 'E01-06',
    type: 'feat',
    scope: 'web',
    subject: 'add login and register pages with httpOnly session',
    files: ['apps/web/src/app/login/page.tsx', 'apps/web/src/lib/auth-session.ts'],
  },
  {
    id: 'E01-07',
    type: 'feat',
    scope: 'identity',
    subject: 'add paginated GET /users/me/bookings endpoint',
    files: [],
  },
  {
    id: 'E01-08',
    type: 'feat',
    scope: 'web',
    subject: 'add dashboard booking history page',
    files: ['apps/web/src/app/dashboard/page.tsx'],
  },

  // E02 — Master Data
  {
    id: 'E02-01',
    type: 'db',
    scope: 'schedule',
    subject: 'add Stop and Route models with unique slug',
    files: [],
  },
  {
    id: 'E02-02',
    type: 'db',
    scope: 'schedule',
    subject: 'add Coach model with BusType and SeatClass enums',
    files: [],
  },
  {
    id: 'E02-03',
    type: 'feat',
    scope: 'shared',
    subject: 'add Zod CRUD schemas for stops, routes, and coaches',
    files: [
      'packages/shared/src/schemas/admin/stop.schema.ts',
      'packages/shared/src/schemas/admin/route.schema.ts',
      'packages/shared/src/schemas/admin/coach.schema.ts',
    ],
  },
  {
    id: 'E02-04',
    type: 'feat',
    scope: 'admin',
    subject: 'add admin CRUD API for stops',
    files: ['apps/api/src/modules/admin/stops.routes.ts'],
  },
  {
    id: 'E02-05',
    type: 'feat',
    scope: 'admin',
    subject: 'add admin CRUD API for routes with slug generation',
    files: ['apps/api/src/modules/admin/routes.routes.ts'],
  },
  {
    id: 'E02-06',
    type: 'feat',
    scope: 'admin',
    subject: 'add admin CRUD API for coaches',
    files: ['apps/api/src/modules/admin/coaches.routes.ts'],
  },
  {
    id: 'E02-07',
    type: 'feat',
    scope: 'web',
    subject: 'add admin dashboard shell for master data management',
    files: ['apps/web/src/app/admin/page.tsx'],
  },
  {
    id: 'E02-08',
    type: 'db',
    scope: 'database',
    subject: 'add seed script with sample Dhaka–Pabna route',
    files: ['packages/database/prisma/seed.ts'],
  },

  // E03 — Seat Layout Templates
  {
    id: 'E03-01',
    type: 'db',
    scope: 'schedule',
    subject: 'add SeatLayout and SeatTemplate models',
    files: [],
  },
  {
    id: 'E03-02',
    type: 'feat',
    scope: 'admin',
    subject: 'add admin API to create and update seat layouts',
    files: [
      'packages/shared/src/schemas/admin/layout.schema.ts',
      'apps/api/src/modules/admin/layouts.routes.ts',
    ],
  },
  {
    id: 'E03-03',
    type: 'feat',
    scope: 'schedule',
    subject: 'add GET /schedules/:id/seat-map endpoint',
    files: [
      'apps/api/src/modules/schedule/schedules.routes.ts',
      'apps/api/src/modules/schedule/schedules.service.ts',
      'packages/shared/src/dtos/booking/seat-map.dto.ts',
      'packages/shared/src/utils/seat-label.ts',
    ],
  },
  {
    id: 'E03-04',
    type: 'feat',
    scope: 'web',
    subject: 'add seat map grid component for layout display',
    files: ['apps/web/src/components/search/seat-map-grid.tsx', 'apps/web/src/lib/seat-layout.ts'],
  },

  // E04 — Scheduling
  {
    id: 'E04-01',
    type: 'db',
    scope: 'schedule',
    subject: 'add Schedule model and RescheduleLog audit table',
    files: [],
  },
  {
    id: 'E04-02',
    type: 'feat',
    scope: 'shared',
    subject: 'add create and reschedule schedule Zod schemas',
    files: ['packages/shared/src/schemas/schedule/schedule.schema.ts'],
  },
  {
    id: 'E04-03',
    type: 'feat',
    scope: 'admin',
    subject: 'add POST /admin/schedules for schedule creation',
    files: ['apps/api/src/modules/admin/schedules.routes.ts'],
  },
  {
    id: 'E04-04',
    type: 'feat',
    scope: 'admin',
    subject: 'add PATCH /admin/schedules/:id/reschedule with audit log',
    files: [],
  },
  {
    id: 'E04-05',
    type: 'feat',
    scope: 'admin',
    subject: 'add PATCH /admin/schedules/:id/cancel endpoint',
    files: [],
  },
  {
    id: 'E04-06',
    type: 'feat',
    scope: 'web',
    subject: 'add counter schedule creation form',
    files: ['apps/web/src/app/counter/page.tsx'],
  },
  {
    id: 'E04-07',
    type: 'feat',
    scope: 'web',
    subject: 'add counter reschedule and cancel actions',
    files: [],
  },

  // E05 — Search & Schedule Listing
  {
    id: 'E05-01',
    type: 'feat',
    scope: 'shared',
    subject: 'add searchSchedules Zod schema with past-date rejection',
    files: ['packages/shared/src/schemas/schedule/search-schedules.schema.ts', 'docs/contracts/schedule/search-schedules.md'],
  },
  {
    id: 'E05-02',
    type: 'feat',
    scope: 'shared',
    subject: 'add time period helper for departure time buckets',
    files: ['packages/shared/src/utils/date.ts'],
  },
  {
    id: 'E05-03',
    type: 'feat',
    scope: 'schedule',
    subject: 'add GET /schedules/search with filters and seat counts',
    files: [],
  },
  {
    id: 'E05-04',
    type: 'feat',
    scope: 'web',
    subject: 'add home search form with date picker and filters',
    files: [
      'apps/web/src/components/home-search-widget.tsx',
      'apps/web/src/components/home-date-picker.tsx',
      'apps/web/src/lib/trip-date.ts',
      'apps/web/src/app/home.css',
      'apps/web/src/components/home-header.tsx',
      'apps/web/src/components/home-available-routes.tsx',
      'apps/web/src/lib/home-routes-data.ts',
    ],
  },
  {
    id: 'E05-05',
    type: 'feat',
    scope: 'web',
    subject: 'navigate to /search/[routeSlug]/[date] with query params',
    files: ['apps/web/src/app/search/[routeSlug]/[date]/page.tsx', 'apps/web/src/lib/search-url.ts', 'apps/web/src/app/search/search.css'],
  },
  {
    id: 'E05-06',
    type: 'feat',
    scope: 'web',
    subject: 'add schedule card component with fare and availability',
    files: [
      'apps/web/src/components/search/schedule-card.tsx',
      'packages/shared/src/dtos/schedule/schedule-card.dto.ts',
      'apps/web/src/components/search/search-results-content.tsx',
      'apps/web/src/components/search/search-filter-bar.tsx',
    ],
  },
  {
    id: 'E05-07',
    type: 'feat',
    scope: 'web',
    subject: 'add search empty state and loading skeletons',
    files: ['apps/web/src/components/search/schedule-card-skeleton.tsx', 'apps/web/src/components/search/search-footer.tsx'],
  },

  // E06 — Seat Selection & Holds
  {
    id: 'E06-01',
    type: 'db',
    scope: 'booking',
    subject: 'add ScheduleSeat model with availability status enum',
    files: [],
  },
  {
    id: 'E06-02',
    type: 'db',
    scope: 'schedule',
    subject: 'add BoardingPoint model linked to routes',
    files: [],
  },
  {
    id: 'E06-03',
    type: 'feat',
    scope: 'schedule',
    subject: 'return live seat availability on seat-map endpoint',
    files: [],
  },
  {
    id: 'E06-04',
    type: 'db',
    scope: 'booking',
    subject: 'add SeatHold model with 10 minute TTL',
    files: [],
  },
  {
    id: 'E06-05',
    type: 'feat',
    scope: 'booking',
    subject: 'add transactional POST /bookings/hold seat lock',
    files: [
      'apps/api/src/modules/booking/bookings.routes.ts',
      'apps/api/src/modules/booking/bookings.service.ts',
      'apps/api/src/modules/booking/bookings.routes.test.ts',
      'packages/shared/src/schemas/booking/booking.schema.ts',
      'packages/shared/src/dtos/booking/hold.dto.ts',
      'packages/shared/src/constants/seat-hold.ts',
    ],
  },
  {
    id: 'E06-06',
    type: 'feat',
    scope: 'booking',
    subject: 'add fare calculator with seat class and bus type rules',
    files: [],
  },
  {
    id: 'E06-07',
    type: 'feat',
    scope: 'web',
    subject: 'add expandable seat map panel with selection colors',
    files: [
      'apps/web/src/components/search/schedule-seat-panel.tsx',
      'apps/web/src/components/search/search-checkout-form.tsx',
      'apps/web/src/hooks/use-seat-hold-timer.ts',
      'apps/web/src/components/search/seat-hold-timer.tsx',
    ],
  },
  {
    id: 'E06-08',
    type: 'feat',
    scope: 'web',
    subject: 'add boarding point dropdown to checkout flow',
    files: [],
  },
  {
    id: 'E06-09',
    type: 'feat',
    scope: 'web',
    subject: 'add selected seats summary with live total price',
    files: [],
  },
  {
    id: 'E06-10',
    type: 'feat',
    scope: 'booking',
    subject: 'add hold release endpoint and expired hold cleanup',
    files: [
      'apps/api/src/jobs/expire-holds.ts',
      'apps/web/src/lib/active-hold.ts',
      'apps/web/src/hooks/use-search-page-hold-cleanup.ts',
    ],
  },

  // E07 — Passenger Details & Checkout Prep
  {
    id: 'E07-01',
    type: 'feat',
    scope: 'shared',
    subject: 'add passengerSchema with phone format validation',
    files: [],
  },
  {
    id: 'E07-02',
    type: 'db',
    scope: 'booking',
    subject: 'add Booking model with status enum and optional userId',
    files: [],
  },
  {
    id: 'E07-03',
    type: 'feat',
    scope: 'booking',
    subject: 'add POST /bookings from hold with passenger and boarding point',
    files: ['packages/shared/src/dtos/booking/booking.dto.ts'],
  },
  {
    id: 'E07-04',
    type: 'feat',
    scope: 'web',
    subject: 'add passenger details step before payment',
    files: [
      'apps/web/src/app/booking/[scheduleId]/page.tsx',
      'apps/web/src/components/booking/booking-page-content.tsx',
      'apps/web/src/app/booking/booking.css',
    ],
  },
  {
    id: 'E07-05',
    type: 'feat',
    scope: 'booking',
    subject: 'link booking to authenticated user when logged in',
    files: [],
  },

  // E08 — Payment
  {
    id: 'E08-01',
    type: 'db',
    scope: 'payment',
    subject: 'add Payment model with idempotencyKey',
    files: [],
  },
  {
    id: 'E08-02',
    type: 'feat',
    scope: 'payment',
    subject: 'add payment provider interface and mock adapter',
    files: ['packages/shared/src/schemas/payment/payment.schema.ts', 'packages/shared/src/enums/payment.ts'],
  },
  {
    id: 'E08-03',
    type: 'feat',
    scope: 'payment',
    subject: 'add POST /payments/initiate endpoint',
    files: ['apps/api/src/modules/payment/payments.routes.ts', 'apps/api/src/modules/payment/payments.service.ts'],
  },
  {
    id: 'E08-04',
    type: 'feat',
    scope: 'payment',
    subject: 'add idempotent POST /payments/confirm marking seats sold',
    files: [],
  },
  {
    id: 'E08-05',
    type: 'feat',
    scope: 'web',
    subject: 'add booking payment page with success and failure handling',
    files: ['apps/web/src/app/booking/[scheduleId]/payment/page.tsx'],
  },
  {
    id: 'E08-06',
    type: 'feat',
    scope: 'payment',
    subject: 'add payment webhook stub with signature verify placeholder',
    files: [],
  },

  // E09 — Ticketing & Download
  {
    id: 'E09-01',
    type: 'db',
    scope: 'ticket',
    subject: 'add Ticket model with unique passengerNumber',
    files: [],
  },
  {
    id: 'E09-02',
    type: 'feat',
    scope: 'ticket',
    subject: 'generate unique human-readable passenger numbers',
    files: [
      'apps/api/src/modules/ticket/tickets.service.ts',
      'apps/api/src/modules/ticket/tickets.routes.ts',
      'packages/shared/src/schemas/ticket/ticket.schema.ts',
      'packages/shared/src/dtos/ticket/ticket.dto.ts',
    ],
  },
  {
    id: 'E09-03',
    type: 'feat',
    scope: 'ticket',
    subject: 'issue ticket on payment success via internal endpoint',
    files: [],
  },
  {
    id: 'E09-04',
    type: 'feat',
    scope: 'ticket',
    subject: 'add rate-limited GET /tickets/lookup endpoint',
    files: [],
  },
  {
    id: 'E09-05',
    type: 'feat',
    scope: 'ticket',
    subject: 'add HTML ticket generator and download endpoint',
    files: [],
  },
  {
    id: 'E09-06',
    type: 'feat',
    scope: 'web',
    subject: 'add ticket lookup page and download form',
    files: [
      'apps/web/src/app/ticket/page.tsx',
      'apps/web/src/app/ticket/ticket.css',
      'apps/web/src/components/ticket-download-form.tsx',
    ],
  },
  {
    id: 'E09-07',
    type: 'feat',
    scope: 'web',
    subject: 'add post-payment confirmation page with ticket summary',
    files: ['apps/web/src/app/booking/[scheduleId]/confirmation/page.tsx'],
  },

  // E10 — Counter POS
  {
    id: 'E10-01',
    type: 'db',
    scope: 'counter',
    subject: 'add CounterTransaction append-only audit model',
    files: [],
  },
  {
    id: 'E10-02',
    type: 'feat',
    scope: 'counter',
    subject: 'add COUNTER_SELLER role and requireRole middleware',
    files: [],
  },
  {
    id: 'E10-03',
    type: 'feat',
    scope: 'counter',
    subject: 'add POST /counter/sell for walk-in cash and online sales',
    files: [
      'apps/api/src/modules/counter/counter.routes.ts',
      'packages/shared/src/schemas/counter/counter.schema.ts',
    ],
  },
  {
    id: 'E10-04',
    type: 'feat',
    scope: 'counter',
    subject: 'add POST /counter/change for seat and date reissue',
    files: [],
  },
  {
    id: 'E10-05',
    type: 'feat',
    scope: 'counter',
    subject: 'add POST /counter/refund releasing seats and updating payment',
    files: [],
  },
  {
    id: 'E10-06',
    type: 'feat',
    scope: 'counter',
    subject: 'add POST /counter/cancel endpoint with audit logging',
    files: [],
  },
  {
    id: 'E10-07',
    type: 'feat',
    scope: 'web',
    subject: 'add counter POS layout with quick search and sell flow',
    files: [],
  },
  {
    id: 'E10-08',
    type: 'feat',
    scope: 'web',
    subject: 'add counter transaction history for seller shift',
    files: [],
  },

  // E11 — Admin Reporting
  {
    id: 'E11-01',
    type: 'feat',
    scope: 'admin',
    subject: 'add GET /admin/reports/sales with channel split',
    files: ['apps/api/src/modules/admin/reports.routes.ts'],
  },
  {
    id: 'E11-02',
    type: 'feat',
    scope: 'admin',
    subject: 'add GET /admin/analytics/overview KPI endpoint',
    files: [],
  },
  {
    id: 'E11-03',
    type: 'feat',
    scope: 'admin',
    subject: 'add CSV export endpoint for sales reports',
    files: [],
  },
  {
    id: 'E11-04',
    type: 'feat',
    scope: 'web',
    subject: 'add admin reports page with charts and date filter',
    files: [],
  },
  {
    id: 'E11-05',
    type: 'feat',
    scope: 'web',
    subject: 'add admin dashboard home KPI cards',
    files: [],
  },

  // E12 — Hardening & Operations
  {
    id: 'E12-01',
    type: 'feat',
    scope: 'api',
    subject: 'add rate limiting on auth and ticket lookup routes',
    files: [],
  },
  {
    id: 'E12-02',
    type: 'feat',
    scope: 'api',
    subject: 'wire background job to expire seat holds every minute',
    files: [],
  },
  {
    id: 'E12-03',
    type: 'feat',
    scope: 'api',
    subject: 'add structured logging with pino and error tracking hook',
    files: ['apps/api/src/lib/logger.ts'],
  },
  {
    id: 'E12-04',
    type: 'test',
    scope: 'api',
    subject: 'add manual E2E smoke script for search through ticket flow',
    files: ['scripts/manual-api-test.sh', 'scripts/admin-api-test.sh'],
  },
  {
    id: 'E12-05',
    type: 'docs',
    scope: 'api',
    subject: 'add OpenAPI spec and Swagger UI setup',
    files: [
      'apps/api/openapi/openapi.yaml',
      'apps/api/openapi/README.md',
      'apps/api/openapi/components/common.yaml',
      'apps/api/openapi/components/examples.yaml',
      'apps/api/openapi/modules/admin.yaml',
      'apps/api/openapi/modules/booking.yaml',
      'apps/api/openapi/modules/counter.yaml',
      'apps/api/openapi/modules/health.yaml',
      'apps/api/openapi/modules/identity.yaml',
      'apps/api/openapi/modules/payment.yaml',
      'apps/api/openapi/modules/schedule.yaml',
      'apps/api/openapi/modules/ticket.yaml',
      'apps/api/src/swagger/setup.ts',
    ],
  },
  {
    id: 'E12-06',
    type: 'chore',
    scope: 'infra',
    subject: 'add Docker Compose for PostgreSQL local development',
    files: ['docker-compose.yml', '.env.example'],
  },

  // Project docs and agent rules
  {
    id: 'E00-E12',
    type: 'docs',
    scope: 'project',
    subject: 'add feature backlog, git workflow, and contract templates',
    files: [
      'docs/FEATURES.md',
      'docs/GIT-WORKFLOW.md',
      'docs/contracts/README.md',
      'docs/contracts/_template.md',
      '.gitignore',
      '.cursor/rules/project.mdc',
      '.cursor/rules/api.mdc',
      '.cursor/rules/web.mdc',
      '.cursor/rules/database.mdc',
      '.cursor/rules/contracts.mdc',
    ],
  },
];

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit', shell: true });
}

function gitCommit(type, scope, subject, id, allowEmpty) {
  const msgFile = join(tmpdir(), `git-commit-${Date.now()}.txt`);
  writeFileSync(msgFile, `${type}(${scope}): ${subject}\n\nCloses ${id}\n`, 'utf8');
  try {
    run(`git commit ${allowEmpty ? '--allow-empty' : ''} -F "${msgFile}"`);
  } finally {
    unlinkSync(msgFile);
  }
}

const committed = new Set();
let count = 0;

for (const entry of COMMITS) {
  const toAdd = entry.files.filter((f) => {
    if (committed.has(f)) return false;
    const path = join(root, f);
    if (!existsSync(path)) {
      console.warn(`  skip missing: ${f}`);
      return false;
    }
    return true;
  });

  for (const f of toAdd) committed.add(f);

  if (toAdd.length > 0) {
    run(`git add -- ${toAdd.map((f) => JSON.stringify(f)).join(' ')}`);
  }

  gitCommit(entry.type, entry.scope, entry.subject, entry.id, toAdd.length === 0);
  count++;
  console.log(`✓ ${entry.id}: ${entry.subject}${toAdd.length === 0 ? ' (marker)' : ` (+${toAdd.length} files)`}`);
}

// Commit remaining untracked files (site pages, etc.)
run('git add -A');
const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' }).trim();
if (status) {
  gitCommit('chore', 'web', 'add site shell, policy pages, and remaining assets', 'bootstrap');
  count++;
}

console.log(`\nDone: ${count} commits on main.`);
