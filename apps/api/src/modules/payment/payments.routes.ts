import { Router, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import {
  initiatePaymentSchema,
  confirmPaymentSchema,
  paymentProviderCodeSchema,
  successResponse,
  assertPaymentWebhookDoesNotRefund,
} from "@repo/shared";
import * as paymentService from "./payments.service.js";
import { processInvoiceWebhook } from "../platform/platform-invoice-payment.service.js";

export const paymentsRouter = Router();

const paymentLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
});

paymentsRouter.get("/gateways", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id ?? null;
    const data = await paymentService.listPaymentGateways(tenantId);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

paymentsRouter.post("/initiate", paymentLimiter, async (req, res, next) => {
  try {
    const input = initiatePaymentSchema.parse(req.body);
    const data = await paymentService.initiatePayment(input);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

paymentsRouter.post("/confirm", paymentLimiter, async (req, res, next) => {
  try {
    const input = confirmPaymentSchema.parse(req.body);
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const data = await paymentService.confirmPayment(
      input.bookingId,
      input.clientSecret,
      idempotencyKey,
      input.providerRef,
    );
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

paymentsRouter.post("/webhook/:providerCode", async (req, res, next) => {
  try {
    assertPaymentWebhookDoesNotRefund(req.body ?? {});
    const providerCode = paymentProviderCodeSchema.parse(req.params.providerCode);
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }

    const invoiceResult = await processInvoiceWebhook(
      providerCode,
      req.body,
      headers,
    );
    if (invoiceResult.handled) {
      res.json(successResponse({ received: true }));
      return;
    }

    const result = await paymentService.processProviderWebhook(
      providerCode,
      req.body,
      headers,
    );
    res.json(successResponse({ received: true, ...result }));
  } catch (e) {
    next(e);
  }
});

const handlePaymentCallback: RequestHandler = async (req, res, next) => {
  try {
    const providerCode = paymentProviderCodeSchema.parse(req.params.providerCode);
    const body =
      req.body && typeof req.body === "object"
        ? (req.body as Record<string, unknown>)
        : {};
    const readParam = (key: string): string | undefined => {
      const value = req.query[key] ?? body[key];
      return typeof value === "string" ? value : undefined;
    };

    const result = await paymentService.processPaymentCallback({
      providerCode,
      bookingId: readParam("bookingId"),
      invoiceId: readParam("invoiceId"),
      clientSecret: readParam("clientSecret"),
      status: readParam("status"),
      type: readParam("type"),
      val_id: readParam("val_id"),
      paymentID: readParam("paymentID"),
    });
    res.redirect(result.redirectUrl);
  } catch (e) {
    next(e);
  }
};

paymentsRouter.get("/callback/:providerCode", handlePaymentCallback);
paymentsRouter.post("/callback/:providerCode", handlePaymentCallback);
