import { prisma } from "@repo/database";
import { AppError, ErrorCode, type InitiatePaymentInput } from "@repo/shared";
import { issueTicket } from "../ticket/tickets.service.js";

export async function initiatePayment(input: InitiatePaymentInput) {
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);
  if (booking.status === "PAID") {
    throw new AppError(ErrorCode.CONFLICT, "Already paid", 409);
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      method: input.method,
      status: "PENDING",
    },
    update: { method: input.method, status: "PENDING" },
  });

  return {
    paymentId: payment.id,
    bookingId: booking.id,
    amount: payment.amount,
    method: payment.method,
    clientSecret: `mock_${payment.id}`,
  };
}

export async function confirmPayment(
  bookingId: string,
  idempotencyKey?: string,
  providerRef?: string,
) {
  if (idempotencyKey) {
    const existing = await prisma.payment.findUnique({
      where: { idempotencyKey },
      include: { booking: { include: { ticket: true } } },
    });
    if (existing?.status === "COMPLETED" && existing.booking.ticket) {
      return {
        bookingId: existing.bookingId,
        ticket: existing.booking.ticket,
      };
    }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      hold: { include: { items: true } },
      seats: true,
    },
  });
  if (!booking) throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { bookingId },
      data: {
        status: "COMPLETED",
        idempotencyKey,
        providerRef: providerRef ?? `mock_${Date.now()}`,
      },
    });
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });
    const seatIds = booking.seats.map((s) => s.scheduleSeatId);
    await tx.scheduleSeat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: "SOLD" },
    });
  });

  const ticket = await issueTicket(bookingId);
  return {
    bookingId,
    ticket: {
      passengerNumber: ticket.passengerNumber,
      id: ticket.id,
    },
  };
}
