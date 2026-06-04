# Platform — Admin Login Contract

**Version:** v1  
**Route:** `POST /api/v1/platform/auth/login`  
**Auth:** None (bootstrap `SUPER_ADMIN` users only)

---

## POST /api/v1/platform/auth/login

Sign in a platform super admin. No self-registration on this route.

**Request body:** Same as tenant login (`loginSchema` — `phone`, `password`).

**Response `200`:**
```json
{
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "clx...",
      "phone": "01700000000",
      "name": "Super Admin",
      "role": "SUPER_ADMIN"
    }
  }
}
```

**Errors:**
- `401` — Invalid credentials
- `403` — User is not `SUPER_ADMIN` (use tenant login on company subdomain)

**Notes:**
- Must be called from the main domain (no `x-tenant-slug`).
- Tenant staff and customers use `POST /api/v1/auth/login` on their subdomain.
