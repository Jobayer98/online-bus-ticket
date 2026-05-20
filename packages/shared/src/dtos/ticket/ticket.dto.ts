import { z } from "zod";

export const ticketDtoSchema = z.object({
  passengerNumber: z.string(),
  passengerName: z.string(),
  passengerPhone: z.string(),
  scheduleId: z.string(),
  departureAt: z.string().datetime(),
  routeSlug: z.string(),
  seatLabels: z.array(z.string()),
  totalAmount: z.number().int(),
  boardingPoint: z.string(),
});

export type TicketDto = z.infer<typeof ticketDtoSchema>;
