# GET /api/v1/admin/reports/sales

| Field | Value |
|-------|--------|
| **Task ID** | E14-13, E14-14 |
| **Module** | admin / reports |
| **Auth** | `ADMIN` |
| **Zod (query)** | `packages/shared/src/schemas/admin/reports.schema.ts` → `reportsDateRangeQuerySchema` |
| **Zod (response)** | `packages/shared/src/dtos/admin/reports.dto.ts` → `salesReportSchema` |

## Description

Sales report for a date range. Dates are **YYYY-MM-DD** in the **Asia/Dhaka** calendar; the `to` day is inclusive through 23:59:59.999 Dhaka.

Revenue fields:

| Field | Meaning |
|-------|---------|
| `grossRevenue` | Sum of `PAID` bookings created in range |
| `refundTotal` | Sum of `CounterTransaction` type `REFUND` in range (positive magnitude) |
| `netRevenue` | `grossRevenue - refundTotal` |

Channel breakdown uses gross booking revenue only. Refunds are counter-audited regardless of original channel.

## Query parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `from` | string | no | YYYY-MM-DD; default 30 days before `to` |
| `to` | string | no | YYYY-MM-DD; default today (Dhaka) |

## Response 200

```json
{
  "data": {
    "from": "2026-04-30T18:00:00.000Z",
    "to": "2026-05-31T17:59:59.999Z",
    "grossRevenue": 150000,
    "refundTotal": 50000,
    "netRevenue": 100000,
    "ticketCount": 2,
    "refundCount": 1,
    "online": { "count": 1, "grossRevenue": 100000 },
    "counter": { "count": 1, "grossRevenue": 50000 },
    "byRoute": [{ "routeSlug": "dhaka-pabna", "count": 2, "grossRevenue": 150000 }]
  }
}
```

## Example

```bash
curl "http://localhost:4100/api/v1/admin/reports/sales?from=2026-05-01&to=2026-05-31" \
  -H "Authorization: Bearer …"
```
