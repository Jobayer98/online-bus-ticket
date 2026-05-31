# GET /api/v1/admin/reports/export/csv

| Field | Value |
|-------|--------|
| **Task ID** | E14-14, E14-16 |
| **Module** | admin / reports |
| **Auth** | `ADMIN` |
| **Zod (query)** | `reportsDateRangeQuerySchema` |

## Description

CSV export for the same Dhaka date range as the sales report. Includes:

- **SALE** rows — `PAID` bookings (positive `amount`)
- **REFUND** rows — `CounterTransaction` type `REFUND` (negative `amount`)

This reconciles with counter shift totals: net of amounts equals `netRevenue` from the sales report for the same range.

## Query parameters

Same as [sales report](sales.md): `from`, `to` (YYYY-MM-DD, Asia/Dhaka).

## Response 200

`Content-Type: text/csv`

```csv
type,id,route,amount,channel,createdAt
SALE,clxbook001,dhaka-pabna,85000,ONLINE,2026-05-20T05:00:00.000Z
REFUND,clxbook002,dhaka-pabna,-85000,COUNTER,2026-05-21T06:00:00.000Z
```

## Example

```bash
curl "http://localhost:4000/api/v1/admin/reports/export/csv?from=2026-05-01&to=2026-05-31" \
  -H "Authorization: Bearer …" \
  -o sales.csv
```
