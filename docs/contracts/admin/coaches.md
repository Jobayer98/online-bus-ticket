# Admin coaches CRUD

| Method | Path | Auth | Zod |
|--------|------|------|-----|
| GET | `/api/v1/admin/coaches` | ADMIN, COUNTER_SELLER | — |
| POST | `/api/v1/admin/coaches` | ADMIN | `createCoachSchema` |
| PATCH | `/api/v1/admin/coaches/:id` | ADMIN | `updateCoachSchema` |
| DELETE | `/api/v1/admin/coaches/:id` | ADMIN | `coachIdParamsSchema` |

## Body (create / update)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `coachNumber` | string | create | Unique |
| `busType` | `AC` \| `NON_AC` | create | |
| `seatLayoutId` | string \| null \| `""` | optional | Empty string clears layout |

## Delete rules

Returns `409 CONFLICT` if the coach has any schedules.
