import { z } from "zod";

export const importRowErrorSchema = z.object({
  row: z.number().int().positive(),
  message: z.string(),
});

export const importResultDtoSchema = z.object({
  created: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  errors: z.array(importRowErrorSchema),
});

export type ImportRowError = z.infer<typeof importRowErrorSchema>;
export type ImportResultDto = z.infer<typeof importResultDtoSchema>;
