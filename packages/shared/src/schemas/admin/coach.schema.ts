import { z } from "zod";
import { busTypeSchema } from "../../enums/index.js";
import { prismaIdSchema } from "../booking/booking.schema.js";

const seatLayoutIdField = z
  .union([prismaIdSchema, z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));

export const createCoachSchema = z.object({
  coachNumber: z.string().min(1),
  busType: busTypeSchema,
  seatLayoutId: seatLayoutIdField,
});

export const updateCoachSchema = z.object({
  coachNumber: z.string().min(1).optional(),
  busType: busTypeSchema.optional(),
  seatLayoutId: seatLayoutIdField,
});

export const coachIdParamsSchema = z.object({
  id: prismaIdSchema,
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;
export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;
