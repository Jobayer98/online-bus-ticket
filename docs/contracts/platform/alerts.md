# Platform — Alerts Contract

**Version:** v1  
**Role required:** `SUPER_ADMIN`

---

## Routes

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/platform/alerts` | List alerts (evaluates rules on read) |
| PATCH | `/api/v1/platform/alerts/:id` | Acknowledge or resolve |

Body for PATCH: `{ "status": "ACKNOWLEDGED" | "RESOLVED" }`

Auto rules (24h window): error rate > 1%, avg latency > 500ms, heap > 80%, past-due subscriptions.
