import { z } from "zod";
import { paymentMethodSchema } from "../../enums/payment.js";
import { passengerSchema } from "../booking/booking.schema.js";

export const counterSellSchema = z.object({
  scheduleId: z.string().cuid(),
  seatLabels: z.array(z.string()).min(1),
  boardingPointId: z.string().cuid(),
  passenger: passengerSchema,
  method: paymentMethodSchema,
});

export const counterBookingActionSchema = z.object({
  bookingId: z.string().cuid(),
  note: z.string().optional(),
});

export type CounterSellInput = z.infer<typeof counterSellSchema>;
