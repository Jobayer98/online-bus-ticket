# GET /api/v1/health

| Field | Value |
|-------|--------|
| **Task ID** | E00-05, E00-07 |
| **Module** | health |
| **Auth** | public |
| **Zod (response)** | `packages/shared/src/dtos/health.dto.ts` |

## Response 200

```json
{
  "data": {
    "status": "ok",
    "version": "0.0.0",
    "timestamp": "2026-05-19T12:00:00.000Z"
  }
}
```

## Example

```bash
curl http://localhost:4000/api/v1/health
```
