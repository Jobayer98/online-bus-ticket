# POST /api/v1/admin/coaches/import

| Field | Value |
|-------|--------|
| **Task ID** | E02-11 |
| **Module** | admin / coaches |
| **Auth** | `ADMIN` |
| **Zod (body)** | `importCoachesSchema` |
| **Zod (response)** | `importResultDtoSchema` |

## Description

Bulk-create coaches from parsed CSV rows (client parses CSV and sends JSON).

## Request body

```json
{
  "rows": [
    {
      "coachNumber": "DH-2001",
      "busType": "AC",
      "seatLayoutName": "40 Seat Standard"
    }
  ],
  "skipDuplicates": true
}
```

- `busType`: `AC` or `NON_AC` (aliases like `Non AC` normalized server-side)
- `seatLayoutName`: optional; matched by name within tenant; omit or blank for no layout
- `skipDuplicates`: when `true`, existing `coachNumber` rows are skipped (counted in `skipped`)

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

Per-row validation errors (unknown layout, invalid bus type) appear in `errors` with 1-based `row` index.

## CSV template

```csv
coachNumber,busType,seatLayoutName
DH-2001,AC,40 Seat Standard
DH-2002,NON_AC,
```
