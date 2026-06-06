import { z } from "zod";
import {
  ticketPrioritySchema,
  ticketStatusSchema,
} from "../../schemas/platform/support.schema.js";

export const supportTicketMessageDtoSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  authorType: z.enum(["SUPER_ADMIN", "TENANT", "SYSTEM"]),
  body: z.string(),
  createdAt: z.string(),
});

export const supportTicketDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  subject: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  assignedToId: z.string().nullable(),
  createdByName: z.string(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  messageCount: z.number(),
});

export const supportTicketDetailDtoSchema = supportTicketDtoSchema.extend({
  messages: z.array(supportTicketMessageDtoSchema),
});

export type SupportTicketDto = z.infer<typeof supportTicketDtoSchema>;
export type SupportTicketDetailDto = z.infer<typeof supportTicketDetailDtoSchema>;
