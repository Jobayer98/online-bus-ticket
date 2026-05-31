# GET/PATCH /api/v1/admin/cms/footer

| Field | Value |
|-------|--------|
| **Task ID** | E15-12 |
| **Module** | admin / cms |
| **Auth** | `ADMIN` |
| **Zod (PATCH body)** | `patchFooterSettingsSchema` |
| **Zod (response)** | `footerSettingsDtoSchema` |

## Description

Read or update footer contact block, payment banner, bar links, and powered-by text. PATCH saves as **DRAFT**.

## PATCH body (all optional, at least one required)

| Field | Type | Notes |
|-------|------|-------|
| `contactLines` | array | `{ icon: pin\|home\|building\|globe, text }` |
| `email` | string | valid email |
| `paymentBannerUrl` | string \| null | image URL |
| `barLinks` | array | `{ label, href }` |
| `poweredByText` | string \| null | max 120 |

## Response 200

```json
{
  "data": {
    "contactLines": [
      { "icon": "pin", "text": "Dawriapur Bazar" },
      { "icon": "home", "text": "Shahzadpur-6770" }
    ],
    "email": "shahzadpurtravels1980@gmail.com",
    "paymentBannerUrl": "/images/home/ssl-commerz-inline.png",
    "barLinks": [{ "label": "About Us", "href": "/about" }],
    "poweredByText": "Powered By: Shahzadpur Travels",
    "status": "DRAFT",
    "updatedAt": "2026-05-31T12:00:00.000Z"
  }
}
```

## Example

```bash
curl http://localhost:4000/api/v1/admin/cms/footer \
  -H "Authorization: Bearer …"
```
