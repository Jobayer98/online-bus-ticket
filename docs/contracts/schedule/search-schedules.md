# GET /api/v1/schedules/search

| Field | Value |
|-------|--------|
| **Task ID** | E05-03, E14-17 |
| **Module** | schedule |
| **Auth** | public |
| **Zod (query)** | `packages/shared/src/schemas/schedule/search-schedules.schema.ts` → `searchSchedulesQuerySchema` |
| **Zod (response)** | `packages/shared/src/dtos/schedule/schedule-card.dto.ts` → `scheduleCardSchema[]` |

## Description

Search scheduled trips between two stops on a trip date. Filters combine with AND logic.

## Query parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `fromStopId` | string (cuid) | yes | Origin stop |
| `toStopId` | string (cuid) | yes | Destination stop |
| `date` | string | yes | YYYY-MM-DD, must be today or later (Asia/Dhaka) |
| `busType` | enum | no | `AC` \| `NON_AC` |
| `timePeriod` | enum | no | `MORNING` \| `NOON` \| `AFTERNOON` \| `NIGHT` |
| `seatClass` | enum | no | Filter schedules with available seats in this class |

## Response 200

Array of schedule cards wrapped in `{ data }`.

Each `ScheduleCardDto` includes:

| Field | Type | Notes |
|-------|------|-------|
| `scheduleId` | string | |
| `coachNumber` | string | |
| `startPoint` | string | From stop name |
| `endPoint` | string | To stop name |
| `departureAt` | ISO datetime | UTC |
| `estimatedArrivalAt` | ISO datetime | UTC |
| `busType` | enum | Coach bus type |
| `seatClasses` | enum[] | Distinct seat classes on the layout (`STANDARD`, `PREMIUM`, `BUSINESS`) — filter labels only; all seats priced at `baseFare` |
| `fareFrom` | int | Minimum available seat price (equals `baseFare` under flat pricing) |
| `availableSeats` | int | Count of `AVAILABLE` seats |
| `routeSlug` | string | e.g. `dhaka-pabna` |

## Errors

| HTTP | code | When |
|------|------|------|
| 404 | NOT_FOUND | Unknown stop |
| 404 | ROUTE_NOT_FOUND | No route for city pair |
| 400 | VALIDATION_ERROR | Invalid date or query |

## Example

```bash
curl "http://localhost:4000/api/v1/schedules/search?fromStopId=…&toStopId=…&date=2026-05-31&seatClass=BUSINESS"
```

## Response snippet

```json
{
  "data": [
    {
      "scheduleId": "clx…",
      "coachNumber": "DH-101",
      "startPoint": "Gabtoli",
      "endPoint": "Pabna",
      "departureAt": "2026-05-31T04:30:00.000Z",
      "estimatedArrivalAt": "2026-05-31T10:00:00.000Z",
      "busType": "AC",
      "seatClasses": ["STANDARD", "PREMIUM", "BUSINESS"],
      "fareFrom": 85000,
      "availableSeats": 32,
      "routeSlug": "dhaka-pabna"
    }
  ]
}
```
