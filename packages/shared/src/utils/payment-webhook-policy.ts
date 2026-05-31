import { AppError } from "../errors/app-error.js";
import { ErrorCode } from "../errors/error-codes.js";

export type PaymentWebhookPayload = {
  event?: string;
  type?: string;
  status?: string;
};

/** True when a provider webhook payload represents a refund (must not mutate booking state). */
export function isRefundWebhookPayload(payload: PaymentWebhookPayload): boolean {
  for (const field of [payload.event, payload.type]) {
    if (field && /refund/i.test(field)) {
      return true;
    }
  }
  if (payload.status && /^refunded$/i.test(payload.status)) {
    return true;
  }
  return false;
}

export function assertPaymentWebhookDoesNotRefund(
  payload: PaymentWebhookPayload,
): void {
  if (isRefundWebhookPayload(payload)) {
    throw new AppError(
      ErrorCode.REFUND_NOT_ALLOWED,
      "Refunds are counter-only; webhook cannot process refund events",
      409,
    );
  }
}
