import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  parseReportDateRange,
  subtractDaysFromDateStr,
  todayInDhaka,
  type PlatformUsageOverviewDto,
  type PlatformTenantUsageDetailDto,
  type PlatformUsageQuery,
} from "@repo/shared";

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export async function getUsageOverview(
  query: PlatformUsageQuery,
): Promise<PlatformUsageOverviewDto> {
  const today = todayInDhaka();
  const range = parseReportDateRange(
    subtractDaysFromDateStr(today, query.periodDays - 1),
    today,
  );

  const logWhere = {
    createdAt: { gte: range.from, lte: range.to },
    ...(query.tenantId ? { tenantId: query.tenantId } : {}),
  };

  const [tenants, apiLogs, bookingRows, bookingsByDayRaw] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { name: "asc" } }),
    prisma.platformApiLog.findMany({
      where: logWhere,
      select: {
        tenantId: true,
        statusCode: true,
        responseTimeMs: true,
        endpoint: true,
      },
    }),
    prisma.booking.groupBy({
      by: ["tenantId"],
      where: {
        status: "PAID",
        tenantId: { not: null },
        createdAt: { gte: range.from, lte: range.to },
        ...(query.tenantId ? { tenantId: query.tenantId } : {}),
      },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', created_at) AS day, COUNT(*)::bigint AS count
      FROM bookings
      WHERE status = 'PAID'
        AND created_at >= ${range.from}
        AND created_at <= ${range.to}
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  const totalApiCalls = apiLogs.length;
  const errorCalls = apiLogs.filter((l) => l.statusCode >= 400).length;
  const avgResponseMs = totalApiCalls
    ? Math.round(
        apiLogs.reduce((s, l) => s + l.responseTimeMs, 0) / totalApiCalls,
      )
    : 0;

  const bookingMap = new Map(
    bookingRows
      .filter((r) => r.tenantId)
      .map((r) => [
        r.tenantId!,
        { bookings: r._count._all, revenue: r._sum.totalAmount ?? 0 },
      ]),
  );

  const apiByTenant = new Map<
    string,
    { calls: number; errors: number; responseSum: number }
  >();
  for (const log of apiLogs) {
    if (!log.tenantId) continue;
    const cur = apiByTenant.get(log.tenantId) ?? {
      calls: 0,
      errors: 0,
      responseSum: 0,
    };
    cur.calls++;
    cur.responseSum += log.responseTimeMs;
    if (log.statusCode >= 400) cur.errors++;
    apiByTenant.set(log.tenantId, cur);
  }

  const totalBookings = bookingRows.reduce((s, r) => s + r._count._all, 0);

  const tenantRows = tenants
    .filter((t) => !query.tenantId || t.id === query.tenantId)
    .map((t) => {
      const booking = bookingMap.get(t.id) ?? { bookings: 0, revenue: 0 };
      const api = apiByTenant.get(t.id) ?? { calls: 0, errors: 0, responseSum: 0 };
      return {
        tenantId: t.id,
        tenantName: t.name,
        slug: t.slug,
        planTier: t.planTier,
        bookings: booking.bookings,
        bookingsSharePct: pct(booking.bookings, totalBookings),
        apiCalls: api.calls,
        avgResponseMs: api.calls
          ? Math.round(api.responseSum / api.calls)
          : 0,
        errorRatePct: pct(api.errors, api.calls),
        revenue: booking.revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return {
    periodDays: query.periodDays,
    totalApiCalls,
    totalBookings,
    avgResponseMs,
    errorRatePct: pct(errorCalls, totalApiCalls),
    tenants: tenantRows,
    bookingsByDay: bookingsByDayRaw.map((r) => ({
      date: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
      }).format(r.day),
      bookings: Number(r.count),
    })),
  };
}

export async function getTenantUsageDetail(
  tenantId: string,
  periodDays = 30,
): Promise<PlatformTenantUsageDetailDto> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);
  }

  const overview = await getUsageOverview({ periodDays, tenantId });
  const row = overview.tenants[0];
  if (!row) {
    throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant usage not found", 404);
  }

  const today = todayInDhaka();
  const range = parseReportDateRange(
    subtractDaysFromDateStr(today, periodDays - 1),
    today,
  );

  const endpointRows = await prisma.platformApiLog.groupBy({
    by: ["endpoint"],
    where: {
      tenantId,
      createdAt: { gte: range.from, lte: range.to },
    },
    _count: { _all: true },
  });

  const endpointErrors = await prisma.platformApiLog.groupBy({
    by: ["endpoint"],
    where: {
      tenantId,
      statusCode: { gte: 400 },
      createdAt: { gte: range.from, lte: range.to },
    },
    _count: { _all: true },
  });

  const errorMap = new Map(
    endpointErrors.map((e) => [e.endpoint, e._count._all]),
  );

  const topEndpoints = endpointRows
    .map((e) => ({
      endpoint: e.endpoint,
      calls: e._count._all,
      errorRatePct: pct(errorMap.get(e.endpoint) ?? 0, e._count._all),
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);

  return { ...row, topEndpoints };
}

export function buildUsageCsv(data: PlatformUsageOverviewDto): string {
  const header =
    "tenant,slug,plan,bookings,bookings_pct,api_calls,avg_response_ms,error_rate_pct,revenue_minor";
  const lines = data.tenants.map((t) =>
    [
      `"${t.tenantName.replace(/"/g, '""')}"`,
      t.slug,
      t.planTier,
      t.bookings,
      t.bookingsSharePct,
      t.apiCalls,
      t.avgResponseMs,
      t.errorRatePct,
      t.revenue,
    ].join(","),
  );
  return [header, ...lines].join("\n");
}
