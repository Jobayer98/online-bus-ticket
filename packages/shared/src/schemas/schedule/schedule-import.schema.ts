import { z } from "zod";

export const importScheduleRowSchema = z
  .object({
    routeSlug: z.string().min(1),
    coachNumber: z.string().min(1),
    departureAt: z.string().datetime(),
    estimatedArrivalAt: z.string().datetime(),
    baseFareTaka: z.coerce.number().positive(),
  })
  .refine(
    (row) =>
      new Date(row.estimatedArrivalAt).getTime() >
      new Date(row.departureAt).getTime(),
    { message: "Arrival must be after departure" },
  )
  .refine((row) => new Date(row.departureAt).getTime() >= Date.now(), {
    message: "Departure cannot be in the past",
  });

export const importScheduleRowInputSchema = z.object({
  routeSlug: z.string(),
  coachNumber: z.string(),
  departureAt: z.string(),
  estimatedArrivalAt: z.string(),
  baseFareTaka: z.union([z.number(), z.string()]),
});

export const importSchedulesSchema = z.object({
  rows: z.array(importScheduleRowInputSchema).min(1).max(500),
});

export type ImportScheduleRow = z.infer<typeof importScheduleRowSchema>;
export type ImportSchedulesInput = z.infer<typeof importSchedulesSchema>;
