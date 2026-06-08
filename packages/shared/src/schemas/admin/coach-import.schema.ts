import { z } from "zod";
import { busTypeSchema } from "../../enums/index.js";

const busTypeImportSchema = z
  .string()
  .min(1)
  .transform((v) => v.trim().toUpperCase().replace(/\s+/g, "_"))
  .pipe(busTypeSchema);

export const importCoachRowSchema = z.object({
  coachNumber: z.string().min(1),
  busType: busTypeImportSchema,
  seatLayoutName: z.string().optional(),
});

export const importCoachesSchema = z.object({
  rows: z.array(importCoachRowSchema).min(1).max(500),
  skipDuplicates: z.boolean().default(true),
});

export type ImportCoachRow = z.infer<typeof importCoachRowSchema>;
export type ImportCoachesInput = z.infer<typeof importCoachesSchema>;
