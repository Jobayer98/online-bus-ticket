# GET /api/v1/admin/cms/preview — POST /api/v1/admin/cms/publish

| Field | Value |
|-------|--------|
| **Task ID** | E15-14 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (response preview)** | `cmsSiteBundleDtoSchema` |
| **Zod (response publish)** | `cmsPublishResultDtoSchema` |

## Description

Preview returns the full site bundle from **DRAFT** records (admin-only). Publish atomically promotes all draft CMS entities to **PUBLISHED** and replaces prior published rows where applicable.

## GET /api/v1/admin/cms/preview

Same shape as `GET /api/v1/cms/site` but reads draft content. Includes draft pages list inline or via separate admin pages endpoint.

## POST /api/v1/admin/cms/publish

No body. Runs in a single transaction:

1. Delete or archive superseded `PUBLISHED` rows
2. Flip all `DRAFT` → `PUBLISHED` for profile, theme, footer, pages, media, featured routes

## Response 200 (publish)

```json
{
  "data": {
    "publishedAt": "2026-05-31T12:00:00.000Z",
    "counts": {
      "profile": 1,
      "theme": 1,
      "pages": 5,
      "media": 6,
      "featuredRoutes": 12,
      "footer": 1
    }
  }
}
```

## Example

```bash
curl http://localhost:4100/api/v1/admin/cms/preview \
  -H "Authorization: Bearer …"

curl -X POST http://localhost:4100/api/v1/admin/cms/publish \
  -H "Authorization: Bearer …"
```
