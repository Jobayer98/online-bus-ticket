# SaaS Platform Admin Dashboard

**Purpose:** Centralized management for bus ticket SaaS platform operators to manage all tenant organizations, monitor platform health, track revenue, and handle support.

**Audience:** Platform admins with `SUPER_ADMIN` role.

---

## Dashboard Sections

### 1. **Platform Overview (Hero Section)**

**KPI Cards (4-column grid, responsive):**

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Revenue    │ Active Tenants   │ Monthly Bookings │ Platform Uptime  │
│ ৳ 52.5 Lac      │ 8 / 10 licensed  │ 2,450            │ 99.98%           │
│ +12.5% MTD       │ +1 this month    │ +8.2% vs last mo │ Last incident: .. │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Data points:**

- Gross revenue (all tenants, current month)
- Active tenants count vs licensed capacity
- Total bookings across platform
- API uptime % and last downtime

---

### 2. **Tenant Management**

**Table View:**

| Column           | Notes                                         |
| ---------------- | --------------------------------------------- |
| **Tenant Name**  | Clickable → detail page                       |
| **Slug**         | `dhaka-express`, `pabna-transport`, etc.      |
| **Plan Tier**    | FREE, PRO, ENTERPRISE                         |
| **Status**       | TRIAL, ACTIVE, SUSPENDED, CANCELLED           |
| **Users**        | # active users (ADMIN + COUNTER_SELLERS)      |
| **MRR**          | Monthly recurring revenue for tenant          |
| **Bookings (M)** | Bookings this month                           |
| **Created**      | Date tenant registered                        |
| **Actions**      | View Details, Suspend, Upgrade, Edit Settings |

**Filters:**

- Plan tier (Free, Pro, Enterprise)
- Status (Active, Suspended, Trial, Cancelled)
- Date range (created in last 7/30/90 days)
- Search by name/slug

**Bulk Actions:**

- Send announcement to selected tenants
- Export list (CSV)

**Add New Tenant Button:**

- Manual provisioning form or link to registration page

---

### 3. **Tenant Detail View** (click tenant row)

```
┌─────────────────────────────────────────────────────────┐
│ Dhaka Express                                           │
│ Status: ACTIVE | Plan: PRO | Since: May 2026           │
└─────────────────────────────────────────────────────────┘

┌─ Organization Info ───────────────────────────────────┐
│ Company Name: Dhaka Express Travel Co.                │
│ Slug: dhaka-express                                  │
│ Subdomain: dhaka-express.busbooking.io               │
│ Admin Contact: Rahim Khan (rahim@dhakaexpress.com)    │
└───────────────────────────────────────────────────────┘

┌─ Subscription & Billing ──────────────────────────────┐
│ Current Plan: PRO ($99/month)                         │
│ Billing Period: Jun 1 - Jun 30                        │
│ Next Bill Date: Jul 1, 2026                           │
│ Usage: 450/500 API calls | 12/15 users                │
│ [Upgrade] [Downgrade] [Manage Billing] [Refund]       │
└───────────────────────────────────────────────────────┘

┌─ Usage This Month ────────────────────────────────────┐
│ API Calls: 450 (90% of limit)                         │
│ Monthly Bookings: 125                                 │
│ Revenue Generated: ৳ 625,000                          │
│ Refunds: ৳ 75,000                                     │
│ Net Revenue: ৳ 550,000                                │
└───────────────────────────────────────────────────────┘

┌─ Team Members ────────────────────────────────────────┐
│ [Admin Users]              │ [Counter Sellers]         │
│ • Rahim Khan (ADMIN)       │ • Ahmed Hossain           │
│ • Farhana Akter (ADMIN)     │ • Mithila Roy             │
│ [+ Add Member]             │                           │
└───────────────────────────────────────────────────────┘

┌─ Platform Access ─────────────────────────────────────┐
│ Last Login: Today, 2:30 PM (Dhaka time)               │
│ Active Sessions: 2                                    │
│ [Force Logout All] [Reset Password] [Invite Owner]    │
└───────────────────────────────────────────────────────┘

┌─ Quick Actions ────────────────────────────────────────┐
│ [View Dashboard] [View Transactions] [Message Admin]   │
│ [Suspend Account] [Cancel Subscription] [Delete Tenant]│
└───────────────────────────────────────────────────────┘
```

