import { z } from "zod";

export const bookingDtoSchema = z.object({
  id: z.string(),
  status: z.string(),
  scheduleId: z.string(),
  passengerName: z.string(),
  passengerPhone: z.string(),
  passengerEmail: z.string().nullable().optional(),
  totalAmount: z.number().int(),
  seatLabels: z.array(z.string()),
  createdAt: z.string().datetime(),
  holdId: z.string().nullable().optional(),
  holdExpiresAt: z.string().datetime().nullable().optional(),
  /** Schedule context — populated on GET /bookings/:id, null on create response */
  routeFrom: z.string().nullable().optional(),
  routeTo: z.string().nullable().optional(),
  departureAt: z.string().nullable().optional(),
  coachNumber: z.string().nullable().optional(),
  busType: z.string().nullable().optional(),
  boardingPointName: z.string().nullable().optional(),
});

export type BookingDto = z.infer<typeof bookingDtoSchema>;

/** Returned once from POST /bookings — required for guest GET /bookings/:id. */
export const createBookingResponseSchema = bookingDtoSchema.extend({
  bookingAccessToken: z.string(),
});

export type CreateBookingResponseDto = z.infer<typeof createBookingResponseSchema>;
