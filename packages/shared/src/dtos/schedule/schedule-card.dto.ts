import { z } from "zod";
import { busTypeSchema, seatClassSchema } from "../../enums/index.js";

export const scheduleCardSchema = z.object({
  scheduleId: z.string(),
  coachNumber: z.string(),
  startPoint: z.string(),
  departureAt: z.string().datetime(),
  endPoint: z.string(),
  estimatedArrivalAt: z.string().datetime(),
  busType: busTypeSchema,
  seatClasses: z.array(seatClassSchema),
  fareFrom: z.number().int(),
  availableSeats: z.number().int(),
  routeSlug: z.string(),
});

export type ScheduleCardDto = z.infer<typeof scheduleCardSchema>;
