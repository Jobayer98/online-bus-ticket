# SaaS Platform Admin — Implementation Roadmap

## Overview

This document breaks down the platform admin dashboard into implementable epics and micro-tasks, aligned with your existing project structure and design principles.

**Target:** Multi-tenant SaaS admin interface for managing all bus companies, monitoring platform health, and handling billing/support.

---

## Epic E20 — Platform Admin Foundation

**Goal:** Basic multi-tenant admin UI with tenant CRUD and overview dashboard.  
**Depends on:** E00, E01, E16 (multi-tenant support).

### E20-01: Create SUPER_ADMIN role & middleware

- [ ] Add `SUPER_ADMIN` to `Role` enum in Prisma
- [ ] Middleware: `requireRole('SUPER_ADMIN')` in API
- [ ] Prevent SUPER_ADMIN from accessing tenant-specific routes
- [ ] Update JWT payload to include role

### E20-02: Platform admin routes structure

- [ ] `POST /api/v1/platform/register` — self-service tenant registration
- [ ] `GET /api/v1/platform/tenants` — list all tenants (paginated, filterable)
- [ ] `POST /api/v1/platform/tenants` — admin-create tenant (no owner user)
- [ ] `GET /api/v1/platform/tenants/:id` — single tenant detail
- [ ] `PATCH /api/v1/platform/tenants/:id` — update plan/status
- [ ] Update `packages/shared` with `TenantDto`, `CreateTenantSchema`, etc.

### E20-03: Platform admin login page

- [ ] `/admin/platform/login` page (same as tenant admin but for SUPER_ADMIN)
- [ ] Email + password login (SUPER_ADMIN users created manually or via seed)
- [ ] JWT token storage (same as tenant admin)

### E20-04: Platform admin dashboard shell

- [ ] `/admin/platform` main layout (similar to existing admin, but platform-level tabs)
- [ ] Tabs: Overview, Tenants, Usage, Billing, System, Audit
- [ ] Header: "Platform Admin" badge, SUPER_ADMIN email, Dhaka time, logout
- [ ] Navigation: clean tab UI matching existing admin CSS

### E20-05: Platform overview dashboard (MVP)

- [ ] KPI cards: Total MRR, Active Tenants, Monthly Bookings, Uptime
- [ ] Mock data initially (hardcoded or seeded)
- [ ] Implement `GET /api/v1/platform/dashboard/overview` endpoint
- [ ] Charts: Revenue trend (line), Plan distribution (pie)
- [ ] Top 5 tenants table

**Acceptance:**

- [ ] Page loads without errors with mock SUPER_ADMIN token
- [ ] KPI cards render with correct format (৳ symbol, percentage indicators)
- [ ] Charts display (can use Chart.js or Recharts)
- [ ] Responsive on mobile/tablet

---

## Epic E21 — Tenant Management UI

**Goal:** Full CRUD for tenants with rich detail views and bulk actions.  
**Depends on:** E20.

### E21-01: Tenant list with filters & search

- [ ] `GET /api/v1/platform/tenants?status=ACTIVE&planTier=PRO&page=1&search=...`
- [ ] Implement filters: Status (ACTIVE, SUSPENDED, TRIAL, CANCELLED), Plan tier, Date range
- [ ] Search by name/slug
- [ ] Pagination (20 rows default)
- [ ] Sortable columns: Name, MRR, Bookings, Created date

### E21-02: Tenant detail sidebar

- [ ] Click tenant row → expand sidebar (or modal)
- [ ] Display: Basic info, Subscription, This month metrics, Quick actions
- [ ] Actions: [Full View] [Suspend] [Delete] [Message]
- [ ] Link to `/admin/platform/tenants/:id/details` for full page

### E21-03: Tenant detail page (full view)

- [ ] Full organization info (name, slug, domain, contact)
- [ ] Subscription & billing (plan, next bill, usage metrics)
- [ ] Team members (admins, counter sellers) — clickable to manage
- [ ] Recent activity (last transactions, logins)
- [ ] Edit form for company name, contact email, custom domain (future)
- [ ] [Upgrade] [Downgrade] [Suspend] [Reactivate] [Delete] buttons

### E21-04: Create tenant form

