# SaaS Platform Admin Dashboard — Quick Reference

## What is it?

A **centralized control panel** for your bus ticket SaaS platform where you (the platform operator) manage:

- ✅ All bus companies (tenants) using your platform
- ✅ Revenue & subscriptions
- ✅ Platform performance & health
- ✅ Support tickets & announcements
- ✅ Audit trail of all actions

---

## Key Dashboard Sections

| Section       | Purpose                         | Key Data                                |
| ------------- | ------------------------------- | --------------------------------------- |
| **Overview**  | Platform health snapshot        | MRR, active tenants, uptime, bookings   |
| **Tenants**   | Manage all bus companies        | List, create, edit, suspend/activate    |
| **Analytics** | Track usage patterns            | API calls, bookings by tenant, trending |
| **Billing**   | Revenue & subscription tracking | MRR, churn, invoice management          |
| **System**    | Infrastructure monitoring       | CPU, memory, errors, alerts             |
| **Support**   | Tenant support tickets          | Tickets, announcements, messaging       |
| **Audit**     | Compliance & security logs      | Who did what, when, from where          |

---

## Core Features

### 1. **Multi-Tenant Overview**

See all bus companies at a glance:

- Revenue per tenant (MRR)
- Number of bookings
- Plan tier (FREE, PRO, ENTERPRISE)
- Status (ACTIVE, SUSPENDED, TRIAL)
- Churn indicators ⚠️

### 2. **Tenant Management**

Full CRUD with rich UX:

- Create new organizations
- Edit company info
- Upgrade/downgrade plans
- Suspend or delete tenants
- Manage team members (future)

### 3. **Revenue Tracking**

Financial dashboard:

- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn rate & at-risk tenants
- Invoice management
- Payment retry logic

### 4. **Usage Analytics**

Performance insights:

- API calls per tenant
- Booking volume trends
- Feature adoption
- Error rates
- Exportable reports

### 5. **System Health**

Operational visibility:

- API uptime %
- Database performance
- Storage usage
- Error logs
- Real-time alerts

### 6. **Support & Moderation**

Help tenants & manage issues:

- Support ticket queue
- Message threading
- Bulk announcements
- Refund/dispute handling

### 7. **Audit Trail**

Security & compliance:

- Every action logged
- Actor, timestamp, IP address
- Resource changes tracked
- Exportable for compliance

---

## Technology Stack

**Frontend (Next.js):**

- Tab-based navigation
- Responsive tables with sorting/filtering
- Charts (Chart.js or Recharts)
- Real-time KPI cards

**Backend (Express):**

- Platform-scoped API endpoints (`/api/v1/platform/...`)
- SUPER_ADMIN role enforcement
- Telemetry collection
- Audit logging middleware

**Database (PostgreSQL + Prisma):**

- Tenant model (multi-tenant ready ✅)
- Subscription tracking
- Usage logs & metrics
- Audit logs (append-only)

---

## User Roles & Access

| Role               | Access               | Responsibilities                    |
| ------------------ | -------------------- | ----------------------------------- |
| **SUPER_ADMIN**    | Platform admin (you) | Manage all tenants, revenue, system |
| **ADMIN** (tenant) | Single organization  | Manage routes, schedules, staff     |
| **COUNTER_SELLER** | POS & counter        | Sell tickets, process refunds       |
| **CUSTOMER**       | Public site          | Search & book tickets               |

---

## Implementation Roadmap

### Phase 1 (MVP - Weeks 1-2)

✅ Basic dashboard, tenant CRUD, overview metrics

### Phase 2 (Weeks 3-4)

✅ Usage analytics, billing endpoints, health monitoring

### Phase 3 (Weeks 5+)

✅ Invoice management, support tickets, advanced alerts

---

## Security Considerations

🔒 **Protected by:**

- SUPER_ADMIN role requirement
- JWT authentication
- Rate limiting on platform endpoints
- Audit logging for compliance
- Session timeout (15 min)
- Optional 2FA (recommended)

🔍 **Monitored:**

- Every action logged with timestamp + IP
- Data access tracked
- Changes recorded (before/after)
- Immutable audit trail

---

## Example User Flows

### Flow 1: Check Platform Health (2 min)

1. Log in to `/admin/platform`
2. View Overview dashboard
3. See MRR: ৳ 4.5M, Uptime: 99.98%, Tenants: 8/10
4. No alerts → platform is healthy ✅

### Flow 2: Upgrade a Tenant's Plan (3 min)

1. Go to Tenants tab
2. Find "Pabna Transit" in list
3. Click → see detail sidebar
4. Click [Upgrade to ENT]
5. Confirm billing change → done

### Flow 3: Handle Failed Payment (5 min)

1. Go to Billing tab
2. Filter: Status = "RETRY"
3. See "Pabna Transit" payment failed
4. Click [Retry Payment]
5. If fails again: [Send Message to Admin]

### Flow 4: Monitor API Performance (2 min)

1. Go to System Health tab
2. See: API 145ms avg, Error rate 0.2% ✅
3. See: Database CPU 35%, Memory 48% ✅
4. All green → no action needed

---

## Key Metrics Explained

| Metric                | Formula                                          | Meaning                    |
| --------------------- | ------------------------------------------------ | -------------------------- |
| **MRR**               | Sum of active subscription prices                | Monthly revenue expected   |
| **ARR**               | MRR × 12                                         | Annualized revenue         |
| **Churn Rate**        | (Cancelled this month / Total last month) × 100% | % of tenants leaving       |
| **ARPU**              | Total revenue / Active tenants                   | Average revenue per tenant |
| **Uptime %**          | (Total time - Downtime) / Total time             | Reliability                |
| **API Success Rate**  | (Successful calls / Total calls) × 100%          | API quality                |
| **Avg Response Time** | Sum of response times / Number of calls          | Performance                |

