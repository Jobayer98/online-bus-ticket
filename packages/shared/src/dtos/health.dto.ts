import { z } from "zod";

export const healthDtoSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
  timestamp: z.string().datetime(),
});

export type HealthDto = z.infer<typeof healthDtoSchema>;