- [ ] Modal or dedicated page: `/admin/platform/tenants/create`
- [ ] Fields: Company name, slug (auto-generate, editable), subdomain prefix, plan tier, trial days
- [ ] Validation: slug unique, name required, plan exists
- [ ] Submit: `POST /api/v1/platform/tenants`
- [ ] Success: redirect to tenant detail, show success toast

### E21-05: Bulk tenant actions

- [ ] Checkboxes on tenant list
- [ ] Bottom action bar: [Send Announcement] [Export CSV] [Change Plan] [Suspend]
- [ ] Confirmation modals for destructive actions
- [ ] Batch API calls with loading spinner

**Acceptance:**

- [ ] Can create, list, view, update, suspend tenants
- [ ] Filters work without page reload
- [ ] CSV export includes: name, slug, plan, status, MRR, users
- [ ] Bulk suspend shows confirmation (e.g., "Suspend 3 tenants?")

---

## Epic E22 — Usage & Analytics

**Goal:** Track API usage, bookings, and feature adoption per tenant.  
**Depends on:** E20, E21.

### E22-01: Telemetry collection

- [ ] Log API calls to `PlatformApiLog` table
  - tenantId, endpoint, status code, response time, timestamp, userId (if applicable)
- [ ] Middleware to auto-log all `/api/v1` requests (exclude /platform for now)
- [ ] Log booking creation, payment processing (domain events)

### E22-02: Usage aggregation service

- [ ] `GET /api/v1/platform/usage` — aggregate stats for all tenants
  - Total API calls (last 30d), by tenant ranking
  - Monthly bookings, users, revenue per tenant
  - Top routes, top dates
- [ ] `GET /api/v1/platform/usage/:tenantId` — detail for single tenant

### E22-03: Analytics dashboard page

- [ ] Tab: Analytics
- [ ] By-Tenant table: Tenant, Bookings, API Calls, Error Rate, Avg Response, Trend
- [ ] Filters: Date range, sort by column
- [ ] Charts: Bookings over time, API usage by tenant, Traffic by plan tier
- [ ] Export CSV, Excel, PDF

### E22-04: Advanced filters & exports

- [ ] Date range picker (presets: 7d, 30d, 90d, custom)
- [ ] Tenant filter dropdown
- [ ] Sort any column
- [ ] [📥 CSV] [📊 Excel] [📈 PDF] [🔍 Advanced Search]

**Acceptance:**

- [ ] Analytics page loads without lag (<2s)
- [ ] Charts render correctly with sample data
- [ ] Filters update table in real-time
- [ ] CSV export is valid and contains all expected columns

---

## Epic E23 — Billing & Revenue

**Goal:** Subscription management, payment tracking, churn analysis.  
**Depends on:** E20, E21.

### E23-01: Subscription model & data

- [ ] Prisma: `Subscription` model (tenantId, planTier, status, billingCycleStart/End, nextBillDate, autoRenew, usageMetrics JSON)
- [ ] Migrate: Add to existing schema
- [ ] Generate subscription on tenant creation

### E23-02: Billing endpoints

- [ ] `GET /api/v1/platform/billing/subscriptions` — list all with filters/sort
- [ ] `PATCH /api/v1/platform/billing/subscriptions/:id/upgrade` — change plan
- [ ] `POST /api/v1/platform/billing/subscriptions/:id/suspend` — pause billing
- [ ] `POST /api/v1/platform/billing/subscriptions/:id/refund` — issue refund (with amount, reason)

### E23-03: Revenue reporting

- [ ] `GET /api/v1/platform/billing/revenue` — MRR, ARR, churn metrics
  - MRR: sum of active subscriptions
  - ARR: MRR × 12
  - Churn: (cancelled this month / total last month) × 100%
  - ARPU: Total revenue / Active tenants
- [ ] Charts: MRR trend, churn cohorts, plan distribution

### E23-04: Billing UI

- [ ] Tab: Billing
- [ ] Summary cards: MRR, Active subscriptions, Churn, Collection rate
- [ ] Table: Tenant, Plan, MRR, Next Bill, Status, Invoice, Actions
  - [Retry Payment] [Issue Refund] [Upgrade] [Cancel]
- [ ] Failed payment list with [Retry] buttons
- [ ] Churn risk indicators (upcoming trial expiry, payment failures)

### E23-05: Invoice & receipt management

