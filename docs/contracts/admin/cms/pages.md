# Admin CRUD /api/v1/admin/cms/pages/:slug

| Field | Value |
|-------|--------|
| **Task ID** | E15-09 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (params)** | `cmsPageSlugParamSchema` |
| **Zod (POST body)** | `createContentPageSchema` |
| **Zod (PATCH body)** | `updateContentPageSchema` |
| **Zod (response)** | `contentPageDtoSchema` |

## Description

Manage markdown content pages. Allowed slugs: `about`, `contact`, `terms-and-conditions`, `privacy-policy`, `return-policy`. Writes save as **DRAFT**.

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/admin/cms/pages` | List all draft pages |
| GET | `/api/v1/admin/cms/pages/:slug` | Get draft page by slug |
| POST | `/api/v1/admin/cms/pages` | Create draft page |
| PATCH | `/api/v1/admin/cms/pages/:slug` | Update draft page |
| DELETE | `/api/v1/admin/cms/pages/:slug` | Delete draft page |

## POST body

| Field | Type | Required |
|-------|------|----------|
| `slug` | enum | yes |
| `title` | string | yes |
| `bodyMarkdown` | string | yes |

## Response 200

```json
{
  "data": {
    "id": "clx…",
    "slug": "about",
    "title": "About Shahzadpur Travels",
    "bodyMarkdown": "Founded in 1985…",
    "status": "DRAFT",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```

## Example

```bash
curl http://localhost:4000/api/v1/admin/cms/pages/about \
  -H "Authorization: Bearer …"
```