---

### 4. **Usage Analytics**

**By-Tenant Breakdown:**

```
Sorting: Revenue | Bookings | API Usage | Growth
┌────────────┬────────┬──────────┬─────────┬──────────┐
│ Tenant     │ Rank   │ Bookings │ Revenue │ Growth % │
├────────────┼────────┼──────────┼─────────┼──────────┤
│ Dhaka Exp  │ #1     │ 250      │ ৳ 1.2M  │ +15%     │
│ Pabna Tr   │ #2     │ 180      │ ৳ 810k  │ +8%      │
│ Sylhet Bus │ #3     │ 120      │ ৳ 540k  │ -2%      │
│ ...        │        │          │         │          │
└────────────┴────────┴──────────┴─────────┴──────────┘
```

**Metrics:**

- **API Calls**: Total platform API calls, by tenant
- **Monthly Users**: Unique customers, counter sellers, admins
- **Booking Rate**: Bookings per tenant, growth trend
- **Feature Usage**: Which tenants use advanced features?

**Charts:**

- Revenue trend (line chart, 12 months)
- Tenant distribution by plan tier (pie/donut)
- Top 5 tenants by revenue (bar chart)
- Platform adoption curve (new tenants over time)

---

### 5. **Revenue & Billing**

**Summary Cards:**

```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total MRR        │ Active Sub.s     │ Churn Rate       │
│ ৳ 4.5 Lac       │ 8 x PRO, 1 x ENT  │ 5.2% (last 30d) │
│ +18% vs May      │ +1 PRO this mo    │ 1 churn event   │
└──────────────────┴──────────────────┴──────────────────┘
```

**Billing Table:**

| Tenant        | Plan | MRR     | Status                 | Churn Risk | Next Bill | Invoice | Action |
| ------------- | ---- | ------- | ---------------------- | ---------- | --------- | ------- | ------ |
| Dhaka Express | PRO  | ৳ 6,000 | ACTIVE                 | No         | Jun 30    | PDF     | —      |
| Pabna Transit | PRO  | ৳ 6,000 | ACTIVE                 | Yes\*      | Jun 28    | PDF     | Retry  |
| Sylhet Bus    | FREE | ৳ 0     | TRIAL (expires Jun 20) | —          | —         | —       | Upsell |

**Actions:**

- Download invoices
- Retry failed payments
- Apply discounts/coupons
- Manual refund for dispute

**Charts:**

- MRR trend (line chart)
- Churn analysis (cohort retention)
- Plan distribution (stacked bar)

---

### 6. **System Health & Monitoring**

**Status Indicators:**

```
┌─ API Service ─────────────────────┐
│ ✅ Status: Healthy                │
│ Response time: 145ms avg          │
│ Error rate: 0.2%                  │
│ Last check: 2 min ago             │
└───────────────────────────────────┘

┌─ Database ────────────────────────┐
│ ✅ Status: Healthy                │
│ CPU: 35% | Disk: 62% | Memory: 48%│
│ Connections: 125/200              │
└───────────────────────────────────┘

┌─ Email Service ───────────────────┐
│ ⚠️  Status: Degraded              │
│ Delivery rate: 94.2%              │
│ Avg latency: 2.3s                 │
└───────────────────────────────────┘
```

**Alerts:**

- API errors spiking
- Database performance degradation
- Payment gateway down
- Storage quota exceeded
- SSL cert expiring soon

**Logs:**

- Recent errors (last 100, searchable)
- Deployment history
- Database migrations applied

---

### 7. **Support & Moderation**

**Support Tickets:**