- [ ] `GET /api/v1/platform/billing/invoices/:tenantId` — list invoices
- [ ] Generate PDF invoice (html2pdf or similar)
- [ ] Send invoice email to tenant admin
- [ ] Bulk send: "Send invoices to X tenants" button

**Acceptance:**

- [ ] MRR calculation accurate (matches Subscription sum)
- [ ] Churn calculated correctly (cancelled / active)
- [ ] Upgrade/downgrade updates subscription immediately
- [ ] Failed payments show in red, retryable
- [ ] PDF invoice downloads with correct data

---

## Epic E24 — System Health & Monitoring

**Goal:** Real-time platform metrics, uptime tracking, alerts.  
**Depends on:** E20.

### E24-01: System metrics collection

- [ ] Prisma: `PlatformMetric` (timestamp, cpuUsage, memoryUsage, diskUsage, errorCount, successCount, avgResponseTime)
- [ ] Collect every minute (via job or external monitoring tool)
- [ ] Aggregate to hourly/daily for dashboard

### E24-02: Health check endpoints

- [ ] `GET /api/v1/health` — returns status (should already exist)
- [ ] `GET /api/v1/platform/health` — platform-level status + metrics
  - API uptime %, DB status, storage usage, error rates
- [ ] Database health check (simple query, measure time)
- [ ] External service checks (email, payment gateway — stubs for now)

### E24-03: Uptime dashboard

- [ ] Tab: System Health
- [ ] Summary: API, Database, Cache, Email, Payment Gateway status indicators
- [ ] Real-time metrics: CPU, Memory, Disk, Connections, Request queue
- [ ] Uptime chart (last 7 days, 30 days)
- [ ] Recent errors log (last 24h, searchable)

### E24-04: Alerts & notifications

- [ ] Alert rules: CPU > 80%, Disk > 90%, Error rate > 1%, Response time > 500ms
- [ ] Alert destinations: Email, SMS (placeholder), In-app notification
- [ ] Alert history: dismiss, acknowledge, auto-resolve
- [ ] Page: Alerts & Incidents (list, timeline view)

**Acceptance:**

- [ ] Health page loads with real metrics
- [ ] Uptime % calculated correctly
- [ ] Alerts trigger at threshold (in staging, test with manual override)
- [ ] Error log populated with actual API errors

---

## Epic E25 — Support & Moderation

**Goal:** Tenant support tickets, messaging, moderation tasks.  
**Depends on:** E20, E21.

### E25-01: Support ticket system

- [ ] Prisma: `SupportTicket` (id, tenantId, subject, status, priority, createdBy, assignedTo, createdAt, resolvedAt)
- [ ] Prisma: `TicketMessage` (ticketId, fromUserId, body, attachments)

### E25-02: Support API

- [ ] `GET /api/v1/platform/support/tickets` — list (filters: status, priority, tenant)
- [ ] `POST /api/v1/platform/support/tickets/:id/reply` — add message
- [ ] `PATCH /api/v1/platform/support/tickets/:id` — update status/priority/assign
- [ ] `POST /api/v1/platform/support/tickets` — create (from tenant or admin)

### E25-03: Support UI

- [ ] Tab: Support
- [ ] Ticket list: ID, From (Tenant), Subject, Status, Priority, Created, Actions
- [ ] Click ticket → detail modal/page with message thread
- [ ] [Reply] [Assign to me] [Close] [Reopen] buttons
- [ ] Rich text editor for replies (markdown or simple HTML)

### E25-04: Announcements

- [ ] Create/send announcements to all or selected tenants
- [ ] Types: Maintenance notice, Feature launch, Policy update
- [ ] Schedule delivery (now or future date)
- [ ] Track read receipts (future)

**Acceptance:**

- [ ] Can create and reply to tickets
- [ ] Tickets appear in tenant's support view (if applicable)
- [ ] Announcement sent to selected tenants
- [ ] UI responsive on mobile

---

## Epic E26 — Audit Logging

**Goal:** Comprehensive audit trail of all platform admin actions.  
**Depends on:** E20.

### E26-01: Audit log model

- [ ] Prisma: `PlatformAuditLog` (timestamp, actor, action, resourceType, resourceId, changes, ipAddress, userAgent)
- [ ] Actions: CREATE, READ, UPDATE, DELETE, SUSPEND, ACTIVATE, EXPORT
- [ ] Changes: Store before/after values (JSON)

### E26-02: Audit middleware & logging

