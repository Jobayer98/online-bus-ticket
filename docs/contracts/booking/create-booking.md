# POST /api/v1/bookings

| Field | Value |
|-------|--------|
| **Task ID** | E14-11 |
| **Module** | booking |
| **Auth** | public (optional logged-in owner) |
| **Zod (request)** | `createBookingSchema` — includes `sessionId` |

## Description

Creates a booking from a seat hold. **`sessionId` must match** the hold's `sessionId` from `POST /bookings/hold` (guest isolation).

## Request body

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `holdId` | string | yes | |
| `boardingPointId` | string | yes | |
| `passenger` | object | yes | name, phone, optional email |
| `sessionId` | string | yes | Must match hold session |

## Errors

| HTTP | code | When |
|------|------|------|
| 403 | FORBIDDEN | `sessionId` mismatch |
| 409 | HOLD_EXPIRED | Hold expired |

## Response 201

Booking DTO + `bookingAccessToken` for guest checkout.
