# POST /api/v1/counter/sell

| Field | Value |
|-------|--------|
| **Task ID** | E14-09 |
| **Module** | counter |
| **Auth** | `COUNTER_SELLER` or `ADMIN` |
| **Zod (request)** | `packages/shared/src/schemas/counter/counter.schema.ts` → `counterSellSchema` |
| **Zod (response)** | `packages/shared/src/dtos/payment/payment.dto.ts` → `confirmPaymentResponseSchema` |

## Description

Walk-in sale: hold seats, create booking, initiate + confirm payment, issue ticket, audit `CounterTransaction` (SELL), and set `channel: COUNTER` — **all in one database transaction**. Notifications run after commit.

If any step fails, the entire sell rolls back (no orphaned holds, bookings, or payments).

## Request body

See `counterSellSchema`: `scheduleId`, `seatLabels`, `boardingPointId`, `passenger`, `method` (`CASH` | `ONLINE`).

## Response 201

Same shape as `POST /payments/confirm`: `{ bookingId, ticket: { id, passengerNumber } }`.

## Example

```bash
curl -X POST http://localhost:4100/api/v1/counter/sell \
  -H "Authorization: Bearer …" \
  -H "Content-Type: application/json" \
  -d '{"scheduleId":"…","seatLabels":["A1"],"boardingPointId":"…","passenger":{"name":"Walk-in","phone":"01700000000"},"method":"CASH"}'
```
