import { describe, expect, it } from "vitest";
import {
  assertPaymentWebhookDoesNotRefund,
  isRefundWebhookPayload,
  AppError,
} from "@repo/shared";
import { handlePaymentWebhook } from "./payments.webhook.js";

describe("payment webhook policy", () => {
  it("detects refund events", () => {
    expect(isRefundWebhookPayload({ event: "payment.refunded" })).toBe(true);
    expect(isRefundWebhookPayload({ type: "REFUND_COMPLETED" })).toBe(true);
    expect(isRefundWebhookPayload({ status: "REFUNDED" })).toBe(true);
    expect(isRefundWebhookPayload({ event: "payment.completed" })).toBe(false);
  });

  it("rejects refund-shaped payloads", () => {
    expect(() =>
      assertPaymentWebhookDoesNotRefund({ event: "payment.refunded" }),
    ).toThrow(AppError);
    try {
      assertPaymentWebhookDoesNotRefund({ event: "payment.refunded" });
    } catch (e) {
      expect(e).toMatchObject({
        code: "REFUND_NOT_ALLOWED",
        statusCode: 409,
      });
    }
  });

  it("handlePaymentWebhook returns ack for non-refund events", () => {
    expect(
      handlePaymentWebhook({ event: "payment.completed" }),
    ).toEqual({ received: true });
  });

  it("handlePaymentWebhook throws for refund events", () => {
    expect(() =>
      handlePaymentWebhook({ event: "payment.refunded" }),
    ).toThrow(AppError);
  });
});
