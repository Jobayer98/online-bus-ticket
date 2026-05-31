# GET /api/v1/admin/reports/analytics/overview

| Field | Value |
|-------|--------|
| **Task ID** | E14-13, E14-15 |
| **Module** | admin / reports |
| **Auth** | `ADMIN` |
| **Zod (response)** | `packages/shared/src/dtos/admin/reports.dto.ts` → `analyticsOverviewSchema` |

## Description

Dashboard KPIs for the **last 30 Dhaka calendar days** (through end of today in Asia/Dhaka).

All revenue metrics use the same gross / refund / net model as the sales report. Seat and schedule metrics are explicitly scoped:

| Field | Scope |
|-------|-------|
| `ticketsSold30d` | PAID bookings created in last 30d |
| `seatsSold30d` | Booking seats on PAID or REFUNDED bookings created in last 30d |
| `upcomingSchedules` | `SCHEDULED` trips with `departureAt > now` (lifetime, not 30d) |

## Response 200

```json
{
  "data": {
    "grossRevenue30d": 1250000,
    "refundTotal30d": 85000,
    "netRevenue30d": 1165000,
    "ticketsSold30d": 48,
    "refundCount30d": 2,
    "seatsSold30d": 52,
    "upcomingSchedules": 6,
    "avgTicketValue": 26041
  }
}
```

## Example

```bash
curl http://localhost:4000/api/v1/admin/reports/analytics/overview \
  -H "Authorization: Bearer …"
```
