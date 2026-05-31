import { prisma } from "@repo/database";

/** Prisma client or interactive transaction client (same model accessors). */
export type DbClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];
