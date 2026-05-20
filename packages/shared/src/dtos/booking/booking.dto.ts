import { z } from "zod";

export const bookingDtoSchema = z.object({
  id: z.string(),
  status: z.string(),
  scheduleId: z.string(),
  passengerName: z.string(),
  passengerPhone: z.string(),
  totalAmount: z.number().int(),
  seatLabels: z.array(z.string()),
  createdAt: z.string().datetime(),
  holdId: z.string().nullable().optional(),
  holdExpiresAt: z.string().datetime().nullable().optional(),
});

export type BookingDto = z.infer<typeof bookingDtoSchema>;
