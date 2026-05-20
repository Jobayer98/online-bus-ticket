import { z } from "zod";
import { busTypeSchema, seatClassSchema, timePeriodSchema } from "../../enums/index.js";
import { isValidTripDate } from "../../utils/date.js";

export const searchSchedulesQuerySchema = z.object({
  fromStopId: z.string().cuid(),
  toStopId: z.string().cuid(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isValidTripDate, { message: "Date must be today or later" }),
  busType: busTypeSchema.optional(),
  timePeriod: timePeriodSchema.optional(),
  seatClass: seatClassSchema.optional(),
});

export type SearchSchedulesQuery = z.infer<typeof searchSchedulesQuerySchema>;
