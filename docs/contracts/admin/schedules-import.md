# POST /api/v1/admin/schedules/import

| Field | Value |
|-------|--------|
| **Task ID** | E04-08 |
| **Module** | admin / schedules |
| **Auth** | `ADMIN` |
| **Zod (body)** | `importSchedulesSchema` |
| **Zod (response)** | `importResultDtoSchema` |

## Description

Bulk-create schedules from parsed CSV rows. Each row creates a `Schedule` and its `ScheduleSeat` inventory in a single transaction.

## Request body

```json
{
  "rows": [
    {
      "routeSlug": "dhaka-pabna",
      "coachNumber": "DH-1001",
      "departureAt": "2026-06-10T06:00:00+06:00",
      "estimatedArrivalAt": "2026-06-10T11:30:00+06:00",
      "baseFareTaka": 850
    }
  ]
}
```

- `routeSlug` / `coachNumber` resolved within tenant
- `baseFareTaka` converted to minor units (× 100)
- Coach must have a seat layout
- Past `departureAt` rejected per row

## Response 200

```json
{
  "data": {
    "created": 1,
    "skipped": 0,
    "errors": []
  }
}
```

## CSV template

```csv
routeSlug,coachNumber,departureAt,estimatedArrivalAt,baseFareTaka
dhaka-pabna,DH-1001,2026-06-10T06:00:00+06:00,2026-06-10T11:30:00+06:00,850
```
