# GET/PATCH /api/v1/admin/cms/theme

| Field | Value |
|-------|--------|
| **Task ID** | E15-08 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (PATCH body)** | `patchSiteThemeSchema` |
| **Zod (response)** | `siteThemeDtoSchema` |
| **Palette util** | `packages/shared/src/utils/brand-palette.ts` → `generateBrandPalette` |

## Description

Read or update brand theme. On PATCH, server recomputes `palette` from `primaryColor` using `generateBrandPalette()` (WCAG AA `textOnPrimary`). Saves as **DRAFT**.

## PATCH body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `primaryColor` | string | yes | `#RRGGBB` hex |
| `fontFamily` | string | yes | `Inter`, `Roboto`, `Poppins`, `Noto Sans Bengali` |

## Response 200

```json
{
  "data": {
    "primaryColor": "#2e7d32",
    "fontFamily": "Inter",
    "palette": {
      "primary": "#2e7d32",
      "primaryHover": "#256628",
      "primaryLight": "#4caf50",
      "primaryMuted": "#a5d6a7",
      "accent": "#2e7d6b",
      "accentHover": "#256656",
      "surface": "#f4f6f8",
      "surfaceElevated": "#ffffff",
      "text": "#1a1a2e",
      "textMuted": "#6c757d",
      "textOnPrimary": "#ffffff",
      "border": "#dee2e6",
      "success": "#198754",
      "danger": "#dc3545",
      "warning": "#ffc107"
    },
    "status": "DRAFT",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```

## Example

```bash
curl -X PATCH http://localhost:4100/api/v1/admin/cms/theme \
  -H "Authorization: Bearer …" \
  -H "Content-Type: application/json" \
  -d '{"primaryColor":"#2e7d32","fontFamily":"Inter"}'
```
