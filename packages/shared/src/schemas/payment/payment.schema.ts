import { z } from "zod";
import { paymentMethodSchema } from "../../enums/payment.js";
import { paymentProviderCodeSchema } from "../../enums/payment-provider.js";

export const initiatePaymentSchema = z.object({
  bookingId: z.string().cuid(),
  method: paymentMethodSchema,
  providerCode: paymentProviderCodeSchema.optional(),
  scheduleId: z.string().optional(),
});

export const confirmPaymentSchema = z.object({
  bookingId: z.string().cuid(),
  clientSecret: z.string().min(1),
  providerRef: z.string().min(1),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

/** Provider webhook body (stub). Refund-shaped events are rejected — counter-only refunds. */
export const paymentWebhookSchema = z
  .object({
    event: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
