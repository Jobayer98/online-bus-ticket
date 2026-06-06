import type { Prisma } from "@repo/database";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  type CreateSupportTicketInput,
  type ListSupportTicketsQuery,
  type ReplySupportTicketInput,
  type SupportTicketDetailDto,
  type SupportTicketDto,
  type UpdateSupportTicketInput,
} from "@repo/shared";
import {
  type PlatformAuditActor,
} from "./platform-audit.service.js";

function toTicketDto(row: {
  id: string;
  tenantId: string;
  subject: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  createdByName: string;
  createdAt: Date;
  resolvedAt: Date | null;
  tenant: { name: string };
  _count: { messages: number };
}): SupportTicketDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tenantName: row.tenant.name,
    subject: row.subject,
    status: row.status as SupportTicketDto["status"],
    priority: row.priority as SupportTicketDto["priority"],
    assignedToId: row.assignedToId,
    createdByName: row.createdByName,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    messageCount: row._count.messages,
  };
}

export async function listSupportTickets(query: ListSupportTicketsQuery) {
  const skip = (query.page - 1) * query.pageSize;
  const where: Prisma.SupportTicketWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.tenantId) where.tenantId = query.tenantId;

  const [rows, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        tenant: { select: { name: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    tickets: rows.map(toTicketDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getSupportTicket(id: string): Promise<SupportTicketDetailDto> {
  const row = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      tenant: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" } },
      _count: { select: { messages: true } },
    },
  });
  if (!row) {
    throw new AppError(ErrorCode.NOT_FOUND, "Support ticket not found", 404);
  }

  return {
    ...toTicketDto(row),
    messages: row.messages.map((m) => ({
      id: m.id,
      authorName: m.authorName,
      authorType: m.authorType as "SUPER_ADMIN" | "TENANT" | "SYSTEM",
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function createSupportTicket(
  input: CreateSupportTicketInput,
  actor: PlatformAuditActor,
) {
  const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId } });
  if (!tenant) {
    throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);
  }

  const createdByName = input.createdByName ?? actor.actorName;

  const ticket = await prisma.supportTicket.create({
    data: {
      tenantId: input.tenantId,
      subject: input.subject,
      priority: input.priority ?? "MEDIUM",
      createdByName,
      messages: {
        create: {
          authorName: createdByName,
          authorType: "SUPER_ADMIN",
          body: input.body,
        },
      },
    },
    include: {
      tenant: { select: { name: true } },
      _count: { select: { messages: true } },
    },
  });

  return toTicketDto(ticket);
}

export async function replySupportTicket(
  id: string,
  input: ReplySupportTicketInput,
  actor: PlatformAuditActor,
) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) {
    throw new AppError(ErrorCode.NOT_FOUND, "Support ticket not found", 404);
  }

  await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      authorName: actor.actorName,
      authorType: "SUPER_ADMIN",
      body: input.body,
    },
  });

  if (ticket.status === "OPEN") {
    await prisma.supportTicket.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });
  }

  return getSupportTicket(id);
}

export async function updateSupportTicket(
  id: string,
  input: UpdateSupportTicketInput,
  _actor: PlatformAuditActor,
) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) {
    throw new AppError(ErrorCode.NOT_FOUND, "Support ticket not found", 404);
  }

  const resolvedAt =
    input.status === "RESOLVED" || input.status === "CLOSED"
      ? new Date()
      : input.status !== undefined
        ? null
        : undefined;

  await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assignedToId !== undefined && {
        assignedToId: input.assignedToId,
      }),
      ...(resolvedAt !== undefined && { resolvedAt }),
    },
  });

  return getSupportTicket(id);
}
