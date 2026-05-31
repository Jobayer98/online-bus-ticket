import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createHoldSchema,
  createBookingSchema,
  getBookingQuerySchema,
  bookingIdParamsSchema,
  releaseHoldParamsSchema,
  releaseHoldQuerySchema,
  successResponse,
  HOLD_CREATE_RATE_LIMIT,
} from "@repo/shared";
import * as bookingService from "./bookings.service.js";

export const bookingsRouter = Router();

const holdCreateLimiter = rateLimit({
  windowMs: HOLD_CREATE_RATE_LIMIT.windowMs,
  max: HOLD_CREATE_RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
});

bookingsRouter.post("/hold", holdCreateLimiter, async (req, res, next) => {
  try {
    const input = createHoldSchema.parse(req.body);
    const data = await bookingService.createHold(input);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

bookingsRouter.delete("/hold/:id", async (req, res, next) => {
  try {
    const { id } = releaseHoldParamsSchema.parse(req.params);
    const query = releaseHoldQuerySchema.parse(req.query);
    await bookingService.releaseHold(id, query);
    res.json(successResponse({ released: true }));
  } catch (e) {
    next(e);
  }
});

bookingsRouter.post("/", async (req, res, next) => {
  try {
    const input = createBookingSchema.parse(req.body);
    const data = await bookingService.createBooking(input, req.userId);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

bookingsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = bookingIdParamsSchema.parse(req.params);
    const query = getBookingQuerySchema.parse(req.query);
    const data = await bookingService.getBooking(id, {
      userId: req.userId,
      accessToken: query.accessToken,
    });
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
