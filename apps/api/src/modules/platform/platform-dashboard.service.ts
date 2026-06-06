import { prisma } from "@repo/database";
import {
  PLATFORM_LICENSED_CAPACITY,
  planMonthlyPriceMinor,
  type PlatformDashboardOverviewDto,
  type PlanTier,
  subtractDaysFromDateStr,
  todayInDhaka,
  dhakaStartOfDay,
  dhakaEndOfDay,
  parseReportDateRange,
} from "@repo/shared";

function monthStartDateStr(dateStr: string): string {
  return `${dateStr.slice(0, 7)}-01`;
}

function previousMonthStart(dateStr: string): string {
  const anchor = dhakaStartOfDay(monthStartDateStr(dateStr));
  const prev = new Date(anchor.getTime() - 86_400_000);
  return monthStartDateStr(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(prev),
  );
}

function previousMonthEnd(dateStr: string): string {
  const currentStart = monthStartDateStr(dateStr);
  const prevEnd = new Date(dhakaStartOfDay(currentStart).getTime() - 1);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(
    prevEnd,
  );
}

async function bookingStatsByTenant(from: Date, to: Date) {
  const rows = await prisma.booking.groupBy({
    by: ["tenantId"],
    where: {
      status: "PAID",
      tenantId: { not: null },
      createdAt: { gte: from, lte: to },
    },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });

  return new Map(
    rows
      .filter((r) => r.tenantId)
      .map((r) => [
        r.tenantId!,
        {
          bookings: r._count._all,
          revenue: r._sum.totalAmount ?? 0,
        },
      ]),
  );
}

export async function getDashboardOverview(
  periodDays = 30,
): Promise<PlatformDashboardOverviewDto> {
  const today = todayInDhaka();
  const range30d = parseReportDateRange(
    subtractDaysFromDateStr(today, periodDays - 1),
    today,
  );
  const monthStart = dhakaStartOfDay(monthStartDateStr(today));
  const monthEnd = dhakaEndOfDay(today);
  const prevMonthStart = dhakaStartOfDay(previousMonthStart(today));
  const prevMonthEnd = dhakaEndOfDay(previousMonthEnd(today));

  const [
    tenants,
    activeTenants,
    bookingsThisMonth,
    bookingsPrevMonth,
    revenue30dAgg,
    monthStats,
  ] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { name: "asc" } }),
    prisma.tenant.count({
      where: { planStatus: { in: ["ACTIVE", "TRIAL"] } },
    }),
    prisma.booking.count({
      where: {
        status: "PAID",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.booking.count({
      where: {
        status: "PAID",
        createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
      },
    }),
    prisma.booking.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: range30d.from, lte: range30d.to },
      },
      _sum: { totalAmount: true },
    }),
    bookingStatsByTenant(monthStart, monthEnd),
  ]);

  const totalMrr = tenants.reduce((sum, t) => {
    if (t.planStatus === "CANCELLED" || t.planStatus === "SUSPENDED") {
      return sum;
    }
    if (t.planTier === "FREE") return sum;
    return sum + planMonthlyPriceMinor(t.planTier as PlanTier);
  }, 0);

  const planCounts = tenants.reduce<Record<string, number>>((acc, t) => {
    acc[t.planTier] = (acc[t.planTier] ?? 0) + 1;
    return acc;
  }, {});

  const planDistribution = (["FREE", "PRO", "ENTERPRISE"] as const).map(
    (planTier) => {
      const count = planCounts[planTier] ?? 0;
      return {
        planTier,
        count,
        percentage: tenants.length
          ? Math.round((count / tenants.length) * 1000) / 10
          : 0,
      };
    },
  );

  const topTenants = tenants
    .map((t) => {
      const stats = monthStats.get(t.id) ?? { bookings: 0, revenue: 0 };
      return {
        tenantId: t.id,
        name: t.name,
        slug: t.slug,
        planTier: t.planTier,
        planStatus: t.planStatus,
        bookingsThisMonth: stats.bookings,
        revenueThisMonth: stats.revenue,
      };
    })
    .sort((a, b) => b.revenueThisMonth - a.revenueThisMonth)
    .slice(0, 5);

  const alerts: PlatformDashboardOverviewDto["alerts"] = [];
  for (const t of tenants) {
    if (t.planStatus === "SUSPENDED") {
      alerts.push({
        severity: "danger",
        message: `${t.name} is suspended`,
        tenantId: t.id,
        tenantName: t.name,
      });
    } else if (t.planStatus === "TRIAL") {
      alerts.push({
        severity: "warning",
        message: `${t.name} is on trial`,
        tenantId: t.id,
        tenantName: t.name,
      });
    }
  }

  let bookingsGrowthPct: number | null = null;
  if (bookingsPrevMonth > 0) {
    bookingsGrowthPct =
      Math.round(
        ((bookingsThisMonth - bookingsPrevMonth) / bookingsPrevMonth) * 1000,
      ) / 10;
  } else if (bookingsThisMonth > 0) {
    bookingsGrowthPct = 100;
  }

  return {
    totalMrr,
    activeTenants,
    licensedCapacity: PLATFORM_LICENSED_CAPACITY,
    monthlyBookings: bookingsThisMonth,
    platformRevenue30d: revenue30dAgg._sum.totalAmount ?? 0,
    bookingsGrowthPct,
    platformUptimePct: 99.9,
    topTenants,
    planDistribution,
    alerts: alerts.slice(0, 5),
  };
}
