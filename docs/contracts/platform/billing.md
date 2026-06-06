# Platform — Billing & Revenue Contract

**Version:** v1  
**Routes:** `/api/v1/platform/billing/*`  
**Role required:** `SUPER_ADMIN`

---

## GET /api/v1/platform/billing/revenue

**Query:** `platformBillingRevenueQuerySchema` — `periodDays` (default 30)

**Response `200`:** `platformBillingRevenueDtoSchema` (MRR, ARR, churn, ARPU, plan distribution)

---

## GET /api/v1/platform/billing/subscriptions

**Query:** `listPlatformSubscriptionsQuerySchema`

**Response `200`:** paginated `platformSubscriptionDtoSchema[]`

---

## PATCH /api/v1/platform/billing/subscriptions/:id/upgrade

**Body:** `upgradeSubscriptionSchema` — `{ planTier }`

Updates subscription and tenant plan tier.

---

## POST /api/v1/platform/billing/subscriptions/:id/suspend

Pauses subscription and sets tenant `planStatus` to `SUSPENDED`.

---

## POST /api/v1/platform/billing/subscriptions/:id/refund

**Body:** `subscriptionRefundSchema` — `{ amountMinor, reason }`

Records refund in audit log (mock — no payment provider integration in Phase 2).

**Response `200`:** `subscriptionRefundResultDtoSchema`
