import { z } from "zod";

/** Prisma cuid / cuid2 — avoid Zod .cuid() which only accepts legacy cuid v1. */
export const prismaIdSchema = z.string().min(20).max(36);

export const createHoldSchema = z.object({
  scheduleId: prismaIdSchema,
  seatLabels: z.array(z.string().min(1)).min(1).max(10),
  sessionId: z.string().min(1),
});

export const passengerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10).max(15),
  email: z.union([z.string().email(), z.literal("")]).optional(),
});

export const createBookingSchema = z.object({
  holdId: prismaIdSchema,
  boardingPointId: prismaIdSchema,
  passenger: passengerSchema,
});

export type CreateHoldInput = z.infer<typeof createHoldSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
