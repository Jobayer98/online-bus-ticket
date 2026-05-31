# DELETE /api/v1/bookings/hold/:id

| Field | Value |
|-------|--------|
| **Task ID** | E14-11 |
| **Module** | booking |
| **Auth** | public (session or booking token) |
| **Zod (query)** | `releaseHoldQuerySchema` |

## Description

Releases a seat hold and frees seats. Requires proof of ownership:

- `sessionId` query param matching hold's session, **or**
- `accessToken` query param (booking access token) when hold has a linked booking

System expiry job uses internal `releaseHoldSystem` (no auth).

## Query params

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `sessionId` | string | one of | Browser session from hold creation |
| `accessToken` | string | one of | From `POST /bookings` response |

## Response 200

```json
{ "data": { "released": true } }
```

## Errors

| HTTP | code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | Neither sessionId nor accessToken |
| 403 | FORBIDDEN | Session/token mismatch |

## Example

```bash
curl -X DELETE "http://localhost:4000/api/v1/bookings/hold/clx…?sessionId=uuid-here"
```
