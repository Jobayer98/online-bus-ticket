# POST /api/v1/bookings/hold

| Field | Value |
|-------|--------|
| **Task ID** | E14-12 |
| **Module** | booking |
| **Auth** | public |
| **Zod (request)** | `packages/shared/src/schemas/booking/booking.schema.ts` → `createHoldSchema` |
| **Rate limit** | `HOLD_CREATE_RATE_LIMIT` — 20 requests / IP / minute |

## Request body

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `scheduleId` | string | yes | |
| `seatLabels` | string[] | yes | 1–10 labels |
| `sessionId` | string | yes | Browser session binding (guest) |

## Response 201

Hold DTO with `holdId`, `expiresAt`, `seatLabels`, `totalAmount`, `lineItems`.

## Errors

| HTTP | code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | Invalid body |
| 409 | SEAT_NOT_AVAILABLE | Seat taken |
| 429 | — | Rate limit exceeded |
