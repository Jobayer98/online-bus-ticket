import { z } from "zod";

export const ticketLookupSchema = z.object({
  passengerNumber: z.string().min(4),
  phone: z.string().min(10).max(15),
});

export type TicketLookupInput = z.infer<typeof ticketLookupSchema>;
