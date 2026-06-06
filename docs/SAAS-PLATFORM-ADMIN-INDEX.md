# SaaS Platform Admin Dashboard — Complete Index

## 📋 Documentation Files

Read these in order for complete understanding:

### 1. **QUICK REFERENCE** (5 min read)

📄 [SAAS-PLATFORM-ADMIN-QUICK-REF.md](SAAS-PLATFORM-ADMIN-QUICK-REF.md)

- What is the platform admin dashboard?
- Key features & sections
- User flows & common tasks
- API endpoints summary
- Perfect for: Getting the big picture

### 2. **REQUIREMENTS & DESIGN** (15 min read)

📄 [SAAS-PLATFORM-ADMIN.md](SAAS-PLATFORM-ADMIN.md)

- Complete feature specifications
- 8 dashboard sections detailed
- Data model & schemas
- Required API endpoints
- Implementation phases
- Perfect for: Architects & backend developers

### 3. **UI WIREFRAMES & LAYOUTS** (10 min read)

📄 [SAAS-PLATFORM-ADMIN-UI.md](SAAS-PLATFORM-ADMIN-UI.md)

- ASCII mockups of all pages
- Responsive design considerations
- Mobile/tablet/desktop breakpoints
- Color scheme & design system
- Perfect for: Frontend developers & UI designers

### 4. **IMPLEMENTATION ROADMAP** (20 min read)

📄 [SAAS-PLATFORM-ADMIN-ROADMAP.md](SAAS-PLATFORM-ADMIN-ROADMAP.md)

- 6 implementable epics (E20–E26)
- 20+ micro-tasks with acceptance criteria
- 3-phase delivery plan
- Testing strategy
- Deployment checklist
- Perfect for: Project managers & lead developers

---

## 🎯 Quick Navigation

### By Role

**👨‍💼 Product Manager**

1. Start: QUICK-REF → Features overview
2. Read: SAAS-PLATFORM-ADMIN.md → Sections 1-4
3. Plan: SAAS-PLATFORM-ADMIN-ROADMAP.md → Phases

**👨‍💻 Backend Developer**

1. Start: SAAS-PLATFORM-ADMIN.md → All sections
2. Focus: "Required API Endpoints" section
3. Plan: SAAS-PLATFORM-ADMIN-ROADMAP.md → E20-E26

**🎨 Frontend Developer**

1. Start: SAAS-PLATFORM-ADMIN-UI.md → All wireframes
2. Reference: SAAS-PLATFORM-ADMIN.md → Design system
3. Implement: SAAS-PLATFORM-ADMIN-ROADMAP.md → Phased tasks

**🏗️ Tech Lead**

1. Overview: QUICK-REF (5 min)
2. Deep dive: All 4 docs in order
3. Decision: Which phase to build first?

**👥 Stakeholder/Client**

1. Quick pitch: QUICK-REF → Sections 1-3
2. Feature walk: SAAS-PLATFORM-ADMIN-UI.md → Main dashboard mockup
3. Timeline: SAAS-PLATFORM-ADMIN-ROADMAP.md → 3 phases

---

## 📊 Dashboard Structure Overview

```
Platform Admin Dashboard
│
├─ Overview (Hero Section)
│  ├─ KPI Cards: MRR, Active Tenants, Bookings, Uptime
│  ├─ Revenue Trend Chart (6 months)
│  ├─ Top 5 Tenants Table
│  └─ System Health Status
│
├─ Tenants Tab
│  ├─ List (filterable, sortable, paginated)
│  ├─ Sidebar Details (quick view)
│  ├─ Full Detail Page (edit, upgrade, suspend)
│  └─ Create Tenant Form
│
├─ Analytics Tab
│  ├─ Usage by Tenant (API calls, bookings, errors)
│  ├─ Trend Charts (bookings, API calls over time)
│  ├─ Plan Distribution (pie/donut)
│  └─ Export (CSV, Excel, PDF)
│
├─ Billing Tab
│  ├─ Summary (MRR, subscriptions, churn)
│  ├─ Subscription Table (plan, status, next bill)
│  ├─ MRR Projection (3 months)
│  ├─ Failed Payments (retry-able)
│  └─ Invoice Management
│
├─ System Health Tab
│  ├─ Status Indicators (API, DB, Cache, Email, Payment)
│  ├─ Real-time Metrics (CPU, Memory, Disk, Connections)
│  ├─ Uptime Chart (7/30 days)
│  ├─ Recent Errors (searchable, filterable)
│  └─ Alert Logs
│
├─ Support Tab
│  ├─ Ticket Queue (status, priority, tenant)
│  ├─ Ticket Detail & Message Thread
│  ├─ Create/Reply (rich text editor)
│  ├─ Announcements (create, schedule, send)
│  └─ Message Tenants (bulk)
│
└─ Audit Tab
   ├─ Activity Timeline (actor, action, resource, IP)
   ├─ Filters (date, actor, action, resource)
   ├─ Expandable Details (JSON diffs)
   └─ Export (CSV, JSON, compliance report)
```

