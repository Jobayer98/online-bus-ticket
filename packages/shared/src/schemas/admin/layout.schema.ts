import { z } from "zod";
import { seatClassSchema } from "../../enums/index.js";

export const seatTemplateInputSchema = z.object({
  label: z.string().min(1),
  row: z.number().int().nonnegative(),
  col: z.number().int().nonnegative(),
  seatClass: seatClassSchema,
});

export const createLayoutSchema = z.object({
  name: z.string().min(1),
  rows: z.number().int().positive(),
  cols: z.number().int().positive(),
  templates: z.array(seatTemplateInputSchema).min(1),
});

export type CreateLayoutInput = z.infer<typeof createLayoutSchema>;
