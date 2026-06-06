# Platform — Support Tickets Contract

**Version:** v1  
**Role required:** `SUPER_ADMIN`

---

## Routes

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/platform/support/tickets` | Paginated ticket list |
| GET | `/api/v1/platform/support/tickets/:id` | Ticket detail + messages |
| POST | `/api/v1/platform/support/tickets` | Create ticket |
| POST | `/api/v1/platform/support/tickets/:id/reply` | Add reply message |
| PATCH | `/api/v1/platform/support/tickets/:id` | Update status/priority/assignee |

Schemas: `@repo/shared` — `listSupportTicketsQuerySchema`, `createSupportTicketSchema`, etc.

---

## List response `200`

```json
{
  "data": [{ "id": "...", "tenantName": "...", "subject": "...", "status": "OPEN", "priority": "MEDIUM", "messageCount": 1 }],
  "meta": { "page": 1, "pageSize": 20, "total": 5 }
}
```

Detail wraps single ticket in `{ "data": { ..., "messages": [...] } }`.
