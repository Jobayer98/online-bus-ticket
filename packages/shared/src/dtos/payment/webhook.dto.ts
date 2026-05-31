import { z } from "zod";

export const paymentWebhookAckSchema = z.object({
  received: z.literal(true),
});

export type PaymentWebhookAckDto = z.infer<typeof paymentWebhookAckSchema>;
