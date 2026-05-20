import { Router } from "express";
import { prisma } from "@repo/database";
import {
  counterSellSchema,
  counterBookingActionSchema,
  successResponse,
  AppError,
  ErrorCode,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import * as bookingService from "../booking/bookings.service.js";
import * as paymentService from "../payment/payments.service.js";

export const counterRouter = Router();
counterRouter.use(authenticateRequired, requireRole("COUNTER_SELLER", "ADMIN"));

counterRouter.post("/sell", async (req, res, next) => {
  try {
    const input = counterSellSchema.parse(req.body);
    const sessionId = `counter_${req.userId}_${Date.now()}`;
    const hold = await bookingService.createHold({
      scheduleId: input.scheduleId,
      seatLabels: input.seatLabels,
      sessionId,
    });
    const booking = await bookingService.createBooking({
      holdId: hold.holdId,
      boardingPointId: input.boardingPointId,
      passenger: input.passenger,
    });
    await paymentService.initiatePayment({
      bookingId: booking.id,
      method: input.method,
    });
    const result = await paymentService.confirmPayment(
      booking.id,
      `counter_${booking.id}`,
    );
    await prisma.counterTransaction.create({
      data: {
        type: "SELL",
        sellerId: req.userId!,
        bookingId: booking.id,
        amount: booking.totalAmount,
      },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { soldById: req.userId, channel: "COUNTER" },
    });
    res.status(201).json(successResponse(result));
  } catch (e) {
    next(e);
  }
});

counterRouter.post("/change", async (req, res, next) => {
  try {
    const { bookingId, note } = counterBookingActionSchema.parse(req.body);
    await prisma.counterTransaction.create({
      data: {
        type: "CHANGE",
        sellerId: req.userId!,
        bookingId,
        amount: 0,
        note: note ?? "Change requested",
      },
    });
    res.json(successResponse({ recorded: true, bookingId }));
  } catch (e) {
    next(e);
  }
});

counterRouter.post("/refund", async (req, res, next) => {
  try {
    const { bookingId, note } = counterBookingActionSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seats: true, payment: true },
    });
    if (!booking || booking.status !== "PAID") {
      throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Invalid booking", 404);
    }
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "REFUNDED" },
      });
      await tx.payment.update({
        where: { bookingId },
        data: { status: "REFUNDED" },
      });
      await tx.scheduleSeat.updateMany({
        where: { id: { in: booking.seats.map((s) => s.scheduleSeatId) } },
        data: { status: "AVAILABLE" },
      });
      await tx.counterTransaction.create({
        data: {
          type: "REFUND",
          sellerId: req.userId!,
          bookingId,
          amount: -booking.totalAmount,
          note,
        },
      });
    });
    res.json(successResponse({ refunded: true }));
  } catch (e) {
    next(e);
  }
});

counterRouter.post("/cancel", async (req, res, next) => {
  try {
    const { bookingId, note } = counterBookingActionSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seats: true, hold: true },
    });
    if (!booking) throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Not found", 404);
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
      if (booking.seats.length) {
        await tx.scheduleSeat.updateMany({
          where: { id: { in: booking.seats.map((s) => s.scheduleSeatId) } },
          data: { status: "AVAILABLE" },
        });
      }
      await tx.counterTransaction.create({
        data: {
          type: "CANCEL",
          sellerId: req.userId!,
          bookingId,
          amount: 0,
          note,
        },
      });
    });
    res.json(successResponse({ cancelled: true }));
  } catch (e) {
    next(e);
  }
});

counterRouter.get("/transactions/today", async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const txns = await prisma.counterTransaction.findMany({
      where: { sellerId: req.userId!, createdAt: { gte: start } },
      orderBy: { createdAt: "desc" },
      include: { booking: { include: { ticket: true, payment: true } } },
    });
    res.json(successResponse(txns));
  } catch (e) {
    next(e);
  }
});
