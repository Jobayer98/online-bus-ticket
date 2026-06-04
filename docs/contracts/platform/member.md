# Platform — Tenant Member Management Contract

**Version:** v1  
**Routes:** `/api/v1/admin/members`  
**Role required:** `ADMIN` (tenant-scoped; requires resolved `req.tenant`)

---

## GET /api/v1/admin/members

List all members of the resolved tenant.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "clx...",
      "tenantId": "clx...",
      "userId": "clx...",
      "role": "COUNTER_SELLER",
      "user": {
        "id": "clx...",
        "name": "Karim",
        "phone": "01800000000",
        "email": null
      }
    }
  ],
  "meta": { "page": 1, "pageSize": 50, "total": 1 }
}
```

---

## POST /api/v1/admin/members

Invite a user into the tenant with a specific role. If the user does not yet exist, they are created with a random password (they must reset it).

**Body:** `inviteMemberSchema` from `@repo/shared`

```json
{
  "phone": "01800000000",
  "role": "COUNTER_SELLER",
  "name": "Karim"
}
```

**Response `201`:**
```json
{ "data": { /* TenantMemberDto */ } }
```

**Errors:**
- `409 MEMBER_ALREADY_EXISTS` — user already a member of this tenant
- `422 VALIDATION_ERROR` — invalid phone or role

**Behaviour:**
- If user with `phone` exists: create membership only
- If user does not exist: create user (role `USER`) + create membership
- Does NOT send invite SMS/email yet (future E17 task)

---

## DELETE /api/v1/admin/members/:membershipId

Remove a member from the tenant.

**Response `200`:**
```json
{ "data": { "deleted": true } }
```

**Errors:** `404 NOT_FOUND` — membership not in tenant