| ID     | From Tenant   | Subject              | Status   | Priority | Created | Action |
| ------ | ------------- | -------------------- | -------- | -------- | ------- | ------ |
| TK-042 | Dhaka Express | API rate limit issue | OPEN     | HIGH     | 2h ago  | Reply  |
| TK-041 | Pabna Transit | Refund dispute       | RESOLVED | —        | 3d ago  | —      |

**Moderation Tasks:**

- Flag suspicious transactions
- Review refund requests
- Handle payment disputes
- Approve plan upgrades
- Review compliance issues

**Announcements:**

- Broadcast messages to all/selected tenants
- Scheduled maintenance notices
- Feature release announcements

---

### 8. **Audit Logs**

**Activity Timeline:**

| Timestamp        | Actor       | Action    | Resource | Details               | IP        |
| ---------------- | ----------- | --------- | -------- | --------------------- | --------- |
| 2026-06-06 14:32 | Admin (you) | UPDATED   | Tenant   | Plan: FREE → PRO      | 203.x.x.x |
| 2026-06-06 12:15 | System      | SUSPENDED | Tenant   | Payment failed x3     | —         |
| 2026-06-05 09:42 | Rahim Khan  | CREATED   | Booking  | Schedule: Dhaka-Pabna | 103.x.x.x |

**Filters:**

- Date range
- Actor (admin, system, tenant)
- Action (CREATE, UPDATE, DELETE, SUSPEND)
- Resource type (Tenant, Booking, Payment)

---

## UI Layout

```
┌──────────────────────────────────────────────────────────┐
│ 🏠 Platform Admin                                        │
│ Super Admin Account | 6:32 PM (Dhaka) | Support | Logout│
├──────────────────────────────────────────────────────────┤
│ Navigation: [Overview] [Tenants] [Analytics] [Billing]  │
│            [System Health] [Support] [Audit] [Settings] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MAIN CONTENT AREA (varies by tab)                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Hero Section (KPI cards)                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Main Content                                     │   │
│  │ (Tables, charts, forms - tab-dependent)         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Footer                                           │   │
│  │ Platform v2.1 | Status: All Systems Operational │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Data Model

### Tenant

```typescript
{
  id: "tenant-uuid",
  name: "Dhaka Express",
  slug: "dhaka-express",
  subdomainPrefix: "dhaka-express",
  customDomain: null,
  planTier: "PRO", // FREE, PRO, ENTERPRISE
  planStatus: "ACTIVE", // TRIAL, ACTIVE, SUSPENDED, CANCELLED
  trialExpiresAt: "2026-06-20T23:59:59Z",
  createdAt: "2026-05-15",
  updatedAt: "2026-06-06"
}
```

### Subscription

```typescript
{
  tenantId: "tenant-uuid",
  planTier: "PRO",
  monthlyPriceInCents: 9900,
  billingCycleStart: "2026-06-01",
  billingCycleEnd: "2026-06-30",
  nextBillDate: "2026-07-01",
  autoRenew: true,
  usageMetrics: {
    apiCallsUsed: 450,
    apiCallsLimit: 500,
    activeUsers: 12,
    activeUsersLimit: 15
  }
}
```

### Usage Log (Telemetry)

```typescript
{
  tenantId: "tenant-uuid",
  timestamp: "2026-06-06T14:32:00Z",
  eventType: "API_CALL", // API_CALL, BOOKING_CREATED, PAYMENT_PROCESSED
  metadata: {
    endpoint: "/api/v1/schedules/search",
    statusCode: 200,
    responseTimeMs: 142,
    userId: "user-uuid" // if applicable
  }
}
```

### Platform Metric (Aggregated, hourly)

```typescript
{
  timestamp: "2026-06-06T14:00:00Z",
  apiErrorCount: 2,
  apiSuccessCount: 4298,
  totalBookings: 52,
  totalRevenue: 262000, // in minor units
  activeConnections: 125,
  cpuUsage: 35,
  memoryUsage: 48,
  diskUsage: 62
}
```

### Audit Log Entry

```typescript
{
  id: "audit-uuid",
  timestamp: "2026-06-06T14:32:00Z",
  actor: {
    id: "admin-user-id",
    name: "System Admin",
    type: "SUPER_ADMIN" | "SYSTEM"
  },
  action: "UPDATED", // CREATE, READ, UPDATE, DELETE, SUSPEND, etc.
  resourceType: "TENANT", // TENANT, BOOKING, PAYMENT, SUBSCRIPTION
  resourceId: "tenant-uuid",
  changes: {
    before: { planTier: "FREE" },
    after: { planTier: "PRO" }
  },
  ipAddress: "203.x.x.x"
}
```

---

## Required API Endpoints

### Platform Admin Endpoints

```
GET    /api/v1/platform/dashboard/overview      → KPI cards
GET    /api/v1/platform/dashboard/metrics       → Graphs data
GET    /api/v1/platform/tenants                 → List with filters
POST   /api/v1/platform/tenants                 → Create tenant
GET    /api/v1/platform/tenants/:id             → Tenant detail
PATCH  /api/v1/platform/tenants/:id             → Update plan/status
POST   /api/v1/platform/tenants/:id/suspend     → Suspend tenant
DELETE /api/v1/platform/tenants/:id             → Delete tenant

