# {METHOD} {PATH}

| Field | Value |
|-------|--------|
| **Task ID** | E##-## |
| **Module** | {booking \| schedule \| payment \| ...} |
| **Auth** | public \| optional \| required \| role: ADMIN |
| **Zod (request)** | `packages/shared/src/schemas/{path}/{file}.ts` |
| **Zod (response)** | `packages/shared/src/dtos/{path}/{file}.ts` |

## Description

One paragraph: what this endpoint does.

## Request

### Path params

| Name | Type | Required | Notes |
|------|------|----------|-------|
| | | | |

### Query

| Name | Type | Required | Notes |
|------|------|----------|-------|
| | | | |

### Body

```json
{}
```

## Response

### 200 Success

```json
{
  "data": {}
}
```

### Errors

| HTTP | code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |
| 404 | NOT_FOUND | |

## Example

```bash
curl -X GET "http://localhost:4000/api/v1/..."
```

## Changelog

| Date | Change |
|------|--------|
| YYYY-MM-DD | Initial contract |
