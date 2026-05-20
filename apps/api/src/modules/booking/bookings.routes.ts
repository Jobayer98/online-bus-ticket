import { Router } from "express";
import {
  createHoldSchema,
  createBookingSchema,
  successResponse,
} from "@repo/shared";
import * as bookingService from "./bookings.service.js";

export const bookingsRouter = Router();

bookingsRouter.post("/hold", async (req, res, next) => {
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
    await bookingService.releaseHold(req.params.id);
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
    const data = await bookingService.getBooking(req.params.id);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
