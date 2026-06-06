import { z } from "zod";
import { invoiceStatusSchema } from "../../schemas/platform/phase3.schema.js";
import { announcementTypeSchema } from "../../schemas/platform/phase3.schema.js";

export const platformInvoiceDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  subscriptionId: z.string(),
  invoiceNumber: z.string(),
  amountMinor: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  status: invoiceStatusSchema,
  paidAt: z.string().nullable(),
  createdAt: z.string(),
});

export const platformAnnouncementDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  type: announcementTypeSchema,
  sendToAll: z.boolean(),
  tenantIds: z.array(z.string()).nullable(),
  scheduledAt: z.string().nullable(),
  sentAt: z.string().nullable(),
  createdAt: z.string(),
});

export type PlatformInvoiceDto = z.infer<typeof platformInvoiceDtoSchema>;
export type PlatformAnnouncementDto = z.infer<
  typeof platformAnnouncementDtoSchema
>;
