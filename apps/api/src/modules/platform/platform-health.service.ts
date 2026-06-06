import { prisma } from "@repo/database";
import {
  parseReportDateRange,
  subtractDaysFromDateStr,
  todayInDhaka,
  type PlatformHealthDto,
  type PlatformHealthMetricsDto,
  type PlatformHealthMetricsQuery,
} from "@repo/shared";

function pct(part: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round(((total - part) / total) * 10000) / 100;
}

export async function getPlatformHealth(): Promise<PlatformHealthDto> {
  const dbStart = Date.now();
  let dbStatus: PlatformHealthDto["services"][0] = {
    name: "Database",
    status: "healthy",
    detail: "Connected",
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
    const ms = Date.now() - dbStart;
    dbStatus = {
      name: "Database",
      status: ms > 500 ? "degraded" : "healthy",
      detail: `${ms}ms query`,
    };
  } catch {
    dbStatus = {
      name: "Database",
      status: "down",
      detail: "Connection failed",
    };
  }

  const today = todayInDhaka();
  const range = parseReportDateRange(
    subtractDaysFromDateStr(today, 1),
    today,
  );
  const logs = await prisma.platformApiLog.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { statusCode: true },
  });
  const total = logs.length;
  const errors = logs.filter((l) => l.statusCode >= 500).length;
  const errorRate = total ? (errors / total) * 100 : 0;

  const apiStatus =
    errorRate > 1 ? "degraded" : total === 0 ? "healthy" : "healthy";

  const services: PlatformHealthDto["services"] = [
    {
      name: "API Service",
      status: apiStatus,
      detail: total ? `${errorRate.toFixed(1)}% 5xx (24h)` : "No traffic yet",
    },
    dbStatus,
    {
      name: "Email Service",
      status: "healthy",
      detail: "Stub — not monitored (E24+)",
    },
    {
      name: "Payment Gateway",
      status: "healthy",
      detail: "Mock provider operational",
    },
  ];

  const degraded = services.some((s) => s.status === "degraded");
  const down = services.some((s) => s.status === "down");

  return {
    overallStatus: down ? "outage" : degraded ? "degraded" : "operational",
    uptimePct: pct(errors, total || 1),
    services,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function getPlatformHealthMetrics(
  query: PlatformHealthMetricsQuery,
): Promise<PlatformHealthMetricsDto> {
  const today = todayInDhaka();
  const range = parseReportDateRange(
    subtractDaysFromDateStr(today, query.periodDays - 1),
    today,
  );

  const [logs, recentErrors] = await Promise.all([
    prisma.platformApiLog.findMany({
      where: { createdAt: { gte: range.from, lte: range.to } },
      select: {
        statusCode: true,
        responseTimeMs: true,
        createdAt: true,
      },
    }),
    prisma.platformApiLog.findMany({
      where: {
        createdAt: { gte: range.from, lte: range.to },
        statusCode: { gte: 400 },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        createdAt: true,
        endpoint: true,
        statusCode: true,
        responseTimeMs: true,
        tenantId: true,
      },
    }),
  ]);

  const total = logs.length;
  const errors = logs.filter((l) => l.statusCode >= 400).length;
  const avgResponseMs = total
    ? Math.round(logs.reduce((s, l) => s + l.responseTimeMs, 0) / total)
    : 0;

  const periodMinutes = Math.max(
    1,
    (range.to.getTime() - range.from.getTime()) / 60_000,
  );

  const mem = process.memoryUsage();
  const memoryUsagePct = Math.round(
    (mem.heapUsed / mem.heapTotal) * 1000,
  ) / 10;

  const dayMap = new Map<string, { total: number; errors: number }>();
  for (const log of logs) {
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
    }).format(log.createdAt);
    const cur = dayMap.get(date) ?? { total: 0, errors: 0 };
    cur.total++;
    if (log.statusCode >= 500) cur.errors++;
    dayMap.set(date, cur);
  }

  const uptimeByDay = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date,
      uptimePct: pct(stats.errors, stats.total),
    }));

  return {
    periodDays: query.periodDays,
    errorRatePct: total ? Math.round((errors / total) * 1000) / 10 : 0,
    avgResponseMs,
    requestsPerMinute: Math.round((total / periodMinutes) * 10) / 10,
    memoryUsagePct,
    recentErrors: recentErrors.map((e) => ({
      timestamp: e.createdAt.toISOString(),
      endpoint: e.endpoint,
      statusCode: e.statusCode,
      responseTimeMs: e.responseTimeMs,
      tenantId: e.tenantId,
    })),
    uptimeByDay,
  };
}
