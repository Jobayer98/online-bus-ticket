/** Seat hold TTL while user is on search checkout (before payment). */
export const SEAT_HOLD_SELECTION_TTL_MS = 5 * 60 * 1000;

/** Safety TTL after booking is created until payment completes or is abandoned. */
export const SEAT_HOLD_PAYMENT_TTL_MS = 10 * 60 * 1000;

/** Max POST /bookings/hold requests per IP per window (E14-12). */
export const HOLD_CREATE_RATE_LIMIT = {
  windowMs: 60_000,
  max: 20,
} as const;
