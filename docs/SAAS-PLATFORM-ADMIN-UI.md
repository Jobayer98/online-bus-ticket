# Platform Admin Dashboard — UI Wireframes & Design

## 1. Main Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLATFORM ADMIN DASHBOARD                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Dashboard                                                    🔔 ⚙️  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ QUICK FILTERS:  All Status ▼  All Plans ▼  [Search...] 📅 Last 30 Days    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         KEY METRICS (Real-time)                             │
├──────────────────────┬──────────────────────┬──────────────────────┐        │
│ MONTHLY REVENUE      │ ACTIVE TENANTS       │ TOTAL BOOKINGS       │        │
│                      │                      │                      │        │
│ ৳ 4,524,000        │ 8 / 10 (80%)         │ 2,450                │        │
│ ↑ +12.5% vs May      │ ↑ +1 since last mo   │ ↑ +18.2% vs May      │        │
└──────────────────────┴──────────────────────┴──────────────────────┘        │
├──────────────────────┬──────────────────────┬──────────────────────┐        │
│ PLATFORM UPTIME      │ MONTHLY CHURN        │ MRR GROWTH           │        │
│                      │                      │                      │        │
│ 99.98%               │ 5.2% (1 cancelled)   │ ৳ +450,000           │        │
│ ✅ Last 30 days     │ ⚠️  Pabna at risk    │ ↑ +11% vs May        │        │
└──────────────────────┴──────────────────────┴──────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ REVENUE TREND (Last 6 Months)                 [Line Chart]                  │
│                                                                              │
│  ৳5M  ╱                                                                      │
│       │         ╱╲     ╱╲     ╱╲     ╱╲                                     │
│  ৳4M  │        ╱  ╲   ╱  ╲   ╱  ╲   ╱  ╲                                    │
│       │       ╱    ╲ ╱    ╲ ╱    ╲ ╱    ╲                                   │
│  ৳3M  │______╱      ╲     ╲╱      ╲                                        │
│        Jan   Feb   Mar   Apr   May   Jun                                    │
│                                                                              │
│  Average: ৳ 3.8M | Trend: ↑ Growing                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ TENANT BREAKDOWN (Top 5 by Revenue)                                         │
├─────────────┬──────────┬────────────┬──────────────┬──────────┐             │
│ #  TENANT   │ BOOKINGS │ MRR        │ PLAN         │ STATUS   │             │
├─────────────┼──────────┼────────────┼──────────────┼──────────┤             │
│ 1  Dhaka Exp│   250    │ ৳ 600,000  │ PRO          │ ✅ ACTIVE│             │
│ 2  Pabna Tr │   180    │ ৳ 540,000  │ PRO          │ ⚠️ ACTIVE │             │
│ 3  Sylhet B │   120    │ ৳ 360,000  │ PRO          │ ✅ ACTIVE│             │
│ 4  Khulna E │    85    │ ৳ 180,000  │ FREE/TRIAL   │ ✅ TRIAL │             │
│ 5  Barisal  │    60    │ ৳ 90,000   │ FREE         │ ✅ ACTIVE│             │
├─────────────┼──────────┼────────────┼──────────────┼──────────┤             │
│ TOTAL       │  2,450   │ ৳ 4.5M     │              │          │             │
└─────────────┴──────────┴────────────┴──────────────┴──────────┘             │
                         [View All Tenants →]                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SYSTEM HEALTH                          [Plan Distribution (Pie)]            │
├──────────────────────────────────────────┬────────────────────────────────┤│
│ ✅ API Service        | 99.9% uptime     │   FREE   ████ 20%             ││
│ ✅ Database           | 145ms avg query  │   PRO    ████████████ 80%     ││
│ ✅ Email Service      | 94.2% delivery   │   ENT    ░  0%                ││
│ ⚠️  Storage          | 62% used         │                                ││
│                                          │ (Total: 10 tenants)            ││
│ Last Issues (7 days): 0 critical        │                                ││
└──────────────────────────────────────────┴────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ALERTS & ACTIONS                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔴 Pabna Transit payment failed x2 — [Retry] [Contact]                     │
│ 🟡 Khulna Travels trial expires in 7 days — [Upsell] [Extend]              │
│ 🟢 New registration: Rangpur Coach Service (free tier) [Verify]            │
│ 🔵 Monthly invoices sent to 8 tenants — [View Report]                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tenant Management Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TENANT MANAGEMENT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Tenants  [+ Create Tenant]                           🔍 📤 [Filter ▼]│
└─────────────────────────────────────────────────────────────────────────────┘

