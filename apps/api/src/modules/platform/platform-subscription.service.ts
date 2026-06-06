import { prisma } from "@repo/database";
import {
  planMonthlyPriceMinor,
  type PlanTier,
  type PlanStatus,
  todayInDhaka,
  dhakaStartOfDay,
  dhakaEndOfDay,
} from "@repo/shared";

type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED";

function monthBounds(dateStr: string) {
  const start = dhakaStartOfDay(`${dateStr.slice(0, 7)}-01`);
  const end = dhakaEndOfDay(dateStr);
  const nextMonthStart = new Date(
    dhakaStartOfDay(`${dateStr.slice(0, 7)}-01`).getTime() + 32 * 86_400_000,
  );
  const nextBill = dhakaStartOfDay(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(
      nextMonthStart,
    ).slice(0, 7) + "-01",
  );
  return { start, end, nextBill };
}

function subscriptionStatusFromTenant(
  planTier: PlanTier,
  planStatus: PlanStatus,
): SubscriptionStatus {
  if (planStatus === "CANCELLED") return "CANCELLED";
  if (planStatus === "SUSPENDED") return "SUSPENDED";
  if (planStatus === "TRIAL" || planTier === "FREE") return "TRIAL";
  return "ACTIVE";
}

export async function createSubscriptionForTenant(
  tenantId: string,
  planTier: PlanTier,
  planStatus: PlanStatus,
) {
  const today = todayInDhaka();
  const { start, end, nextBill } = monthBounds(today);
  const status = subscriptionStatusFromTenant(planTier, planStatus);
  const price = planMonthlyPriceMinor(planTier);

  return prisma.subscription.create({
    data: {
      tenantId,
      planTier,
      status,
      monthlyPriceMinor: price,
      billingCycleStart: start,
      billingCycleEnd: end,
      nextBillDate: planTier === "FREE" ? null : nextBill,
      autoRenew: true,
    },
  });
}

export async function syncSubscriptionFromTenant(
  tenantId: string,
  planTier: PlanTier,
  planStatus: PlanStatus,
) {
  const existing = await prisma.subscription.findUnique({ where: { tenantId } });
  const status = subscriptionStatusFromTenant(planTier, planStatus);
  const price = planMonthlyPriceMinor(planTier);
  const today = todayInDhaka();
  const { start, end, nextBill } = monthBounds(today);

  if (!existing) {
    return createSubscriptionForTenant(tenantId, planTier, planStatus);
  }

  return prisma.subscription.update({
    where: { tenantId },
    data: {
      planTier,
      status,
      monthlyPriceMinor: price,
      billingCycleStart: start,
      billingCycleEnd: end,
      nextBillDate: planTier === "FREE" ? null : nextBill,
    },
  });
}
