# POST /api/v1/counter/refund

| Field | Value |
|-------|--------|
| **Task ID** | E14-07 |
| **Module** | counter |
| **Auth** | `COUNTER_SELLER` or `ADMIN` |
| **Zod (request)** | `packages/shared/src/schemas/counter/counter.schema.ts` → `counterBookingActionSchema` |
| **Zod (response)** | `packages/shared/src/dtos/counter/refund.dto.ts` → `counterRefundResponseSchema` |
| **Policy** | `packages/shared/src/utils/refund-policy.ts` |

## Description

Counter-only full refund. No payment-gateway reversal — updates booking/payment in DB and releases seats. Online bookings may be refunded at the desk per product policy.

## Request body

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `bookingId` | string (cuid) | yes | |
| `note` | string | no | Audit note |

## Refund conditions (all required)

1. `booking.status === PAID`
2. `payment.status === COMPLETED`
3. `payment.amount === booking.totalAmount`
4. `schedule.departureAt > now` (trip not departed)
5. Refund amount = `booking.totalAmount` (full refund, integer minor units)

## Response 200

```json
{
  "data": {
    "refunded": true,
    "refundAmount": 85000
  }
}
```

## Errors

| HTTP | code | When |
|------|------|------|
| 404 | BOOKING_NOT_FOUND | Unknown booking |
| 409 | REFUND_NOT_ALLOWED | Not paid, already refunded, payment mismatch, or trip departed |

## Example

```bash
curl -X POST http://localhost:4000/api/v1/counter/refund \
  -H "Authorization: Bearer …" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"…","note":"Customer request"}'
```
