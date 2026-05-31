# GET /api/v1/cms/site — GET /api/v1/cms/pages/:slug

| Field | Value |
|-------|--------|
| **Task ID** | E15-13 |
| **Module** | cms (public) |
| **Auth** | none |
| **Zod (params page)** | `cmsPageSlugParamSchema` |
| **Zod (response site)** | `cmsSiteBundleDtoSchema` |
| **Zod (response page)** | `cmsPublicPageDtoSchema` |

## Description

Public read-only endpoints returning **PUBLISHED** CMS content only. Used by the web app for theme, footer, home media, featured routes, and policy pages.

## GET /api/v1/cms/site

Returns bundled published profile, theme (with palette), footer, media (hero/featured/footerPayment), and featured routes.

```json
{
  "data": {
    "profile": { "companyName": "…", "status": "PUBLISHED", "updatedAt": "…" },
    "theme": { "primaryColor": "#2e7d32", "fontFamily": "Inter", "palette": { "…": "…" }, "status": "PUBLISHED", "updatedAt": "…" },
    "footer": { "contactLines": [], "email": "…", "status": "PUBLISHED", "updatedAt": "…" },
    "media": {
      "hero": { "kind": "HERO", "url": "…", "…": "…" },
      "featured": [],
      "footerPayment": null
    },
    "featuredRoutes": []
  }
}
```

## GET /api/v1/cms/pages/:slug

Returns published page markdown. **404** if slug not published (generic message — no enumeration).

```json
{
  "data": {
    "slug": "about",
    "title": "About Shahzadpur Travels",
    "bodyMarkdown": "Founded in 1985…",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```

## Example

```bash
curl http://localhost:4000/api/v1/cms/site
curl http://localhost:4000/api/v1/cms/pages/about
```
