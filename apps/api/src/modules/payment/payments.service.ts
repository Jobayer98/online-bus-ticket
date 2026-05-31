import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  SEAT_HOLD_PAYMENT_TTL_MS,
  type ConfirmPaymentResponseDto,
  type InitiatePaymentInput,
  type InitiatePaymentResponseDto,
} from "@repo/shared";
import {
  createPaymentClientSecret,
  paymentSigningSecret,
  verifyPaymentClientSecret,
} from "../../lib/payment-client-secret.js";
import type { DbClient } from "../../lib/db-client.js";
import { enqueueBookingNotifications } from "../../jobs/dispatch-notifications.js";
import { issueTicket } from "../ticket/tickets.service.js";

type BookingForPayment = {
  id: string;
  status: string;
  totalAmount: number;
  hold: { expiresAt: Date } | null;
};

function assertBookingPayable(booking: BookingForPayment): void {
  if (booking.status === "PAID") {
    throw new AppError(ErrorCode.CONFLICT, "Already paid", 409);
  }
  if (booking.status === "CANCELLED") {
    throw new AppError(ErrorCode.CONFLICT, "Booking cancelled", 409);
  }
  if (booking.status === "REFUNDED") {
    throw new AppError(ErrorCode.CONFLICT, "Booking refunded", 409);
  }
  if (booking.status !== "HELD") {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Booking is not ready for payment",
      409,
    );
  }
  const holdExpiresAt =
    booking.hold?.expiresAt ??
    new Date(Date.now() + SEAT_HOLD_PAYMENT_TTL_MS);
  if (holdExpiresAt < new Date()) {
    throw new AppError(ErrorCode.HOLD_EXPIRED, "Hold expired", 409);
  }
}

export async function initiatePaymentWithClient(
  db: DbClient,
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResponseDto> {
  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    include: { hold: true },
  });
  if (!booking) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);
  }
  assertBookingPayable(booking);

  const payment = await db.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      method: input.method,
      status: "PENDING",
    },
    update: {
      method: input.method,
      status: "PENDING",
      amount: booking.totalAmount,
    },
  });

  const holdExpiresAt =
    booking.hold?.expiresAt ??
    new Date(Date.now() + SEAT_HOLD_PAYMENT_TTL_MS);
  const clientSecret = createPaymentClientSecret(paymentSigningSecret(), {
    paymentId: payment.id,
    bookingId: booking.id,
    exp: holdExpiresAt.getTime(),
  });

  return {
    paymentId: payment.id,
    bookingId: booking.id,
    amount: payment.amount,
    method: payment.method,
    clientSecret,
  };
}

export async function initiatePayment(input: InitiatePaymentInput) {
  return initiatePaymentWithClient(prisma, input);
}

export async function confirmPaymentWithClient(
  db: DbClient,
  bookingId: string,
  clientSecret: string,
  idempotencyKey?: string,
  providerRef?: string,
): Promise<void> {
  const tokenPayload = verifyPaymentClientSecret(
    paymentSigningSecret(),
    clientSecret,
    bookingId,
  );

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      hold: true,
      seats: true,
      payment: true,
    },
  });
  if (!booking) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);
  }

  assertBookingPayable(booking);

  if (!booking.payment || booking.payment.status !== "PENDING") {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Payment not initiated or already completed",
      409,
    );
  }
  if (booking.payment.id !== tokenPayload.paymentId) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid payment token", 401);
  }

  const updated = await db.payment.updateMany({
    where: { bookingId, status: "PENDING", id: tokenPayload.paymentId },
    data: {
      status: "COMPLETED",
      idempotencyKey,
      providerRef: providerRef ?? `mock_${Date.now()}`,
    },
  });
  if (updated.count !== 1) {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Payment not initiated or already completed",
      409,
    );
  }
  await db.booking.update({
    where: { id: bookingId, status: "HELD" },
    data: { status: "PAID" },
  });
  const seatIds = booking.seats.map((s) => s.scheduleSeatId);
  await db.scheduleSeat.updateMany({
    where: { id: { in: seatIds } },
    data: { status: "SOLD" },
  });
}

export async function confirmPayment(
  bookingId: string,
  clientSecret: string,
  idempotencyKey?: string,
  providerRef?: string,
): Promise<ConfirmPaymentResponseDto> {
  if (idempotencyKey) {
    const existing = await prisma.payment.findUnique({
      where: { idempotencyKey },
      include: { booking: { include: { ticket: true } } },
    });
    if (existing?.status === "COMPLETED" && existing.booking.ticket) {
      enqueueBookingNotifications(existing.bookingId);
      return {
        bookingId: existing.bookingId,
        ticket: existing.booking.ticket,
      };
    }
  }

  await prisma.$transaction(async (tx) =>
    confirmPaymentWithClient(
      tx,
      bookingId,
      clientSecret,
      idempotencyKey,
      providerRef,
    ),
  );

  const ticket = await issueTicket(bookingId);
  enqueueBookingNotifications(bookingId);
  return {
    bookingId,
    ticket: {
      passengerNumber: ticket.passengerNumber,
      id: ticket.id,
    },
  };
}
