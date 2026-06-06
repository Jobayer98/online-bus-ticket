import { z } from "zod";
import {
  platformAuditActionSchema,
  platformAuditResourceTypeSchema,
} from "../../schemas/platform/audit.schema.js";

export const platformAuditLogDtoSchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  actorName: z.string(),
  actorType: z.enum(["SUPER_ADMIN", "SYSTEM"]),
  action: platformAuditActionSchema,
  resourceType: platformAuditResourceTypeSchema,
  resourceId: z.string(),
  changes: z.record(z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
});

export type PlatformAuditLogDto = z.infer<typeof platformAuditLogDtoSchema>;
