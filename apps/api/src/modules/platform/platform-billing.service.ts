import type { Prisma } from "@repo/database";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  planMonthlyPriceMinor,
  parseReportDateRange,
  subtractDaysFromDateStr,
  todayInDhaka,
  type ListPlatformSubscriptionsQuery,
  type PlatformBillingRevenueDto,
  type PlatformBillingRevenueQuery,
  type PlatformSubscriptionDto,
  type PlanTier,
  type SubscriptionRefundInput,
  type UpgradeSubscriptionInput,
} from "@repo/shared";
import {
  logPlatformAudit,
  type PlatformAuditActor,
} from "./platform-audit.service.js";

function toSubscriptionDto(row: {
  id: string;
  tenantId: string;
  planTier: PlanTier;
  status: string;
  monthlyPriceMinor: number;
  billingCycleStart: Date;
  billingCycleEnd: Date;
  nextBillDate: Date | null;
  autoRenew: boolean;
  tenant: { name: string; slug: string; planStatus: string };
}): PlatformSubscriptionDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tenantName: row.tenant.name,
    tenantSlug: row.tenant.slug,
    planTier: row.planTier,
    status: row.status as PlatformSubscriptionDto["status"],
    monthlyPriceMinor: row.monthlyPriceMinor,
    billingCycleStart: row.billingCycleStart.toISOString(),
    billingCycleEnd: row.billingCycleEnd.toISOString(),
    nextBillDate: row.nextBillDate?.toISOString() ?? null,
    autoRenew: row.autoRenew,
    churnRisk:
      row.status === "PAST_DUE" ||
      row.tenant.planStatus === "TRIAL" ||
      row.tenant.planStatus === "SUSPENDED",
  };
}

export async function listSubscriptions(query: ListPlatformSubscriptionsQuery) {
  const skip = (query.page - 1) * query.pageSize;
  const where: Prisma.SubscriptionWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.planTier) where.planTier = query.planTier;

  const [rows, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { nextBillDate: "asc" },
      include: { tenant: { select: { name: true, slug: true, planStatus: true } } },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    subscriptions: rows.map(toSubscriptionDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getBillingRevenue(
  query: PlatformBillingRevenueQuery,
): Promise<PlatformBillingRevenueDto> {
  const today = todayInDhaka();
  const range = parseReportDateRange(
    subtractDaysFromDateStr(today, query.periodDays - 1),
    today,
  );

  const [activeSubs, cancelledInPeriod, allActiveTenants] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } },
    }),
    prisma.subscription.count({
      where: {
        status: "CANCELLED",
        updatedAt: { gte: range.from, lte: range.to },
      },
    }),
    prisma.tenant.count({
      where: { planStatus: { in: ["ACTIVE", "TRIAL"] } },
    }),
  ]);

  const mrr = activeSubs
    .filter((s) => s.status === "ACTIVE" || s.status === "PAST_DUE")
    .reduce((sum, s) => sum + s.monthlyPriceMinor, 0);

  const paidCount = activeSubs.filter((s) => s.status === "ACTIVE").length;
  const collectionRatePct =
    activeSubs.length > 0
      ? Math.round((paidCount / activeSubs.length) * 1000) / 10
      : 100;

  const planDistribution = (["FREE", "PRO", "ENTERPRISE"] as const).map(
    (planTier) => {
      const subs = activeSubs.filter((s) => s.planTier === planTier);
      return {
        planTier,
        count: subs.length,
        mrr: subs
          .filter((s) => s.status === "ACTIVE" || s.status === "PAST_DUE")
          .reduce((sum, s) => sum + s.monthlyPriceMinor, 0),
      };
    },
  );

  const churnBase = allActiveTenants + cancelledInPeriod;
  const churnRatePct =
    churnBase > 0
      ? Math.round((cancelledInPeriod / churnBase) * 1000) / 10
      : null;

  return {
    mrr,
    arr: mrr * 12,
    activeSubscriptions: activeSubs.length,
    churnRatePct,
    arpu: allActiveTenants > 0 ? Math.round(mrr / allActiveTenants) : 0,
    collectionRatePct,
    cancelledThisPeriod: cancelledInPeriod,
    planDistribution,
  };
}

export async function upgradeSubscription(
  id: string,
  input: UpgradeSubscriptionInput,
  audit?: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: { tenant: true },
  });
  if (!sub) {
    throw new AppError(ErrorCode.NOT_FOUND, "Subscription not found", 404);
  }

  const price = planMonthlyPriceMinor(input.planTier);
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.subscription.update({
      where: { id },
      data: {
        planTier: input.planTier,
        monthlyPriceMinor: price,
        status: input.planTier === "FREE" ? "TRIAL" : "ACTIVE",
      },
      include: { tenant: { select: { name: true, slug: true, planStatus: true } } },
    });
    await tx.tenant.update({
      where: { id: sub.tenantId },
      data: { planTier: input.planTier },
    });
    return next;
  });

  if (audit) {
    await logPlatformAudit({
      action: "UPDATE",
      resourceType: "TENANT",
      resourceId: sub.tenantId,
      changes: {
        before: { planTier: sub.planTier },
        after: { planTier: input.planTier },
        subscriptionId: id,
      },
      ipAddress: audit.ipAddress,
      actor: audit.actor,
    });
  }

  return toSubscriptionDto(updated);
}

export async function suspendSubscription(
  id: string,
  audit?: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) {
    throw new AppError(ErrorCode.NOT_FOUND, "Subscription not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id },
      data: { status: "SUSPENDED", autoRenew: false },
    });
    await tx.tenant.update({
      where: { id: sub.tenantId },
      data: { planStatus: "SUSPENDED" },
    });
  });

  if (audit) {
    await logPlatformAudit({
      action: "SUSPEND",
      resourceType: "TENANT",
      resourceId: sub.tenantId,
      changes: { subscriptionId: id },
      ipAddress: audit.ipAddress,
      actor: audit.actor,
    });
  }

  const row = await prisma.subscription.findUniqueOrThrow({
    where: { id },
    include: { tenant: { select: { name: true, slug: true, planStatus: true } } },
  });
  return toSubscriptionDto(row);
}

export async function refundSubscription(
  id: string,
  input: SubscriptionRefundInput,
  audit?: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) {
    throw new AppError(ErrorCode.NOT_FOUND, "Subscription not found", 404);
  }

  if (audit) {
    await logPlatformAudit({
      action: "UPDATE",
      resourceType: "TENANT",
      resourceId: sub.tenantId,
      changes: {
        refund: { amountMinor: input.amountMinor, reason: input.reason },
        subscriptionId: id,
      },
      ipAddress: audit.ipAddress,
      actor: audit.actor,
    });
  }

  return {
    subscriptionId: id,
    amountMinor: input.amountMinor,
    reason: input.reason,
    refundedAt: new Date().toISOString(),
  };
}
