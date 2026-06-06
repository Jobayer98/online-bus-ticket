import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";
import type {
  ListPlatformAuditLogsQuery,
  PlatformAuditLogDto,
} from "@repo/shared";
import {
  dhakaEndOfDay,
  dhakaStartOfDay,
  parseReportDateRange,
} from "@repo/shared";

export type PlatformAuditActor = {
  actorId: string | null;
  actorName: string;
  actorType: "SUPER_ADMIN" | "SYSTEM";
};

export type PlatformAuditInput = {
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  actor: PlatformAuditActor;
};

function toAuditDto(row: {
  id: string;
  actorId: string | null;
  actorName: string;
  actorType: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: unknown;
  ipAddress: string | null;
  createdAt: Date;
}): PlatformAuditLogDto {
  return {
    id: row.id,
    actorId: row.actorId,
    actorName: row.actorName,
    actorType: row.actorType as PlatformAuditLogDto["actorType"],
    action: row.action as PlatformAuditLogDto["action"],
    resourceType: row.resourceType as PlatformAuditLogDto["resourceType"],
    resourceId: row.resourceId,
    changes:
      row.changes && typeof row.changes === "object"
        ? (row.changes as Record<string, unknown>)
        : null,
    ipAddress: row.ipAddress,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function logPlatformAudit(input: PlatformAuditInput): Promise<void> {
  await prisma.platformAuditLog.create({
    data: {
      actorId: input.actor.actorId,
      actorName: input.actor.actorName,
      actorType: input.actor.actorType,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      changes: (input.changes ?? undefined) as Prisma.InputJsonValue | undefined,
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export async function listPlatformAuditLogs(query: ListPlatformAuditLogsQuery) {
  const skip = (query.page - 1) * query.pageSize;
  const where: {
    action?: string;
    resourceType?: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (query.action) where.action = query.action;
  if (query.resourceType) where.resourceType = query.resourceType;
  if (query.from || query.to) {
    const range = parseReportDateRange(query.from, query.to);
    where.createdAt = { gte: range.from, lte: range.to };
  } else if (query.from) {
    where.createdAt = { gte: dhakaStartOfDay(query.from) };
  } else if (query.to) {
    where.createdAt = { lte: dhakaEndOfDay(query.to) };
  }

  const [rows, total] = await Promise.all([
    prisma.platformAuditLog.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.platformAuditLog.count({ where }),
  ]);

  return {
    logs: rows.map(toAuditDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildAuditCsv(
  logs: PlatformAuditLogDto[],
): string {
  const header = "timestamp,actor,action,resourceType,resourceId,ipAddress";
  const rows = logs.map((l) =>
    [
      l.createdAt,
      escapeCsv(l.actorName),
      l.action,
      l.resourceType,
      l.resourceId,
      l.ipAddress ?? "",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export async function exportPlatformAuditLogs(
  query: Omit<ListPlatformAuditLogsQuery, "page" | "pageSize">,
) {
  const where: {
    action?: string;
    resourceType?: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (query.action) where.action = query.action;
  if (query.resourceType) where.resourceType = query.resourceType;
  if (query.from || query.to) {
    const range = parseReportDateRange(query.from, query.to);
    where.createdAt = { gte: range.from, lte: range.to };
  } else if (query.from) {
    where.createdAt = { gte: dhakaStartOfDay(query.from) };
  } else if (query.to) {
    where.createdAt = { lte: dhakaEndOfDay(query.to) };
  }

  const rows = await prisma.platformAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  return rows.map(toAuditDto);
}

export async function resolveAuditActor(userId: string): Promise<PlatformAuditActor> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });
  return {
    actorId: user?.id ?? userId,
    actorName: user?.name ?? "Platform Admin",
    actorType: "SUPER_ADMIN",
  };
}
