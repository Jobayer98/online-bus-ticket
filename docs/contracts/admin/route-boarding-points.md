# Admin — Route boarding points

Base: `/api/v1/admin/routes/:routeId/boarding-points`  
Auth: `ADMIN` (write), `ADMIN` | `COUNTER_SELLER` (read)

## GET /

List boarding points for a route, ordered by `sortOrder` asc.

**Response 200**

```json
{
  "data": [
    {
      "id": "clx…",
      "routeId": "clx…",
      "name": "Gabtoli",
      "sortOrder": 1
    }
  ]
}
```

## POST /

Create a boarding point on the route.

**Body**

```json
{
  "name": "Gabtoli",
  "sortOrder": 1
}
```

`sortOrder` optional; defaults to last position + 1.

**Response 201** — `{ "data": BoardingPoint }`

**Errors:** `404` route not found, `409` duplicate name on route

## PATCH /:boardingPointId

Update name and/or sort order.

**Response 200** — `{ "data": BoardingPoint }`

## DELETE /:boardingPointId

Remove boarding point. Fails with `409` if referenced by bookings.

**Response 200** — `{ "data": { "deleted": true } }`
