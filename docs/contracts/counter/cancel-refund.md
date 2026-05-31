# POST /api/v1/counter/cancel

| Field | Value |
|-------|--------|
| **Task ID** | E14-05 |
| **Module** | counter |
| **Auth** | `COUNTER_SELLER` or `ADMIN` |

## Description

Cancels an **unpaid** booking (`HELD` or `DRAFT` only). Releases held seats and deletes the seat hold. Does **not** modify `Payment`.

Paid bookings must use `POST /counter/refund`.

## Errors

| HTTP | code | When |
|------|------|------|
| 409 | CONFLICT | Booking is `PAID` (use refund), already `CANCELLED`/`REFUNDED` |
| 404 | BOOKING_NOT_FOUND | Unknown booking |

# POST /api/v1/counter/refund

| Field | Value |
|-------|--------|
| **Task ID** | E14-05 |
| **Module** | counter |
| **Auth** | `COUNTER_SELLER` or `ADMIN` |

## Description

Full refund for **PAID** bookings with `COMPLETED` payment. Sets booking and payment to `REFUNDED`, releases `SOLD` seats.

## Errors

| HTTP | code | When |
|------|------|------|
| 409 | CONFLICT | Not `PAID`, already refunded, or payment not completed |
| 404 | BOOKING_NOT_FOUND | Unknown booking |