---

## 🔄 Data Flow Architecture

```
Platform Admin (SUPER_ADMIN)
        │
        ├─ Logs in → JWT token issued
        │
        ├─ Views Dashboard → GET /api/v1/platform/dashboard/overview
        │                    ↓ (aggregates all tenants' metrics)
        │                    Returns: MRR, Uptime, Bookings, Tenants count
        │
        ├─ Manages Tenants → CRUD /api/v1/platform/tenants/...
        │                    ↓ (Updates Tenant table)
        │                    → Triggers Audit Log entry
        │
        ├─ Views Analytics → GET /api/v1/platform/usage/...
        │                    ↓ (Queries PlatformApiLog, aggregates by tenant)
        │                    Returns: API calls, Bookings, Errors by tenant
        │
        ├─ Checks Billing → GET /api/v1/platform/billing/...
        │                   ↓ (Joins Subscription + Payment tables)
        │                   Returns: MRR, Churn, Invoices by tenant
        │
        ├─ Monitors Health → GET /api/v1/platform/health/metrics
        │                    ↓ (Queries PlatformMetric + realtime status)
        │                    Returns: CPU%, Memory%, Errors, Uptime%
        │
        └─ Reviews Audit → GET /api/v1/platform/audit-logs
                           ↓ (Queries PlatformAuditLog, immutable)
                           Returns: Timeline of all admin actions
```

---

## 📈 Implementation Phases

### Phase 1: MVP (Weeks 1-2) ✅ Minimum Viable Product

**Deliverable:** Core platform admin can manage all tenants

```
Epics:     E20 (Foundation)
           E21 (Tenant CRUD)
           E26 (Audit Logging)

Features:  • Login for SUPER_ADMIN
           • View all tenants
           • Create/edit/suspend tenants
           • Basic dashboard metrics
           • Audit trail of actions

Endpoints: 10 critical platform endpoints
           RBAC enforcement

UI Pages:  • /admin/platform/login
           • /admin/platform (overview)
           • /admin/platform/tenants (list & detail)
           • /admin/platform/audit (logs)
```

### Phase 2: Analytics & Billing (Weeks 3-4) 📊 Smart Insights

**Deliverable:** Revenue tracking and usage analytics

```
Epics:     E22 (Usage Analytics)
           E23 (Billing & Revenue)
           E24 (System Health Basics)

Features:  • Telemetry collection
           • Usage aggregation by tenant
           • Revenue dashboards
           • Subscription management
           • Basic system status
           • Health metrics & alerts

Endpoints: +12 analytics & billing endpoints

UI Pages:  • /admin/platform/analytics
           • /admin/platform/billing
           • /admin/platform/system (basic)
```

### Phase 3: Advanced (Weeks 5+) 🚀 Production Ready

**Deliverable:** Full-featured SaaS admin platform

```
Epics:     E23 (continued - full billing)
           E24 (continued - advanced monitoring)
           E25 (Support & Moderation)

Features:  • Invoice generation & email
           • Payment retry logic
           • Alert system with thresholds
           • Auto-escalations
           • Support ticket queue
           • Announcements & messaging
           • Compliance exports

Endpoints: +8 support & export endpoints

UI Pages:  • /admin/platform/billing/invoices
           • /admin/platform/system/alerts
           • /admin/platform/support (full)
           • /admin/platform/compliance
```

---

## 🛠️ Technology Stack

| Layer             | Technology             | Why                                    |
| ----------------- | ---------------------- | -------------------------------------- |
| **Frontend**      | Next.js + React        | Server-side rendering, API routes      |
| **Backend**       | Express + Node.js      | Already in use, modular                |
| **Database**      | PostgreSQL + Prisma    | Multi-tenant ready, type-safe          |
| **Charts**        | Chart.js or Recharts   | Lightweight, React-friendly            |
| **Tables**        | HTML + CSS + sorting   | Simple, no heavy dependencies          |
| **Auth**          | JWT (httpOnly cookies) | Stateless, secure                      |
| **Monitoring**    | Custom logs            | Start simple, upgrade to Datadog later |
| **UI Components** | CSS-in-place           | Reuse admin CSS from existing app      |

---

## 🔐 Security Model

```
Authentication Layer
    ↓
    ├─ User logs in with email + password
    ├─ Password hashed with bcrypt
    ├─ JWT issued with role='SUPER_ADMIN'
    └─ JWT stored in httpOnly cookie (no JS access)

Authorization Layer
    ↓
    ├─ Middleware checks: requireRole('SUPER_ADMIN')
    ├─ Only SUPER_ADMIN can access /api/v1/platform/*
    ├─ All other routes reject with 403 Forbidden
    └─ Cannot escalate to higher role

Audit & Compliance
    ↓
    ├─ Every action logged: actor, timestamp, IP, action, resource
    ├─ Audit log is append-only (immutable)
    ├─ Sensitive data masked (passwords, tokens)
    ├─ Changes tracked (before/after JSON)
    └─ Exported for compliance (PCI, SOC2, GDPR)
```

---

