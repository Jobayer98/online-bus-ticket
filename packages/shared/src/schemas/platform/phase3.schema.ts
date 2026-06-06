import { z } from "zod";

export const invoiceStatusSchema = z.enum(["PENDING", "PAID", "FAILED"]);

export const listPlatformInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  tenantId: z.string().optional(),
  status: invoiceStatusSchema.optional(),
});

export const announcementTypeSchema = z.enum([
  "MAINTENANCE",
  "FEATURE",
  "POLICY",
]);

export const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(3).max(5000),
  type: announcementTypeSchema,
  sendToAll: z.boolean().optional().default(true),
  tenantIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const bulkSuspendTenantsSchema = z.object({
  tenantIds: z.array(z.string()).min(1).max(50),
});

export const bulkExportTenantsSchema = z.object({
  tenantIds: z.array(z.string()).optional(),
});

export type ListPlatformInvoicesQuery = z.infer<
  typeof listPlatformInvoicesQuerySchema
>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type BulkSuspendTenantsInput = z.infer<typeof bulkSuspendTenantsSchema>;
