import { Router } from "express";
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

paymentsRouter.get("/callback/:providerCode", async (req, res, next) => {
  try {
    const providerCode = paymentProviderCodeSchema.parse(req.params.providerCode);
    const result = await paymentService.processPaymentCallback({
      providerCode,
      bookingId: req.query.bookingId as string | undefined,
      invoiceId: req.query.invoiceId as string | undefined,
      clientSecret: req.query.clientSecret as string | undefined,
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      val_id: req.query.val_id as string | undefined,
      paymentID: req.query.paymentID as string | undefined,
    });
    res.redirect(result.redirectUrl);
  } catch (e) {
    next(e);
  }
});