## 🎨 Design System

### Colors (Inherit from existing admin app)

```
Primary:   #2e7d32 (Green) — Healthy, active, success
Danger:    #c62828 (Red) — Alerts, failures, critical
Warning:   #f57c00 (Orange) — At-risk, warnings
Success:   #388e3c (Dark Green) — Completed actions
Info:      #1976d2 (Blue) — Informational
Neutral:   #666/#999/#CCC (Grays) — Text, borders, disabled
```

### Typography

```
Headers:    Bold, UPPERCASE (e.g., "NET REVENUE")
Data:       Monospace (right-aligned for numbers)
Labels:     Small, secondary text, gray
```

### Spacing (8px grid)

```
Card padding:    16px / 24px
Section gap:     24px / 32px
Row height:      44px / 56px (tables)
```

### Components (Reuse from `/apps/web/src/app/admin/admin.css`)

```
KPI Cards:   heading + large number + subtext
Tables:      striped, hoverable, sortable headers
Charts:      responsive container, legend
Modals:      dark overlay, centered panel, action buttons
Toasts:      top-right, auto-dismiss after 4s
```

---

## 📊 Key Metrics Definitions

| Metric                | Calculation                                | Context                   |
| --------------------- | ------------------------------------------ | ------------------------- |
| **MRR**               | Sum of active subscription prices          | Monthly recurring revenue |
| **ARR**               | MRR × 12                                   | Annual recurring revenue  |
| **Churn Rate**        | (Cancelled / Total from prev month) × 100% | % revenue lost            |
| **ARPU**              | Total revenue / Active tenants             | Revenue per tenant        |
| **API Success %**     | (Successful calls / Total) × 100%          | API reliability           |
| **Avg Response Time** | Sum of response times / Count              | API performance           |
| **Error Rate**        | (Errors / Total requests) × 100%           | Error frequency           |
| **Uptime %**          | (Total time - Downtime) / Total × 100%     | Service availability      |

---

## 🚀 Getting Started Checklist

### Pre-Implementation

- [ ] Read all 4 documentation files (this index + 3 others)
- [ ] Align with team on Phase 1 scope
- [ ] Decide: Chart.js vs Recharts for visualizations
- [ ] Plan database migration strategy
- [ ] Create SUPER_ADMIN seed account
- [ ] Set up logging infrastructure (file or service)

### Phase 1 Setup

- [ ] Create Epic E20 tasks in project management tool
- [ ] Assign team members (1 lead, 2-3 devs)
- [ ] Set up feature branch: `feature/platform-admin-e20`
- [ ] Create test tenants in staging database
- [ ] Write unit tests for `SUPER_ADMIN` middleware

### Development

- [ ] Implement E20: Foundation (auth, middleware, routes)
- [ ] Implement E21: Tenant CRUD (list, create, edit, detail)
- [ ] Implement E26: Audit logging (middleware + UI)
- [ ] Code review & testing
- [ ] Merge to main

### Testing & Launch

- [ ] Manual QA (all admin flows)
- [ ] Load testing (concurrent logins)
- [ ] Security audit (RBAC, SQL injection, XSS)
- [ ] Staging deployment & smoke test
- [ ] Production deployment with rollback plan
- [ ] Monitor uptime & error rates (first week)

---

## ❓ FAQ

**Q: Can regular ADMIN users see the platform dashboard?**
A: No. Only `SUPER_ADMIN` role. Regular admins see their own tenant dashboard only.

**Q: How often are metrics updated?**
A: Overview (real-time via polling), Analytics (every 5 min), Billing (hourly), Audit (real-time).

**Q: Can I delete a tenant completely?**
A: Yes, but it's logged to audit trail. Recommended: suspend instead (reversible).

**Q: What if a payment fails?**
A: Automatic retry (3x), then marked as FAILED. Admin can manually retry or contact tenant.

**Q: Can I export audit logs for compliance?**
A: Yes. CSV/JSON export with date range, actor, action filters. Immutable, tamper-proof.

**Q: How is MRR calculated?**
A: Sum of `Subscription.monthlyPrice` where `planStatus = 'ACTIVE'` and `nextBillDate > today`.

**Q: Can I send messages directly to tenants?**
A: Yes, via Support tab or bulk announcements. Messages logged in audit trail.

---

## 📞 Support & Questions

**Implementation Help:**

- Review existing admin code at `/apps/web/src/components/admin/`
- Reference AGENTS.md for architecture best practices
- Ask about specific endpoint implementation

**Design Questions:**

- Check SAAS-PLATFORM-ADMIN-UI.md for all wireframes
- Reuse CSS from `apps/web/src/app/admin/admin.css`
- Match color scheme & spacing conventions

**Data Model Questions:**

- See SAAS-PLATFORM-ADMIN.md → "Data Model" section
- All schemas should go in `packages/shared`
- Coordinate with team on migration strategy

---

**Version:** 1.0  
**Last Updated:** June 6, 2026  
**Status:** ✅ Ready for implementation

**Next Step:** Start Phase 1 with Epic E20 implementation!
