import { z } from "zod";

export const platformAuditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "SUSPEND",
  "ACTIVATE",
  "DELETE",
]);

export const platformAuditResourceTypeSchema = z.enum(["TENANT"]);

export const listPlatformAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  action: platformAuditActionSchema.optional(),
  resourceType: platformAuditResourceTypeSchema.optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type ListPlatformAuditLogsQuery = z.infer<
  typeof listPlatformAuditLogsQuerySchema
>;
