# POST /api/v1/admin/cms/assets — GET /api/v1/cms/assets/:tenantId/:fileKey

| Field | Value |
|-------|--------|
| **Task ID** | E15-06, E15-26 |
| **Module** | admin / cms |
| **Auth** | POST: `ADMIN`; GET: public |
| **Zod (response upload)** | `cmsAssetUploadDtoSchema` |
| **Zod (params GET)** | `cmsAssetPathParamSchema` |

## Description

Upload CMS images (logo, hero, gallery, payment banner) via a **storage driver** (`local` filesystem or `cloudinary` CDN). Driver selection is env-based; see below.

## Storage drivers

| Driver | When used | Upload `url` shape | Served by |
|--------|-----------|-------------------|-----------|
| `local` | Default when Cloudinary creds absent, or `CMS_STORAGE_DRIVER=local` | `/api/v1/cms/assets/{tenantId}/{key}` | API GET proxy |
| `cloudinary` | When `CLOUDINARY_*` creds set, or `CMS_STORAGE_DRIVER=cloudinary` | `https://res.cloudinary.com/...` | Cloudinary CDN |

Legacy local URLs continue to work via `GET /api/v1/cms/assets/:tenantId/:fileKey` even after switching to Cloudinary for new uploads.

## POST upload

- Content-Type: `multipart/form-data`
- Field: `file`
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max size: 5 MB (`CMS_ASSET_MAX_BYTES`)

## Response 201

Local driver:

```json
{
  "data": {
    "key": "a1b2c3d4-hero.jpg",
    "url": "/api/v1/cms/assets/{tenantId}/a1b2c3d4-hero.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245760
  }
}
```

Cloudinary driver:

```json
{
  "data": {
    "key": "a1b2c3d4-hero.jpg",
    "url": "https://res.cloudinary.com/{cloud}/image/upload/v123/cms/{tenantId}/a1b2c3d4-hero.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245760
  }
}
```

## GET asset

Returns binary image with appropriate `Content-Type` for **local / legacy** assets only. **404** if key not found on disk.

Cloudinary-backed URLs are not proxied through this endpoint.

## Environment

| Variable | Purpose |
|----------|---------|
| `CMS_STORAGE_DRIVER` | `local` \| `cloudinary` (optional; auto-detect when unset) |
| `CMS_ASSETS_DIR` | Local upload root (default `uploads/cms`) |
| `CMS_ASSET_MAX_BYTES` | Max upload size (default 5 MB) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | Folder prefix (default `cms`) |

## Example

```bash
curl -X POST http://localhost:4100/api/v1/admin/cms/assets \
  -H "Authorization: Bearer …" \
  -H "x-tenant-slug: demo" \
  -F "file=@hero.jpg"
```
