# GET /api/v1/bookings/:id

| Field | Value |
|-------|--------|
| **Task ID** | E14-03 |
| **Module** | booking |
| **Auth** | `accessToken` query (from POST /bookings) **or** authenticated booking owner |
| **Zod (query)** | `packages/shared/src/schemas/booking/booking.schema.ts` |
| **Zod (response)** | `packages/shared/src/dtos/booking/booking.dto.ts` |

## Description

Returns booking summary for checkout/payment. Does **not** expose PII to anonymous callers — unknown id, wrong token, and missing auth all return the same `404`.

## Query

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `accessToken` | string | guest yes | Signed token from `POST /bookings` (`bookingAccessToken`) |

Logged-in users who own the booking may omit `accessToken`.

## Response 200

```json
{
  "data": {
    "id": "…",
    "status": "HELD",
    "scheduleId": "…",
    "passengerName": "…",
    "passengerPhone": "…",
    "totalAmount": 85000,
    "seatLabels": ["A1"],
    "holdExpiresAt": "…"
  }
}
```

## Errors

| HTTP | code | When |
|------|------|------|
| 404 | BOOKING_NOT_FOUND | Unknown id or access denied (generic) |

## Example

```bash
curl -G "http://localhost:4000/api/v1/bookings/clx…" \
  --data-urlencode "accessToken=…"
```
