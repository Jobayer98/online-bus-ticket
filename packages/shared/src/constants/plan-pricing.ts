import type { PlanTier } from "../enums/platform.js";

/** Monthly subscription price in minor units (poisa). ৳9,900 = 990_000 poisa. */
export const PLAN_MONTHLY_PRICE_MINOR: Record<PlanTier, number> = {
  FREE: 0,
  PRO: 990_000,
  ENTERPRISE: 2_990_000,
};

export const PLATFORM_LICENSED_CAPACITY = 10;

export function planMonthlyPriceMinor(tier: PlanTier): number {
  return PLAN_MONTHLY_PRICE_MINOR[tier];
}
