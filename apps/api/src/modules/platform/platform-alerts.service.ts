import type { Prisma } from "@repo/database";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  parseReportDateRange,
  subtractDaysFromDateStr,
  todayInDhaka,
  type ListPlatformAlertsQuery,
  type PlatformAlertDto,
  type UpdatePlatformAlertInput,
} from "@repo/shared";

function toAlertDto(row: {
  id: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  source: string;
  ruleKey: string | null;
  tenantId: string | null;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  tenant: { name: string } | null;
}): PlatformAlertDto {
  return {
    id: row.id,
    severity: row.severity as PlatformAlertDto["severity"],
    title: row.title,
    message: row.message,
    status: row.status as PlatformAlertDto["status"],
    source: row.source,
    ruleKey: row.ruleKey,
    tenantId: row.tenantId,
    tenantName: row.tenant?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    acknowledgedAt: row.acknowledgedAt?.toISOString() ?? null,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}

async function evaluateAlertRules(): Promise<void> {
  const today = todayInDhaka();
  const range = parseReportDateRange(
    subtractDaysFromDateStr(today, 1),
    today,
  );

  const logs = await prisma.platformApiLog.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { statusCode: true, responseTimeMs: true },
  });

  const total = logs.length;
  const errors = logs.filter((l) => l.statusCode >= 500).length;
  const errorRate = total ? (errors / total) * 100 : 0;
  const avgLatency = total
    ? logs.reduce((s, l) => s + l.responseTimeMs, 0) / total
    : 0;

  const mem = process.memoryUsage();
  const heapPct = Math.round((mem.heapUsed / mem.heapTotal) * 100);

  const rules: Array<{
    ruleKey: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
    trigger: boolean;
  }> = [
    {
      ruleKey: "ERROR_RATE_HIGH",
      severity: "CRITICAL",
      title: "High API error rate",
      message: `5xx error rate is ${errorRate.toFixed(1)}% in the last 24h (threshold 1%)`,
      trigger: total >= 10 && errorRate > 1,
    },
    {
      ruleKey: "RESPONSE_SLOW",
      severity: "WARNING",
      title: "Elevated response time",
      message: `Average API latency is ${Math.round(avgLatency)}ms (threshold 500ms)`,
      trigger: total >= 10 && avgLatency > 500,
    },
    {
      ruleKey: "MEMORY_HIGH",
      severity: "WARNING",
      title: "High memory usage",
      message: `Heap usage at ${heapPct}% (threshold 80%)`,
      trigger: heapPct > 80,
    },
  ];

  for (const rule of rules) {
    const existing = await prisma.platformAlert.findFirst({
      where: { ruleKey: rule.ruleKey, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    });

    if (rule.trigger && !existing) {
      await prisma.platformAlert.create({
        data: {
          severity: rule.severity,
          title: rule.title,
          message: rule.message,
          ruleKey: rule.ruleKey,
          source: "SYSTEM",
        },
      });
    } else if (!rule.trigger && existing) {
      await prisma.platformAlert.update({
        where: { id: existing.id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
    }
  }

  const pastDue = await prisma.subscription.count({ where: { status: "PAST_DUE" } });
  if (pastDue > 0) {
    const existing = await prisma.platformAlert.findFirst({
      where: { ruleKey: "PAST_DUE_SUBS", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    });
    if (!existing) {
      await prisma.platformAlert.create({
        data: {
          severity: "WARNING",
          title: "Past-due subscriptions",
          message: `${pastDue} subscription(s) are past due`,
          ruleKey: "PAST_DUE_SUBS",
          source: "BILLING",
        },
      });
    }
  }
}

export async function listPlatformAlerts(query: ListPlatformAlertsQuery) {
  await evaluateAlertRules();

  const skip = (query.page - 1) * query.pageSize;
  const where: Prisma.PlatformAlertWhereInput = {};
  if (query.status) where.status = query.status;

  const [rows, total] = await Promise.all([
    prisma.platformAlert.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { createdAt: "desc" },
      include: { tenant: { select: { name: true } } },
    }),
    prisma.platformAlert.count({ where }),
  ]);

  return {
    alerts: rows.map(toAlertDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function updatePlatformAlert(
  id: string,
  input: UpdatePlatformAlertInput,
) {
  const alert = await prisma.platformAlert.findUnique({ where: { id } });
  if (!alert) {
    throw new AppError(ErrorCode.NOT_FOUND, "Alert not found", 404);
  }

  const now = new Date();
  const updated = await prisma.platformAlert.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.status === "ACKNOWLEDGED" && { acknowledgedAt: now }),
      ...(input.status === "RESOLVED" && { resolvedAt: now }),
    },
    include: { tenant: { select: { name: true } } },
  });

  return toAlertDto(updated);
}
