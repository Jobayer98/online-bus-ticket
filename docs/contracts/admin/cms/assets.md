# POST /api/v1/admin/cms/assets — GET /api/v1/cms/assets/:key

| Field | Value |
|-------|--------|
| **Task ID** | E15-06 |
| **Module** | admin / cms |
| **Auth** | POST: `ADMIN`; GET: public |
| **Zod (response upload)** | `cmsAssetUploadDtoSchema` |
| **Zod (params GET)** | `cmsAssetKeyParamSchema` |

## Description

Upload CMS images (logo, hero, gallery, payment banner) to local storage (`CMS_ASSETS_DIR` env). Returns a public URL key served by the API.

## POST upload

- Content-Type: `multipart/form-data`
- Field: `file`
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max size: 5 MB (configurable)

## Response 201

```json
{
  "data": {
    "key": "a1b2c3d4-hero.jpg",
    "url": "/api/v1/cms/assets/a1b2c3d4-hero.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245760
  }
}
```

## GET asset

Returns binary image with appropriate `Content-Type`. **404** if key not found.

## Example

```bash
curl -X POST http://localhost:4000/api/v1/admin/cms/assets \
  -H "Authorization: Bearer …" \
  -F "file=@hero.jpg"
```
