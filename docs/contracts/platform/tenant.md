# Platform — Tenant Management Contract

**Version:** v1  
**Routes:** `/api/v1/platform/tenants`  
**Role required:** `SUPER_ADMIN` (all endpoints)

---

## GET /api/v1/platform/tenants

List all tenants with pagination and filters.

**Query params:** `listPlatformTenantsQuerySchema` from `@repo/shared`

| Param | Default | Description |
| ----- | ------- | ----------- |
| `page` | 1 | Page number |
| `pageSize` | 20 | Rows per page |
| `planTier` | — | `FREE`, `PRO`, `ENTERPRISE` |
| `planStatus` | — | `TRIAL`, `ACTIVE`, `SUSPENDED`, `CANCELLED` |
| `search` | — | Match name or slug |
| `createdWithinDays` | — | Created in last N days |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Dhaka Express",
      "slug": "dhaka-express",
      "subdomainPrefix": "dhaka-express",
      "customDomain": null,
      "planTier": "FREE",
      "planStatus": "TRIAL",
      "createdAt": "2026-06-04T00:00:00.000Z",
      "updatedAt": "2026-06-04T00:00:00.000Z",
      "memberCount": 2,
      "bookingsThisMonth": 25,
      "revenueThisMonth": 625000
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1 }
}
```

---

## GET /api/v1/platform/tenants/:id

Tenant detail with members and monthly stats.

**Response `200`:** `platformTenantDetailDtoSchema` from `@repo/shared`

**Errors:** `404 TENANT_NOT_FOUND`

---

## POST /api/v1/platform/tenants

Create a tenant (admin-provisioned, no owner user created).

**Body:** `createTenantSchema` from `@repo/shared`

**Response `201`:**
```json
{ "data": { /* TenantDto */ } }
```

**Errors:** `409 CONFLICT` if slug or subdomainPrefix already taken.

---

## PATCH /api/v1/platform/tenants/:id

Update tenant plan or status.

**Body:** `updateTenantSchema` from `@repo/shared`

**Response `200`:**
```json
{ "data": { /* TenantDto */ } }
```

**Errors:** `404 TENANT_NOT_FOUND`

---

## POST /api/v1/platform/register

Self-service tenant registration (no auth required). Creates Tenant + owner User in a single transaction.

**Body:** `registerTenantSchema` from `@repo/shared`

```json
{
  "companyName": "Dhaka Express",
  "slug": "dhaka-express",
  "ownerName": "Rahim",
  "ownerPhone": "01700000000",
  "ownerEmail": "rahim@example.com",
  "ownerPassword": "securepassword"
}
```

**Response `201`:**
```json
{
  "data": {
    "tenant": { /* TenantDto */ },
    "token": "<jwt>",
    "user": { "id": "...", "name": "Rahim", "phone": "01700000000", "role": "ADMIN" }
  }
}
```

**Errors:**
- `409 CONFLICT` — slug already taken or phone already registered
- `422 VALIDATION_ERROR` — invalid slug format, weak password, etc.

**Behaviour:**
- `subdomainPrefix` defaults to `slug` if not provided
- Plan auto-set to `FREE / TRIAL`
- Owner user gets `role: ADMIN` in User table AND a `TenantMembership { role: ADMIN }`
- Returns JWT signed with `{ userId, role: "ADMIN", tenantId }` payload
