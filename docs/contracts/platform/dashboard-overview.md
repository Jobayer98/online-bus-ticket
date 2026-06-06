# Platform — Dashboard Overview Contract

**Version:** v1  
**Route:** `GET /api/v1/platform/dashboard/overview`  
**Role required:** `SUPER_ADMIN`

---

## Query params

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `periodDays` | number | 30 | Rolling window for revenue KPI (7–90) |

Parsed by `platformDashboardQuerySchema` from `@repo/shared`.

---

## Response `200`

```json
{
  "data": {
    "totalMrr": 1980000,
    "activeTenants": 2,
    "licensedCapacity": 10,
    "monthlyBookings": 45,
    "platformRevenue30d": 1250000,
    "bookingsGrowthPct": 12.5,
    "platformUptimePct": 99.9,
    "topTenants": [
      {
        "tenantId": "clx...",
        "name": "Dhaka Express",
        "slug": "dhaka-express",
        "planTier": "PRO",
        "planStatus": "ACTIVE",
        "bookingsThisMonth": 25,
        "revenueThisMonth": 625000
      }
    ],
    "planDistribution": [
      { "planTier": "FREE", "count": 1, "percentage": 50 },
      { "planTier": "PRO", "count": 1, "percentage": 50 }
    ],
    "alerts": [
      {
        "severity": "warning",
        "message": "Khulna Express trial active",
        "tenantId": "clx...",
        "tenantName": "Khulna Express"
      }
    ]
  }
}
```

**Notes:**

- Money fields are integer minor units (poisa).
- `totalMrr` sums `PLAN_MONTHLY_PRICE_MINOR` for tenants with `planStatus` in `ACTIVE` or `TRIAL` and tier ≠ `FREE`.
- `platformUptimePct` is a stub (99.9) until E24 system metrics ship.
