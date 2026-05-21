import { z } from "zod";
import { ticketDtoSchema } from "../ticket/ticket.dto.js";

/** Payload for post-payment ticket notifications (SMS + optional email). */
export const bookingTicketNotificationSchema = ticketDtoSchema.extend({
  passengerEmail: z.string().email().optional(),
});

export type BookingTicketNotificationDto = z.infer<
  typeof bookingTicketNotificationSchema
>;
