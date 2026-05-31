/**
 * Fare policy: seat class (STANDARD / PREMIUM / BUSINESS) is a layout and
 * search-filter label only. All seats on a schedule pay the same amount.
 */
export const FLAT_SEAT_CLASS_MULTIPLIER = 1 as const;

/** Integer minor units (poisa) for one seat on a schedule. */
export function priceForScheduleSeat(baseFare: number): number {
  return Math.round(baseFare * FLAT_SEAT_CLASS_MULTIPLIER);
}
