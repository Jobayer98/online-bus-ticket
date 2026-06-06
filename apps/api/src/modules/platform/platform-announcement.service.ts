import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";
import {
  type CreateAnnouncementInput,
  type PlatformAnnouncementDto,
} from "@repo/shared";

function toAnnouncementDto(row: {
  id: string;
  title: string;
  body: string;
  type: string;
  sendToAll: boolean;
  tenantIds: unknown;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
}): PlatformAnnouncementDto {
  const tenantIds =
    row.tenantIds && Array.isArray(row.tenantIds)
      ? (row.tenantIds as string[])
      : null;

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type as PlatformAnnouncementDto["type"],
    sendToAll: row.sendToAll,
    tenantIds,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAnnouncements() {
  const rows = await prisma.platformAnnouncement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map(toAnnouncementDto);
}

export async function createAnnouncement(
  input: CreateAnnouncementInput,
  createdById: string,
) {
  const sendToAll = input.sendToAll ?? true;
  const tenantIds = sendToAll ? null : (input.tenantIds ?? []);
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const now = new Date();
  const sentAt = !scheduledAt || scheduledAt <= now ? now : null;

  const row = await prisma.platformAnnouncement.create({
    data: {
      title: input.title,
      body: input.body,
      type: input.type,
      sendToAll,
      tenantIds: tenantIds as Prisma.InputJsonValue,
      scheduledAt,
      sentAt,
      createdById,
    },
  });

  return toAnnouncementDto(row);
}
