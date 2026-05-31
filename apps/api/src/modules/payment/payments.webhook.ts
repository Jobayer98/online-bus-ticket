import {
  paymentWebhookSchema,
  assertPaymentWebhookDoesNotRefund,
  type PaymentWebhookAckDto,
} from "@repo/shared";

/** Acknowledge provider webhooks. Never mutates refund state — refunds are counter-only. */
export function handlePaymentWebhook(body: unknown): PaymentWebhookAckDto {
  const payload = paymentWebhookSchema.parse(body ?? {});
  assertPaymentWebhookDoesNotRefund(payload);
  return { received: true };
}