---

## Common Admin Tasks

### Task 1: Create New Bus Company

```
Tenants tab → [+ Create Tenant] →
  Company name: "Rangpur Express"
  Slug: "rangpur-express" (auto-generated, editable)
  Plan: PRO
  → [Create]
```

### Task 2: Send Announcement to All Tenants

```
Support tab → [Send Announcement] →
  Title: "New API rate limits effective June 15"
  Body: "... details ..."
  Recipients: All tenants
  Schedule: Now
  → [Send]
```

### Task 3: Export Revenue Report

```
Billing tab → [Date range: May 1 - May 31] →
  [📊 Excel] → Downloads file with:
    - Each tenant's MRR
    - Bookings count
    - Refunds
    - Net revenue
```

### Task 4: Investigate API Error Spike

```
System Health tab → [Recent Errors] →
  See: 5 errors in last hour, /api/v1/schedules endpoint
  → [View Logs] → See: Database connection timeout
  → Fix: Restart DB connection pool
```

### Task 5: Review Audit Trail

```
Audit tab → Filter: [Last 7 days] [Action: SUSPENDED] →
  See: "Admin suspended Pabna Transit on Jun 5 @ 12:15 PM"
  Reason: "Payment failed 3x"
  → [Export CSV] for compliance
```

---

## API Endpoints Summary

**Platform Admin Endpoints** (SUPER_ADMIN only):

```
Dashboard
  GET /api/v1/platform/dashboard/overview
  GET /api/v1/platform/dashboard/metrics

Tenants
  GET    /api/v1/platform/tenants
  POST   /api/v1/platform/tenants
  GET    /api/v1/platform/tenants/:id
  PATCH  /api/v1/platform/tenants/:id
  POST   /api/v1/platform/tenants/:id/suspend

Usage & Analytics
  GET /api/v1/platform/usage
  GET /api/v1/platform/usage/:tenantId

Billing
  GET    /api/v1/platform/billing/subscriptions
  PATCH  /api/v1/platform/billing/subscriptions/:id/upgrade
  POST   /api/v1/platform/billing/subscriptions/:id/refund

Health
  GET /api/v1/platform/health
  GET /api/v1/platform/health/metrics

Support
  GET    /api/v1/platform/support/tickets
  POST   /api/v1/platform/support/tickets/:id/reply
  PATCH  /api/v1/platform/support/tickets/:id

Audit
  GET /api/v1/platform/audit-logs
  GET /api/v1/platform/audit-logs/export
```

---

## Design & UX Philosophy

✨ **Goals:**

- Minimize clicks to complete tasks (2-3 steps for common actions)
- Real-time data (no page refresh needed)
- Color-coded alerts (green = OK, yellow = warning, red = alert)
- Mobile-friendly (can manage from phone if urgent)
- Clean, professional aesthetic

🎨 **Color Scheme:**

- Green (#2e7d32): Healthy, success
- Red (#c62828): Alerts, failures
- Orange (#f57c00): Warnings, at-risk
- Blue (#1976d2): Info, neutral

---

## Next Steps

1. **Read the full specs:**
   - [SAAS-PLATFORM-ADMIN.md](SAAS-PLATFORM-ADMIN.md) — Feature requirements & data model
   - [SAAS-PLATFORM-ADMIN-UI.md](SAAS-PLATFORM-ADMIN-UI.md) — UI wireframes & layouts
   - [SAAS-PLATFORM-ADMIN-ROADMAP.md](SAAS-PLATFORM-ADMIN-ROADMAP.md) — Implementation plan

2. **Start Phase 1 (MVP):**
   - Implement Epic E20 (foundation)
   - Implement Epic E21 (tenant CRUD)
   - Implement Epic E26 (audit logging)

3. **Set up seed data:**
   - Create SUPER_ADMIN user in database
   - Seed 2-3 test tenants with different plans

4. **Test & iterate:**
   - Manual testing in dev environment
   - Gather feedback from business stakeholders
   - Refine UI based on usage patterns

---

## Questions to Ask Your Team

- Who will be the primary platform admin(s)?
- What's the minimum uptime SLA you want to promise tenants? (default: 99.9%)
- Should invoices be auto-generated monthly or manual?
- Do you need API rate limiting per tenant? (recommended: yes)
- Timeline for launch: MVP only, or full Phase 3?
- Budget for monitoring/alerting service (Datadog, New Relic, etc.)?

---

## Support & Troubleshooting

**Dashboard loading slow?**

- Check database query performance
- Reduce metric aggregation window
- Cache KPI cards (1-5 min)

**Audit logs growing too fast?**

- Archive logs older than 90 days
- Sample non-critical events
- Use separate analytics database

**Tenants complaining about API errors?**

- Check System Health tab for errors
- Review audit logs for what changed
- Use rate limiting before scaling

---

## Resources

- **Framework:** [Next.js Docs](https://nextjs.org/docs)
- **Charts:** [Recharts](https://recharts.org/) or [Chart.js](https://www.chartjs.org/)
- **Tables:** HTML tables + CSS (or headless UI library)
- **Icons:** Use existing icon set or [Lucide React](https://lucide.dev/)
- **Authentication:** JWT stored in httpOnly cookies

---

**Version:** 1.0  
**Last Updated:** June 6, 2026  
**Status:** Ready for implementation
