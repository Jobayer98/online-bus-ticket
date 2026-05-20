# OpenAPI (Swagger) — modular YAML

API documentation is split by bounded context, matching `apps/api/src/modules/`:

| File | Module |
|------|--------|
| `modules/health.yaml` | health |
| `modules/identity.yaml` | identity (auth + users) |
| `modules/schedule.yaml` | schedule |
| `modules/booking.yaml` | booking |
| `modules/payment.yaml` | payment |
| `modules/ticket.yaml` | ticket |
| `modules/counter.yaml` | counter |
| `modules/admin.yaml` | admin (stops, routes, coaches, layouts, schedules, reports) |
| `components/common.yaml` | Shared errors, security, pagination |

Root `openapi.yaml` merges paths via `$ref`. At runtime `@apidevtools/swagger-parser` bundles the spec for Swagger UI.

## View docs

With the API running (and `ENABLE_SWAGGER` not set to `false`):

- UI: http://localhost:4000/api-docs
- JSON: http://localhost:4000/api-docs/openapi.json

Each operation includes **request/response examples** and standard error samples for **400**, **401**, **403**, **404**, **409**, and **500** (see `components/common.yaml`).

**Try it out (Swagger UI):**

1. `POST /api/v1/auth/login` with seed admin `01700000001` / `password123`.
2. Copy `data.token` from the response.
3. Click **Authorize** → **bearerAuth** → paste the JWT only → **Authorize**.
4. Call protected routes (e.g. `GET /api/v1/admin/stops`).

Use **bearerAuth**, not cookieAuth, in Swagger — manual cookie values often come from an old login signed with a different `JWT_SECRET`. After changing `.env` or restarting the API, **log in again** and paste the new token.

## Editing

1. Change the module YAML under `modules/`.
2. If you add a new path, register it in `openapi.yaml` with a `$ref` pointer.
3. Restart the API (or rely on dev reload).

Keep request/response shapes aligned with Zod in `packages/shared` and `docs/contracts/`.
