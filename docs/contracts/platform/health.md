# Platform — System Health Contract

**Version:** v1  
**Routes:** `/api/v1/platform/health`  
**Role required:** `SUPER_ADMIN`

---

## GET /api/v1/platform/health

Service status summary derived from DB ping and API log error rates.

**Response `200`:** `platformHealthDtoSchema`

---

## GET /api/v1/platform/health/metrics

**Query:** `platformHealthMetricsQuerySchema` — `periodDays` (default 7)

**Response `200`:** `platformHealthMetricsDtoSchema`

Includes process memory snapshot, request rates, recent errors from `platform_api_logs`, and daily uptime bars.