GET    /api/v1/platform/usage                   → Usage by tenant
GET    /api/v1/platform/usage/:tenantId         → Usage detail

GET    /api/v1/platform/billing/revenue         → Revenue summary
GET    /api/v1/platform/billing/subscriptions   → Subscription list
POST   /api/v1/platform/billing/subscriptions/:id/upgrade  → Plan change

GET    /api/v1/platform/health                  → System status
GET    /api/v1/platform/health/metrics          → CPU, memory, etc.

GET    /api/v1/platform/support/tickets         → Support list
POST   /api/v1/platform/support/tickets/:id/reply → Reply
PATCH  /api/v1/platform/support/tickets/:id     → Update status

GET    /api/v1/platform/audit-logs              → Audit list with filters
GET    /api/v1/platform/audit-logs/export       → Export CSV
```

---

## Implementation Phases

### Phase 1 (MVP)

- [ ] Platform overview (basic KPI cards)
- [ ] Tenant list & detail view
- [ ] Tenant CRUD + suspend/activate
- [ ] Basic usage analytics
- [ ] Audit logs

### Phase 2

- [ ] Billing & subscription management
- [ ] Revenue reporting
- [ ] System health monitoring
- [ ] Support ticket integration

### Phase 3

- [ ] Advanced analytics (cohort, churn)
- [ ] Automated alerts & notifications
- [ ] Bulk tenant operations
- [ ] Custom reports & exports

---

## Security Considerations

1. **RBAC:** Only `SUPER_ADMIN` users can access platform admin
2. **Rate limiting:** Strict limits on platform endpoints
3. **Audit logging:** Every action logged (who, what, when, from where)
4. **Data isolation:** Platform admin sees all tenant data but cannot modify customer data directly
5. **IP whitelisting:** Optional restriction to known admin IPs
6. **Session timeout:** Shorter TTL for platform admin sessions (15 min)
7. **Two-factor authentication:** Required for SUPER_ADMIN login

---

## Design System

**Colors:**

- Primary: `#2e7d32` (green, from existing theme)
- Danger/Alert: `#c62828` (red)
- Warning: `#f57c00` (orange)
- Success: `#388e3c` (dark green)
- Info: `#1976d2` (blue)
- Neutral: grays

**Typography:**

- Headers: Bold, uppercase labels (e.g., "NET REVENUE")
- Data: Monospace for numbers (align decimals)
- Status badges: Small caps, color-coded

**Spacing:** Consistent with existing app (8px grid)

**Responsive:** Mobile-first; optimize for 1200px+ (typical admin screen width)
