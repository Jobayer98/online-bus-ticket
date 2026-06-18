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
  gender: z.string().optional(),
});

export const createBookingSchema = z.object({
  holdId: prismaIdSchema,
  boardingPointId: prismaIdSchema,
  passenger: passengerSchema,
  sessionId: z.string().min(1),
});

export const releaseHoldParamsSchema = z.object({
  id: prismaIdSchema,
});

export const releaseHoldQuerySchema = z
  .object({
    sessionId: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
  })
  .refine((q) => Boolean(q.sessionId || q.accessToken), {
    message: "sessionId or accessToken is required",
  });

export type CreateHoldInput = z.infer<typeof createHoldSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ReleaseHoldQuery = z.infer<typeof releaseHoldQuerySchema>;

export const bookingIdParamsSchema = z.object({
  id: prismaIdSchema,
});

export const getBookingQuerySchema = z.object({
  accessToken: z.string().min(1).optional(),
});

export type GetBookingQuery = z.infer<typeof getBookingQuerySchema>;
