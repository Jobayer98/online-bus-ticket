# Platform — Audit Logs Contract

**Version:** v1  
**Route:** `GET /api/v1/platform/audit-logs`  
**Role required:** `SUPER_ADMIN`

---

## Query params

| Param | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `page` | number | 1 | Page number |
| `pageSize` | number | 20 | Rows per page (max 100) |
| `action` | string | — | `CREATE`, `UPDATE`, `SUSPEND`, `ACTIVATE`, `DELETE` |
| `resourceType` | string | — | `TENANT` |
| `from` | YYYY-MM-DD | — | Start date (Asia/Dhaka) |
| `to` | YYYY-MM-DD | — | End date (Asia/Dhaka) |

Parsed by `listPlatformAuditLogsQuerySchema` from `@repo/shared`.

---

## Response `200`

```json
{
  "data": [
    {
      "id": "clx...",
      "actorId": "user-uuid",
      "actorName": "Platform Administrator",
      "actorType": "SUPER_ADMIN",
      "action": "UPDATE",
      "resourceType": "TENANT",
      "resourceId": "tenant-uuid",
      "changes": {
        "before": { "planTier": "FREE" },
        "after": { "planTier": "PRO" }
      },
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-06-06T14:32:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 42 }
}
```

**Notes:**

- Audit log is append-only; no update or delete endpoints.
- Passwords and tokens are never stored in `changes`.
