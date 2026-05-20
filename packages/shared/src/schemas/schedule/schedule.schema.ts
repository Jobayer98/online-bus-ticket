import { z } from "zod";

export const createScheduleSchema = z.object({
  routeId: z.string().cuid(),
  coachId: z.string().cuid(),
  departureAt: z.string().datetime(),
  estimatedArrivalAt: z.string().datetime(),
  baseFare: z.number().int().nonnegative(),
});

export const rescheduleSchema = z.object({
  departureAt: z.string().datetime(),
  estimatedArrivalAt: z.string().datetime(),
  reason: z.string().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
