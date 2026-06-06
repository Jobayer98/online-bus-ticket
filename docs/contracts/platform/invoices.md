# Platform — Invoices Contract

**Version:** v1  
**Role required:** `SUPER_ADMIN`

---

## Routes

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/platform/billing/invoices` | Paginated invoice list |
| GET | `/api/v1/platform/billing/invoices/:id/download` | HTML invoice download |
| POST | `/api/v1/platform/billing/invoices/:id/retry` | Mock payment retry |

Invoices are generated on list for active subscriptions missing a current-period row.

Retry: ~70% success (mock); on success marks invoice PAID and subscription ACTIVE.
