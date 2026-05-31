import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  assertCounterRefundEligible,
  type ConfirmPaymentResponseDto,
  type CounterRefundResponseDto,
  type CounterSellInput,
} from "@repo/shared";
import { enqueueBookingNotifications } from "../../jobs/dispatch-notifications.js";
import { createHoldWithClient, createBookingWithClient } from "../booking/bookings.service.js";
import {
  initiatePaymentWithClient,
  confirmPaymentWithClient,
} from "../payment/payments.service.js";

/** Sole API entry point that mutates booking/payment to REFUNDED. Counter staff only. */
export async function executeCounterRefund(
  bookingId: string,
  sellerId: string,
  note?: string,
): Promise<CounterRefundResponseDto> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { seats: true, payment: true, schedule: true },
  });
  if (!booking) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Not found", 404);
  }

  const refundAmount = assertCounterRefundEligible({
    bookingStatus: booking.status,
    paymentStatus: booking.payment?.status,
    paymentAmount: booking.payment?.amount,
    totalAmount: booking.totalAmount,
    departureAt: booking.schedule.departureAt,
  });

  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.updateMany({
      where: { id: bookingId, status: "PAID" },
      data: { status: "REFUNDED" },
    });
    if (updated.count !== 1) {
      throw new AppError(ErrorCode.CONFLICT, "Booking cannot be refunded", 409);
    }
    await tx.payment.updateMany({
      where: { bookingId, status: "COMPLETED" },
      data: { status: "REFUNDED" },
    });
    await tx.scheduleSeat.updateMany({
      where: {
        id: { in: booking.seats.map((s) => s.scheduleSeatId) },
        status: "SOLD",
      },
      data: { status: "AVAILABLE" },
    });
    await tx.counterTransaction.create({
      data: {
        type: "REFUND",
        sellerId,
        bookingId,
        amount: -refundAmount,
        note,
      },
    });
  });

  return { refunded: true, refundAmount };
}

/** Atomic counter sell: hold → booking → pay → audit → channel in one transaction. */
export async function executeCounterSell(
  sellerId: string,
  input: CounterSellInput,
): Promise<ConfirmPaymentResponseDto> {
  const sessionId = `counter_${sellerId}_${Date.now()}`;

  const { bookingId, ticket } = await prisma.$transaction(async (tx) => {
    const hold = await createHoldWithClient(tx, {
      scheduleId: input.scheduleId,
      seatLabels: input.seatLabels,
      sessionId,
    });
    const { booking } = await createBookingWithClient(tx, {
      holdId: hold.id,
      boardingPointId: input.boardingPointId,
      passenger: input.passenger,
      sessionId,
    });
    const initiated = await initiatePaymentWithClient(tx, {
      bookingId: booking.id,
      method: input.method,
    });
    const ticket = await confirmPaymentWithClient(
      tx,
      booking.id,
      initiated.clientSecret,
      `counter_${booking.id}`,
    );
    await tx.counterTransaction.create({
      data: {
        type: "SELL",
        sellerId,
        bookingId: booking.id,
        amount: booking.totalAmount,
      },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: { soldById: sellerId, channel: "COUNTER" },
    });
    return { bookingId: booking.id, ticket };
  });

  enqueueBookingNotifications(bookingId);
  return { bookingId, ticket };
}
