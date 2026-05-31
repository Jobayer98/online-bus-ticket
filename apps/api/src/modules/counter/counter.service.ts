import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  assertCounterRefundEligible,
  type CounterRefundResponseDto,
} from "@repo/shared";

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
