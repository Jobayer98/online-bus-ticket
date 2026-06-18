# POST /api/v1/payments/webhook

| Field | Value |
|-------|--------|
| **Task ID** | E14-08 |
| **Module** | payment |
| **Auth** | public (provider callback stub) |
| **Zod (request)** | `packages/shared/src/schemas/payment/payment.schema.ts` → `paymentWebhookSchema` |
| **Zod (response)** | `packages/shared/src/dtos/payment/webhook.dto.ts` → `paymentWebhookAckSchema` |
| **Policy** | `packages/shared/src/utils/payment-webhook-policy.ts` |

## Description

Acknowledges payment-provider webhooks (stub). **Never** mutates booking or payment refund state. Refunds are **counter-only** via `POST /api/v1/counter/refund`.

Future gateway integration may use this endpoint for payment confirmation events only — refund-shaped payloads are rejected.

## Request body

Passthrough JSON. Common fields:

| Name | Type | Notes |
|------|------|-------|
| `event` | string | e.g. `payment.completed` |
| `type` | string | Provider-specific event type |
| `status` | string | e.g. `REFUNDED` |

## Refund rejection

If the payload looks like a refund (`event`/`type` contains `refund`, or `status` is `REFUNDED`), respond **409** — no DB writes.

## Response 200

```json
{
  "data": {
    "received": true
  }
}
```

## Errors

| HTTP | code | When |
|------|------|------|
| 409 | REFUND_NOT_ALLOWED | Refund-shaped webhook event |

## Public refund routes

There is **no** `POST /bookings/refund` or `POST /payments/refund`. Only authenticated counter staff can refund.

## Example

```bash
# Acknowledged (non-refund event)
curl -X POST http://localhost:4100/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.completed","providerRef":"bkash_abc"}'

# Rejected
curl -X POST http://localhost:4100/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.refunded","providerRef":"bkash_abc"}'
```
