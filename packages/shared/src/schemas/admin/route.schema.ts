import { z } from "zod";

export const createRouteSchema = z.object({
  fromStopId: z.string().cuid(),
  toStopId: z.string().cuid(),
  distanceKm: z.number().int().positive().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
