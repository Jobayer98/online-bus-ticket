# API Contract Documents

One markdown file per **HTTP endpoint** (or small group). Created **before** API implementation.

## Template

Copy [_template.md](_template.md) to `{module}/{endpoint-name}.md`.

## Index

| Status | Endpoint | Doc |
|--------|----------|-----|
| done | `GET /api/v1/health` | [health.md](health.md) |
| planned | `GET /api/v1/schedules/search` | [schedule/search-schedules.md](schedule/search-schedules.md) |
| planned | `GET /api/v1/schedules/:id/seat-map` | — |
| planned | `POST /api/v1/bookings/hold` | — |
| planned | `POST /api/v1/payments/confirm` | — |
| planned | `GET /api/v1/tickets/lookup` | — |

Update this table when a contract is implemented or changed.
