import { z } from "zod";

export const createStopSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  code: z.string().min(2).max(10),
});

export const updateStopSchema = createStopSchema.partial();

export type CreateStopInput = z.infer<typeof createStopSchema>;
