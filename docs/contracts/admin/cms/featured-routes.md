# Admin CRUD /api/v1/admin/cms/featured-routes

| Field | Value |
|-------|--------|
| **Task ID** | E15-11 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (POST body)** | `createFeaturedRouteSchema` |
| **Zod (PATCH body)** | `updateFeaturedRouteSchema` |
| **Zod (reorder body)** | `reorderFeaturedRoutesSchema` |
| **Zod (response)** | `featuredRouteDtoSchema` |

## Description

Curate home-page available routes from existing `Route` records. Does not create routes — references `routeId` from E02. Duplicate `routeId` per status → **409**.

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/admin/cms/featured-routes` | List draft featured routes |
| POST | `/api/v1/admin/cms/featured-routes` | Add route to curation |
| PATCH | `/api/v1/admin/cms/featured-routes/:id` | Update order/visibility |
| DELETE | `/api/v1/admin/cms/featured-routes/:id` | Remove from curation |
| POST | `/api/v1/admin/cms/featured-routes/reorder` | Batch sortOrder update |

## POST body

| Field | Type | Required |
|-------|------|----------|
| `routeId` | string | yes |
| `sortOrder` | int | yes |
| `isVisible` | boolean | no (default true) |

## Response 200

```json
{
  "data": {
    "id": "clx…",
    "routeId": "clx…",
    "routeSlug": "dhaka-pabna",
    "fromStop": { "city": "Dhaka", "name": "Gabtoli" },
    "toStop": { "city": "Pabna", "name": "Pabna Central" },
    "sortOrder": 0,
    "isVisible": true,
    "status": "DRAFT",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```
