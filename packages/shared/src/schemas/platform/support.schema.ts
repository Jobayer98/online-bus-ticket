import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const ticketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const listSupportTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  tenantId: z.string().optional(),
});

export const createSupportTicketSchema = z.object({
  tenantId: z.string(),
  subject: z.string().min(3).max(200),
  priority: ticketPrioritySchema.optional().default("MEDIUM"),
  body: z.string().min(1).max(5000),
  createdByName: z.string().min(1).max(100).optional(),
});

export const replySupportTicketSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const updateSupportTicketSchema = z.object({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  assignedToId: z.string().nullable().optional(),
});

export type ListSupportTicketsQuery = z.infer<
  typeof listSupportTicketsQuerySchema
>;
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type ReplySupportTicketInput = z.infer<typeof replySupportTicketSchema>;
export type UpdateSupportTicketInput = z.infer<typeof updateSupportTicketSchema>;
