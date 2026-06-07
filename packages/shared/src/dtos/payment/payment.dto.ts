import { z } from "zod";
import { paymentMethodSchema } from "../../enums/payment.js";
import { paymentProviderCodeSchema } from "../../enums/payment-provider.js";

export const initiatePaymentResponseSchema = z.object({
  paymentId: z.string(),
  bookingId: z.string(),
  amount: z.number().int(),
  method: paymentMethodSchema,
  clientSecret: z.string(),
  providerCode: paymentProviderCodeSchema.optional(),
  settlementRoute: z.enum(["TENANT_DIRECT", "SYSTEM"]).optional(),
  redirectUrl: z.string().url().optional(),
  sessionId: z.string().optional(),
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
