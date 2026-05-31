# POST /api/v1/payments/confirm

| Field | Value |
|-------|--------|
| **Task ID** | E14-02 |
| **Module** | payment |
| **Auth** | public (requires signed `clientSecret` from initiate) |
| **Zod (request)** | `packages/shared/src/schemas/payment/payment.schema.ts` |
| **Zod (response)** | `packages/shared/src/dtos/payment/payment.dto.ts` |

## Description

Completes payment for a **HELD** booking. Rejects cancelled, refunded, or already-paid bookings. Requires the signed `clientSecret` returned by `POST /payments/initiate` (guest-safe; no login).

Ticket issuance runs **inside the same database transaction** as payment confirmation (E14-10). A PAID booking always has a ticket; idempotent retries and legacy PAID-without-ticket rows are repaired via compensating `issueTicket`.

## Request body

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `bookingId` | string (cuid) | yes | |
| `clientSecret` | string | yes | HMAC token from initiate |
| `providerRef` | string | no | Mock gateway reference |

Header: `Idempotency-Key` (optional, recommended).

## Response 200

```json
{
  "data": {
    "bookingId": "…",
    "ticket": { "passengerNumber": "P123456", "id": "…" }
  }
}
```

## Errors

| HTTP | code | When |
|------|------|------|
| 401 | UNAUTHORIZED | Missing/invalid/expired `clientSecret` |
| 404 | BOOKING_NOT_FOUND | Unknown booking |
| 409 | CONFLICT | Booking not HELD, already paid, or payment not pending |
| 409 | HOLD_EXPIRED | Hold or payment session expired |

## Example

```bash
curl -X POST http://localhost:4000/api/v1/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pay-abc" \
  -d '{"bookingId":"…","clientSecret":"…"}'
```
