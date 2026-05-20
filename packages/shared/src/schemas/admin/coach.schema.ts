import { z } from "zod";
import { busTypeSchema } from "../../enums/index.js";

export const createCoachSchema = z.object({
  coachNumber: z.string().min(1),
  busType: busTypeSchema,
  seatLayoutId: z.string().cuid().optional(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
