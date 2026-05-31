import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  initiatePaymentSchema,
  confirmPaymentSchema,
  successResponse,
} from "@repo/shared";
import * as paymentService from "./payments.service.js";
import { handlePaymentWebhook } from "./payments.webhook.js";

export const paymentsRouter = Router();

const paymentLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
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

paymentsRouter.post("/webhook", (req, res, next) => {
  try {
    const data = handlePaymentWebhook(req.body);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
