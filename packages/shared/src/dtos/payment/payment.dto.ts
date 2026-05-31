import { z } from "zod";
import { paymentMethodSchema } from "../../enums/payment.js";

export const initiatePaymentResponseSchema = z.object({
  paymentId: z.string(),
  bookingId: z.string(),
  amount: z.number().int(),
  method: paymentMethodSchema,
  clientSecret: z.string(),
});

export type InitiatePaymentResponseDto = z.infer<
  typeof initiatePaymentResponseSchema
>;

export const confirmPaymentResponseSchema = z.object({
  bookingId: z.string(),
  ticket: z.object({
    passengerNumber: z.string(),
    id: z.string(),
  }),
});

export type ConfirmPaymentResponseDto = z.infer<
  typeof confirmPaymentResponseSchema
>;
