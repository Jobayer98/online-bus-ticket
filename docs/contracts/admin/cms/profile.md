# GET/PATCH /api/v1/admin/cms/profile

| Field | Value |
|-------|--------|
| **Task ID** | E15-07 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (PATCH body)** | `packages/shared/src/schemas/admin/cms/cms.schema.ts` → `patchSiteProfileSchema` |
| **Zod (response)** | `packages/shared/src/dtos/admin/cms/cms.dto.ts` → `siteProfileDtoSchema` |

## Description

Read or update the singleton site profile (company name, tagline, logo, favicon, trade license). PATCH saves as **DRAFT** until publish.

## PATCH body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `companyName` | string | yes | 1–120 chars |
| `tagline` | string \| null | no | max 200 |
| `logoUrl` | string \| null | no | absolute or app-relative URL |
| `faviconUrl` | string \| null | no | URL |
| `tradeLicenseNo` | string \| null | no | max 80 |

## Response 200

```json
{
  "data": {
    "companyName": "Shahzadpur Travels",
    "tagline": "TRAVELS",
    "logoUrl": "/images/logo/logo.png",
    "faviconUrl": null,
    "tradeLicenseNo": "08-032-01046",
    "status": "DRAFT",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```

## Example

```bash
curl -X PATCH http://localhost:4100/api/v1/admin/cms/profile \
  -H "Authorization: Bearer …" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Shahzadpur Travels","tagline":"TRAVELS","logoUrl":"/images/logo/logo.png"}'
```
