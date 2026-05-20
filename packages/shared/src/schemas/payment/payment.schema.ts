import { z } from "zod";
import { paymentMethodSchema } from "../../enums/payment.js";

export const initiatePaymentSchema = z.object({
  bookingId: z.string().cuid(),
  method: paymentMethodSchema,
});

export const confirmPaymentSchema = z.object({
  bookingId: z.string().cuid(),
  providerRef: z.string().optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
