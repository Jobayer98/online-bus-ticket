import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  SEAT_HOLD_PAYMENT_TTL_MS,
  SEAT_HOLD_SELECTION_TTL_MS,
  type CreateBookingInput,
  type CreateHoldInput,
} from "@repo/shared";

export async function createHold(input: CreateHoldInput) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: input.scheduleId },
    include: { scheduleSeats: true },
  });
  if (!schedule || schedule.status !== "SCHEDULED") {
    throw new AppError(ErrorCode.NOT_FOUND, "Schedule not available", 404);
  }

  const seats = schedule.scheduleSeats.filter((s) =>
    input.seatLabels.includes(s.label),
  );
  if (seats.length !== input.seatLabels.length) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Invalid seat labels", 400);
  }
  if (seats.some((s) => s.status !== "AVAILABLE")) {
    throw new AppError(ErrorCode.SEAT_NOT_AVAILABLE, "Seat not available", 409);
  }

  const expiresAt = new Date(Date.now() + SEAT_HOLD_SELECTION_TTL_MS);
  const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);

  const hold = await prisma.$transaction(async (tx) => {
    await tx.scheduleSeat.updateMany({
      where: { id: { in: seats.map((s) => s.id) } },
      data: { status: "HELD" },
    });
    return tx.seatHold.create({
      data: {
        scheduleId: input.scheduleId,
        sessionId: input.sessionId,
        expiresAt,
        items: {
          create: seats.map((s) => ({ scheduleSeatId: s.id })),
        },
      },
      include: { items: { include: { scheduleSeat: true } } },
    });
  });

  return {
    holdId: hold.id,
    expiresAt: hold.expiresAt.toISOString(),
    seatLabels: input.seatLabels,
    totalAmount,
    lineItems: seats.map((s) => ({
      label: s.label,
      seatClass: s.seatClass,
      price: s.price,
    })),
  };
}

export async function releaseHold(holdId: string) {
  const hold = await prisma.seatHold.findUnique({
    where: { id: holdId },
    include: { items: true, booking: true },
  });
  if (!hold) return;
  if (hold.booking?.status === "PAID") return;

  await prisma.$transaction(async (tx) => {
    if (hold.booking) {
      if (hold.booking.status !== "CANCELLED" && hold.booking.status !== "PAID") {
        await tx.booking.update({
          where: { id: hold.booking.id },
          data: { status: "CANCELLED", holdId: null },
        });
      } else if (hold.booking.holdId) {
        await tx.booking.update({
          where: { id: hold.booking.id },
          data: { holdId: null },
        });
      }
    }
    await tx.scheduleSeat.updateMany({
      where: {
        id: { in: hold.items.map((i) => i.scheduleSeatId) },
        status: "HELD",
      },
      data: { status: "AVAILABLE" },
    });
    await tx.seatHold.delete({ where: { id: holdId } });
  });
}

