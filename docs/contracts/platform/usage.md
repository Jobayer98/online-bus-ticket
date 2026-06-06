# Platform — Usage Analytics Contract

**Version:** v1  
**Routes:** `/api/v1/platform/usage`  
**Role required:** `SUPER_ADMIN`

---

## GET /api/v1/platform/usage

Aggregate usage by tenant for the period.

**Query:** `platformUsageQuerySchema` — `periodDays` (default 30), optional `tenantId`

**Response `200`:** `platformUsageOverviewDtoSchema`

---

## GET /api/v1/platform/usage/export

CSV export of tenant usage rows. Same query params as above.

**Response `200`:** `text/csv` attachment

---

## GET /api/v1/platform/usage/:tenantId

Per-tenant usage detail including top endpoints.

**Response `200`:** `platformTenantUsageDetailDtoSchema`

**Errors:** `404 TENANT_NOT_FOUND`