- [ ] Middleware to capture all `/api/v1/platform/*` requests
- [ ] Log: actor (SUPER_ADMIN user), action, resource, changes, IP, timestamp
- [ ] Sensitive field masking (passwords, tokens) if logged

### E26-03: Audit log viewer

- [ ] Tab: Audit
- [ ] Timeline/table view: Timestamp, Actor, Action, Resource, Details, IP
- [ ] Filters: Date range, actor, action type, resource type
- [ ] Expandable rows to see full changes (JSON diff)
- [ ] [Export CSV] [Search]

### E26-04: Data export & compliance

- [ ] API: `GET /api/v1/platform/audit-logs/export` (CSV, JSON)
- [ ] Date range selection
- [ ] Tenant-specific export (if needed for compliance)

**Acceptance:**

- [ ] All admin actions logged (create, update, delete tenant, etc.)
- [ ] Audit log immutable (append-only)
- [ ] Export contains all expected columns
- [ ] Sensitive data masked in logs

---

## Implementation Sequence

### Phase 1 (MVP - Weeks 1-2)

**Goal:** Core platform admin dashboard and tenant management.

1. **E20-01 to E20-05** — Foundation & dashboard shell
2. **E21-01 to E21-05** — Tenant CRUD
3. **E26-01 to E26-03** — Audit logging (minimal, real-time)

**Deliverable:** Platform admins can log in, view all tenants, create/edit/suspend tenants, see overview metrics.

### Phase 2 (Weeks 3-4)

**Goal:** Analytics, usage tracking, and basic billing.

1. **E22-01 to E22-04** — Usage analytics
2. **E23-01 to E23-03** — Subscription model & revenue endpoints
3. **E24-01 to E24-03** — Basic health monitoring

**Deliverable:** MRR tracking, tenant usage by API calls/bookings, system health status.

### Phase 3 (Weeks 5+)

**Goal:** Advanced features, support, alerts.

1. **E23-04 to E23-05** — Full billing UI with invoicing
2. **E24-04** — Alerts & incident management
3. **E25-01 to E25-04** — Support tickets & announcements
4. **E26-04** — Audit export & compliance

**Deliverable:** Complete SaaS admin experience with support, billing, and alerting.

---

## Design System (Reuse from existing admin)

**Colors:**

- Primary: `#2e7d32` (green)
- Alert: `#c62828` (red)
- Warning: `#f57c00` (orange)
- Success: `#388e3c`
- Info: `#1976d2`

**Components:**

- KPI cards (green header, large numbers)
- Tables (striped rows, hover states, sortable headers)
- Charts (Chart.js or Recharts for consistency)
- Modals (confirm, form submission)
- Toasts (success, error, info)

**CSS:**

- Reuse existing `/apps/web/src/app/admin/admin.css` patterns
- Add `/apps/web/src/app/admin/platform/platform.css` for platform-specific styles

---

## Data Migration & Seeding

After implementing E20-01, seed a test SUPER_ADMIN:

```typescript
// packages/database/prisma/seed-platform.ts
const adminUser = await prisma.user.create({
  data: {
    email: "admin@platform.local",
    phone: "880000000000",
    passwordHash: bcrypt.hashSync("SecurePassword123!", 10),
    role: "SUPER_ADMIN",
    name: "Platform Administrator",
  },
});
```

Then seed test tenants (1-3 with different plans) for dashboard preview.

---

## Testing Strategy

### Unit Tests

- `calculateMRR()` function
- `calculateChurn()` function
- `getTenantUsage()` aggregation

### Integration Tests

- Tenant CRUD endpoints (create, list, update, suspend)
- Permission checks (only SUPER_ADMIN can access)
- Audit log generation

### E2E Tests (Playwright)

- Login as SUPER_ADMIN
- View dashboard
- Create/edit/suspend a tenant
- View analytics
- Export CSV

---

## Deployment Checklist

Before going live:

- [ ] Database migrations applied
- [ ] Seed script run (SUPER_ADMIN created)
- [ ] SSL certificate for admin subdomain (or path)
- [ ] Rate limiting on `/api/v1/platform/*` endpoints
- [ ] Logging to centralized log service (or file rotation)
- [ ] Backup strategy for audit logs
- [ ] Documentation for SUPER_ADMIN users
- [ ] Support contact for platform emergencies