export async function createBooking(
  input: CreateBookingInput,
  userId?: string,
) {
  let resolvedUserId: string | undefined;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    resolvedUserId = user?.id;
  }

  const paymentExpiresAt = new Date(Date.now() + SEAT_HOLD_PAYMENT_TTL_MS);

  const booking = await prisma.$transaction(async (tx) => {
    const hold = await tx.seatHold.findUnique({
      where: { id: input.holdId },
      include: {
        items: { include: { scheduleSeat: true } },
        booking: true,
      },
    });
    if (!hold) {
      throw new AppError(ErrorCode.NOT_FOUND, "Hold not found", 404);
    }
    if (hold.expiresAt < new Date()) {
      throw new AppError(ErrorCode.HOLD_EXPIRED, "Hold expired", 409);
    }
    if (hold.booking && hold.booking.status !== "CANCELLED") {
      throw new AppError(ErrorCode.CONFLICT, "Hold already used", 409);
    }

    const boardingPoint = await tx.boardingPoint.findFirst({
      where: {
        id: input.boardingPointId,
        route: { schedules: { some: { id: hold.scheduleId } } },
      },
      select: { id: true },
    });
    if (!boardingPoint) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "Boarding point is not valid for this schedule. Go back and select boarding again.",
        400,
      );
    }

    const seatIds = hold.items.map((i) => i.scheduleSeatId);
    const seatsOnSchedule = await tx.scheduleSeat.findMany({
      where: { id: { in: seatIds }, scheduleId: hold.scheduleId },
      select: { id: true, status: true },
    });
    if (seatsOnSchedule.length !== seatIds.length) {
      throw new AppError(
        ErrorCode.HOLD_EXPIRED,
        "Seat hold is no longer valid. Go back and select seats again.",
        409,
      );
    }

    const notHeld = seatsOnSchedule.filter((s) => s.status !== "HELD");
    if (notHeld.length > 0) {
      const reclaimed = await tx.scheduleSeat.updateMany({
        where: {
          id: { in: notHeld.map((s) => s.id) },
          scheduleId: hold.scheduleId,
          status: "AVAILABLE",
        },
        data: { status: "HELD" },
      });
      if (reclaimed.count !== notHeld.length) {
        throw new AppError(
          ErrorCode.SEAT_NOT_AVAILABLE,
          "One or more seats are no longer available. Go back and select seats again.",
          409,
        );
      }
    }

    if (hold.booking?.status === "CANCELLED") {
      const cancelledId = hold.booking.id;
      await tx.payment.deleteMany({ where: { bookingId: cancelledId } });
      await tx.bookingSeat.deleteMany({ where: { bookingId: cancelledId } });
      await tx.ticket.deleteMany({ where: { bookingId: cancelledId } });
      await tx.counterTransaction.deleteMany({
        where: { bookingId: cancelledId },
      });
      await tx.booking.delete({ where: { id: cancelledId } });
    }

    await tx.seatHold.update({
      where: { id: hold.id },
      data: { expiresAt: paymentExpiresAt },
    });

    return tx.booking.create({
      data: {
        scheduleId: hold.scheduleId,
        holdId: hold.id,
        ...(resolvedUserId ? { userId: resolvedUserId } : {}),
        boardingPointId: boardingPoint.id,
        passengerName: input.passenger.name,
        passengerPhone: input.passenger.phone,
        passengerEmail: input.passenger.email || null,
        status: "HELD",
        totalAmount: hold.items.reduce(
          (sum, i) => sum + i.scheduleSeat.price,
          0,
        ),
        seats: {
          create: hold.items.map((i) => ({
            scheduleSeatId: i.scheduleSeatId,
            price: i.scheduleSeat.price,
          })),
        },
      },
      include: {
        seats: { include: { scheduleSeat: true } },
      },
    });
  });

  return toBookingDto(booking, {
    holdId: booking.holdId,
    holdExpiresAt: paymentExpiresAt.toISOString(),
  });
}

function toBookingDto(
  booking: {
    id: string;
    status: string;
    scheduleId: string;
    passengerName: string;
    passengerPhone: string;
    totalAmount: number;
    createdAt: Date;
    holdId: string | null;
    seats: { scheduleSeat: { label: string } }[];
  },
  holdMeta?: { holdId: string | null; holdExpiresAt: string | null },
) {
  return {
    id: booking.id,
    status: booking.status,
    scheduleId: booking.scheduleId,
    passengerName: booking.passengerName,
    passengerPhone: booking.passengerPhone,
    totalAmount: booking.totalAmount,
    seatLabels: booking.seats.map((s) => s.scheduleSeat.label),
    createdAt: booking.createdAt.toISOString(),
    holdId: holdMeta?.holdId ?? booking.holdId ?? null,
    holdExpiresAt: holdMeta?.holdExpiresAt ?? null,
  };
}

export async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      seats: { include: { scheduleSeat: true } },
      hold: true,
    },
  });
  if (!booking) throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Not found", 404);
  return toBookingDto(
    booking,
    booking.holdId
      ? {
          holdId: booking.holdId,
          holdExpiresAt: booking.hold?.expiresAt.toISOString() ?? null,
        }
      : undefined,
  );
}
