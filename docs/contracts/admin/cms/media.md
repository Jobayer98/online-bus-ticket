# Admin CRUD /api/v1/admin/cms/media

| Field | Value |
|-------|--------|
| **Task ID** | E15-10 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (POST body)** | `createSiteMediaSchema` |
| **Zod (PATCH body)** | `updateSiteMediaSchema` |
| **Zod (reorder body)** | `reorderSiteMediaSchema` |
| **Zod (response)** | `siteMediaDtoSchema` |

## Description

Manage hero, featured gallery, and footer payment banner images. `kind`: `HERO` \| `FEATURED` \| `FOOTER_PAYMENT`. `sortOrder` unique per `(kind, status)`.

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/admin/cms/media` | List draft media |
| POST | `/api/v1/admin/cms/media` | Create draft media row |
| PATCH | `/api/v1/admin/cms/media/:id` | Update draft media |
| DELETE | `/api/v1/admin/cms/media/:id` | Delete draft media |
| POST | `/api/v1/admin/cms/media/reorder` | Batch update sortOrder |

## POST body

| Field | Type | Required |
|-------|------|----------|
| `kind` | enum | yes |
| `url` | string | yes |
| `alt` | string | no (default "") |
| `sortOrder` | int | yes |

## Response 200

```json
{
  "data": {
    "id": "clx…",
    "kind": "HERO",
    "url": "/images/home/hero.jpg",
    "alt": "Coach on highway",
    "sortOrder": 0,
    "status": "DRAFT",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```