┌─ FILTERS ────────────────────────────────────────────────────────────────────┐
│ Status: [All ▼]  Plan: [All ▼]  Created: [All Time ▼]  [Search by name...] │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ TENANT LIST ────────────────────────────────────────────────────────────────┐
│                                                                              │
│ ☐ NAME              SLUG              PLAN      STATUS    USERS    MRR      │
│ ──────────────────────────────────────────────────────────────────────────── │
│ ☑ Dhaka Express     dhaka-express     PRO       ACTIVE    12     ৳ 6,000   │
│   📊 Jan | 250 bookings | ৳625K revenue | ↑ Growing                         │
│   [View] [Edit] [Details] [Suspend] [Message]                              │
│                                                                              │
│ ☐ Pabna Transit     pabna-transit     PRO       ACTIVE    8      ৳ 6,000   │
│   ⚠️  PAYMENT ISSUE - Last charge failed 2x                                 │
│   📊 Jan | 180 bookings | ৳540K revenue | ↓ Declining                       │
│   [View] [Edit] [Details] [Retry Payment] [Downgrade] [Message]            │
│                                                                              │
│ ☐ Sylhet Bus        sylhet-bus        PRO       ACTIVE    6      ৳ 6,000   │
│   📊 Jan | 120 bookings | ৳360K revenue | → Stable                          │
│   [View] [Edit] [Details] [Suspend] [Message]                              │
│                                                                              │
│ ☐ Khulna Express    khulna-express    FREE      TRIAL     2      ৳ 0       │
│   ⏰ TRIAL EXPIRES: 7 days (2026-06-13)                                     │
│   📊 Jan | 45 bookings | ৳180K revenue | ↑ Good growth                      │
│   [View] [Edit] [Details] [Upsell PRO] [Extend Trial]                      │
│                                                                              │
│ ☐ Rangpur Coach     rangpur-coach     FREE      ACTIVE    1      ৳ 0       │
│   📊 Jan | 25 bookings | ৳50K revenue | → Stable                            │
│   [View] [Edit] [Details] [Delete] [Message]                               │
│                                                                              │
│ ☐ Barisal Transport barisal-trans     PRO       SUSPENDED 0      ৳ 6,000   │
│   🔴 SUSPENDED: Payment failed 5x                                          │
│   [Reactivate] [Delete] [Collect Payment]                                  │
│                                                                              │
│ ... (showing 6 of 8 active; 2 cancelled)                                    │
│                                                                              │
│ [◄ Previous] Page 1 of 2 [Next ►]  Rows per page: [20 ▼]                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ BULK ACTIONS ───────────────────────────────────────────────────────────────┐
│ 2 selected  [Send Announcement] [Export CSV] [Change Plan] [Suspend]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tenant Detail Sidebar

```
┌─────────────────────────────────────────┐
│ DHAKA EXPRESS                           │
│ Status: ✅ ACTIVE                       │
│ Since: May 15, 2026                     │
└─────────────────────────────────────────┘

┌─ ORG INFO ──────────────────────────────┐
│ Full Name:                              │
│ Dhaka Express Travel Co. Ltd.           │
│                                         │
│ Slug: dhaka-express                     │
│ Subdomain: dhaka-express.busbooking.io │
│ Custom Domain: None                     │
│                                         │
│ Admin: Rahim Khan                       │
│ Email: rahim@dhakaexpress.com           │
│ Phone: +880 1700000000                  │
└─────────────────────────────────────────┘

┌─ SUBSCRIPTION ──────────────────────────┐
│ Plan: PRO                               │
│ Price: ৳ 9,900/month                    │
│ Next Bill: Jul 1, 2026                  │
│ Auto-renew: ✅ Yes                      │
│                                         │
│ Usage:                                  │
│ • API Calls: 450/500 (90%)              │
│ • Users: 12/15 (80%)                    │
│                                         │
│ [Upgrade to ENT] [Downgrade] [Cancel]   │
└─────────────────────────────────────────┘

┌─ THIS MONTH ────────────────────────────┐
│ Bookings: 250                           │
│ Revenue: ৳ 625,000                      │
│ Refunds: ৳ 75,000                       │
│ Net: ৳ 550,000                          │
│                                         │
│ Trend: ↑ +15% vs May                    │
│ Churn Risk: Low                         │
└─────────────────────────────────────────┘

┌─ QUICK ACTIONS ─────────────────────────┐
│ [Full View] [Suspend] [Delete]          │
│ [Send Message] [View Dashboard]         │
│ [Manage Users] [Reset Password]         │
└─────────────────────────────────────────┘
```

---

