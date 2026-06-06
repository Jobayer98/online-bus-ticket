import { z } from "zod";

export const platformAlertStatusSchema = z.enum([
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
]);

export const platformAlertSeveritySchema = z.enum([
  "INFO",
  "WARNING",
  "CRITICAL",
]);

export const listPlatformAlertsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: platformAlertStatusSchema.optional(),
});

export const updatePlatformAlertSchema = z.object({
  status: platformAlertStatusSchema,
});

export type ListPlatformAlertsQuery = z.infer<
  typeof listPlatformAlertsQuerySchema
>;
export type UpdatePlatformAlertInput = z.infer<typeof updatePlatformAlertSchema>;
