# GET /api/v1/schedules/search

| Field | Value |
|-------|--------|
| **Task ID** | E05-03 (API), E05-01 (schema) |
| **Module** | schedule |
| **Auth** | public |
| **Zod (request)** | `packages/shared/src/schemas/schedule/search-schedules.schema.ts` |
| **Zod (response)** | `packages/shared/src/dtos/schedule/schedule-card.dto.ts` |

## Description

Returns available bus schedules for a route and date, with optional filters (bus type, time period, seat class). Rejects past dates.

## Request

### Query

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `fromStopId` | UUID | yes | Origin stop |
| `toStopId` | UUID | yes | Destination stop |
| `date` | string (ISO date) | yes | `YYYY-MM-DD`, must be >= today (Asia/Dhaka) |
| `busType` | `AC` \| `NON_AC` | no | Filter |
| `timePeriod` | `MORNING` \| `NOON` \| `AFTERNOON` \| `NIGHT` | no | Filter by departure window |
| `seatClass` | `STANDARD` \| `PREMIUM` \| `BUSINESS` | no | Filter schedules with that class available |

## Response

### 200 Success

```json
{
  "data": [
    {
      "scheduleId": "uuid",
      "coachNumber": "DH-1234",
      "startPoint": "Dhaka",
      "departureAt": "2026-05-20T06:00:00.000Z",
      "endPoint": "Pabna",
      "estimatedArrivalAt": "2026-05-20T11:30:00.000Z",
      "busType": "AC",
      "fareFrom": 85000,
      "availableSeats": 24,
      "routeSlug": "dhaka-pabna"
    }
  ]
}
```

`fareFrom` is integer minor units (poisa). UI formats for display.

### Errors

| HTTP | code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | Invalid UUID, past date, bad enum |
| 404 | ROUTE_NOT_FOUND | No route for stop pair |

## Example

```bash
curl -G "http://localhost:4000/api/v1/schedules/search" \
  --data-urlencode "fromStopId=..." \
  --data-urlencode "toStopId=..." \
  --data-urlencode "date=2026-05-20" \
  --data-urlencode "busType=AC" \
  --data-urlencode "timePeriod=MORNING"
```

## Changelog

| Date | Change |
|------|--------|
| 2026-05-19 | Initial contract (planned) |