## 4. Billing & Revenue Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BILLING & REVENUE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Billing  [Period: Last 30 Days ▼]  📊 📤                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ SUMMARY ────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  MONTHLY RECURRING REVENUE        ACTIVE SUBSCRIPTIONS      REVENUE TREND   │
│  ৳ 4,524,000                      9 active                  [Graph:uptrend] │
│  ↑ +12.5% vs May                  ├ 7 × PRO                 May→Jun +18%    │
│                                    └ 2 × FREE                                │
│                                                                              │
│  CHURN ANALYSIS                   COLLECTIONS              REFUNDS          │
│  5.2% (1 tenant)                  ✅ 8/9 paid this cycle    ৳ 75,000 (M)   │
│  ⚠️ Pabna at risk                 ⚠️ 1 failed × 2           0 disputes      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ BILLING TABLE ──────────────────────────────────────────────────────────────┐
│                                                                              │
│ TENANT              PLAN     MRR          NEXT BILL    STATUS    INVOICE     │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Dhaka Express       PRO      ৳ 9,900     Jun 30      ✅ PAID   [PDF]       │
│ Pabna Transit       PRO      ৳ 9,900     Jun 28      ⚠️ RETRY  [PDF]       │
│ Sylhet Bus          PRO      ৳ 9,900     Jul 1       ✅ PAID   [PDF]       │
│ Khulna Express      FREE     ৳ 0         —           ⏰ TRIAL  —            │
│ Rangpur Coach       FREE     ৳ 0         —           ✅ FREE   —            │
│                                                                              │
│ [Retry Payment] [Issue Refund] [Apply Discount] [Send Invoice]             │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ MRR PROJECTION (Next 3 Months) ─────────────────────────────────────────────┐
│                          [Bar chart]                                         │
│                                                                              │
│ June:  ৳ 4.5M    ████████████████████                                       │
│ July:  ৳ 4.7M    ████████████████████░░ (est. +1 new)                       │
│ Aug:   ৳ 4.4M    ██████████████████░░ (est. -1 churn)                       │
│                                                                              │
│ Forecast: Stable growth if churn remains <6%                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Analytics Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM ANALYTICS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Analytics  [Period: Last 30 Days ▼] [Tenant: All ▼]  📥 📤           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ USAGE BY TENANT ────────────────────────────────────────────────────────────┐
│ Rank  TENANT           BOOKINGS  %    API CALLS   AVG RESP   ERROR RATE    │
│ ────────────────────────────────────────────────────────────────────────── │
│  1    Dhaka Express     250      10%   1,250      142ms      0.1%         │
│  2    Pabna Transit     180      7%    950        156ms      0.3%         │
│  3    Sylhet Bus        120      5%    620        138ms      0.0%         │
│  4    Others combined   1,900    78%   9,500      145ms      0.2%         │
│                                                                             │
│ Total Platform:        2,450     100%  12,320     145ms      0.2%          │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ KEY METRICS ───────────────────────────────────────────────────────────────┐
│ Booking Growth: 2,450 (↑ 8.2% vs May)                                      │
│ Active Users: 850 (↑ 12% vs May)                                           │
│ API Success Rate: 99.8% (↓ 0.1% vs May)                                    │
│ Avg Response Time: 145ms (↑ 5ms vs May)                                    │
│ Data Storage Used: 62% of quota                                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ CHARTS ─────────────────────────────────────────────────────────────────────┐
│                                                                              │
│ [Line] Bookings Over Time        [Pie] Traffic by Plan Tier                 │
│  2500│     ╱╲     ╱╲                  PRO      ████████ 65%                 │
│  2250│    ╱  ╲   ╱  ╲               FREE      ███░░░░░ 25%                 │
│  2000│___╱    ╲_╱    ╲             ENT       ░░░░░░░░ 10%                  │
│       May    Jun    Jul                                                    │
│                                                                              │
│ [Bar] Top Routes                 [Donut] Device/Browser Mix                │
│ Dhaka-Pabna  ███████ 450              Mobile    ████████ 55%               │
│ Dhaka-Sylhet ████░░░░░░░░░ 280        Desktop   ████░░░░░ 40%              │
│ Other        ███ 150                  Tablet    ░░░ 5%                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ EXPORT OPTIONS ─────────────────────────────────────────────────────────────┐
│ [📥 CSV] [📊 Excel] [📈 PDF Report]                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. System Health Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SYSTEM HEALTH & MONITORING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > System                                  Last Updated: 2 min ago     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ STATUS SUMMARY ─────────────────────────────────────────────────────────────┐
│                                                                              │
│  ✅ API Service          | Healthy | 99.9% uptime | 145ms avg latency      │
│  ✅ Database             | Healthy | 1425 connections | 62% disk used       │
│  ✅ Cache (Redis)        | Healthy | 145MB used | 98% hit rate             │
│  ⚠️  Email Service       | Degraded| 94.2% delivery | 2.3s avg latency      │
│  ✅ Payment Gateway      | Healthy | 100% uptime | Processing normally     │
│  ✅ CDN & Storage        | Healthy | 62% quota used | Fast responses       │
│                                                                              │
│  Overall Status: ✅ OPERATIONAL (all systems nominal)                       │
│                                                                              │
│  Last Incident: May 28 @ 3:15 AM (35 min outage, DB restart)                │
│  Scheduled Maintenance: Jun 15, 2:00–4:00 AM (Dhaka time)                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ REAL-TIME METRICS ──────────────────────────────────────────────────────────┐
│ CPU Usage:      35%  ████████░░░░░░░░░░░                                    │
│ Memory Usage:   48%  ████████████░░░░░░░░░                                  │
│ Disk Usage:     62%  ████████████████░░░░░░░░                               │
│ Connections:    125/200 (62%)  ████████████░░░░░░░░░                        │
│ Request Queue:  3 pending (normal: <5)                                     │
│                                                                              │
│ Last 60s: ✅ No issues                                                      │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ RECENT ERRORS (Last 24h) ───────────────────────────────────────────────────┐
│                                                                              │
│ TIME (Dhaka)    SEVERITY  TYPE               COUNT  ENDPOINT               │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Jun 6 14:45     INFO      Rate Limit         1      /api/v1/schedules/s..  │
│ Jun 6 13:22     WARNING   Slow Query         1      SELECT * FROM bookings  │
│ Jun 6 11:08     INFO      Payment Timeout    1      /api/v1/payments/conf..  │
│ Jun 5 22:14     ERROR     Email Failed       2      Notification service    │
│                                                                              │
│ [View Full Logs] [Configure Alerts] [Export]                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ UPTIME CHART (Last 7 Days) ─────────────────────────────────────────────────┐
│                                                                              │
│ 100% ████████████████████████████████████████████████████████████████      │
│  99% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│ Jun 1  Jun 2  Jun 3  Jun 4  Jun 5  Jun 6                                   │
│                                                                              │
│ Current Week: 99.95% uptime                                                │
│ Current Month: 99.98% uptime (SLA target: 99.9% ✅ MET)                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ ACTIONS ────────────────────────────────────────────────────────────────────┐
│ [🔔 Configure Alerts] [📋 View Full Logs] [⚙️ Settings] [🔄 Force Refresh]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Audit Logs Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUDIT LOGS                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home > Audit  [Date Range ▼]  [Actor: All ▼]  [Action: All ▼]  🔍         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ ACTIVITY LOG ───────────────────────────────────────────────────────────────┐
│                                                                              │
│ 2026-06-06 14:32 │ You (admin)        │ UPDATED  │ Tenant      │ INFO      │
│                  │ Dhaka Express plan │ FREE→PRO │ from subnet │           │
│                  │                    │ Billing  │ 203.x.x.x   │           │
│                  │                    │ updated  │ [Details]   │           │
│                                                                              │
│ 2026-06-06 12:15 │ System             │ SUSPENDED│ Tenant      │ INFO      │
│                  │ (auto-process)     │ Pabna    │ Payment     │           │
│                  │                    │ Transit  │ failed x3   │           │
│                  │                    │ [Retry]  │ [Details]   │           │
│                                                                              │
│ 2026-06-05 09:42 │ Rahim Khan         │ CREATED  │ Booking     │ INFO      │
│                  │ (tenant admin)     │ Order    │ Dhaka-Pabna │           │
│                  │                    │ #82941   │ from subnet │           │
│                  │                    │ [Details]│ 103.x.x.x   │           │
│                                                                              │
│ 2026-06-04 16:28 │ Farhana Akter      │ DELETED  │ Schedule    │ WARNING   │
│                  │ (tenant user)      │ Schedule │ Trip #4521  │           │
│                  │ (admin)            │ deleted  │ Dhaka-Pabna │           │
│                  │                    │ [Details]│ [Details]   │           │
│                                                                              │
│ ... (20 shown; 3,847 total this month)                                      │
│                                                                              │
│ [◄ Previous] Page 1 of 193 [Next ►]                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ EXPORT ──────────────────────────────────────────────────────────────────────┐
│ [📥 CSV (Current)] [📊 Excel (All)] [📈 PDF Report] [🔍 Advanced Search]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile Responsive Considerations

### Mobile (< 768px)

- Stack KPI cards vertically (1 column)
- Hide secondary columns in tables (keep Name, Status, Action)
- Use horizontal scroll for wide tables
- Slide-out sidebar details
- Bottom sheet for filters

### Tablet (768px - 1024px)

- 2-column KPI grid
- Show 2-3 main table columns + Actions
- Sidebar becomes collapsible panel

### Desktop (>1024px)

- Full 4-column layouts
- All columns visible
- Hover states and inline actions
