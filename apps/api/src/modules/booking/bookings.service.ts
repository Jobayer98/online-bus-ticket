import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  SEAT_HOLD_PAYMENT_TTL_MS,
  SEAT_HOLD_SELECTION_TTL_MS,
  type CreateBookingInput,
  type CreateHoldInput,
} from "@repo/shared";
import {
  bookingAccessSigningSecret,
  createBookingAccessToken,
  isBookingAccessGranted,
} from "../../lib/booking-access-token.js";
import type { DbClient } from "../../lib/db-client.js";

export async function createHoldWithClient(
  db: DbClient,
  input: CreateHoldInput,
) {
  const schedule = await db.schedule.findUnique({
    where: { id: input.scheduleId },
    select: { id: true, status: true },
  });
  if (!schedule || schedule.status !== "SCHEDULED") {
    throw new AppError(ErrorCode.NOT_FOUND, "Schedule not available", 404);
  }

  const expiresAt = new Date(Date.now() + SEAT_HOLD_SELECTION_TTL_MS);
  const seats = await db.scheduleSeat.findMany({
    where: {
      scheduleId: input.scheduleId,
      label: { in: input.seatLabels },
    },
  });
  if (seats.length !== input.seatLabels.length) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Invalid seat labels", 400);
  }

  const seatIds = seats.map((s) => s.id);
  const locked = await db.scheduleSeat.updateMany({
    where: {
      id: { in: seatIds },
      scheduleId: input.scheduleId,
      status: "AVAILABLE",
    },
    data: { status: "HELD" },
  });
  if (locked.count !== seatIds.length) {
    throw new AppError(ErrorCode.SEAT_NOT_AVAILABLE, "Seat not available", 409);
  }

  const hold = await db.seatHold.create({
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

  return hold;
}

export async function createHold(input: CreateHoldInput) {
  const hold = await prisma.$transaction(async (tx) =>
    createHoldWithClient(tx, input),
  );

  const seats = hold.items.map((i) => i.scheduleSeat);
  const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);

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

export async function releaseHoldSystem(holdId: string) {
  const hold = await prisma.seatHold.findUnique({
    where: { id: holdId },
    include: { items: true, booking: true },
  });
  if (!hold) return;
  if (hold.booking?.status === "PAID") return;
  await releaseHoldInternal(hold);
}

export type ReleaseHoldAuth = {
  sessionId?: string;
  accessToken?: string;
};

function isHoldReleaseAuthorized(
  hold: {
    sessionId: string;
    booking: { id: string } | null;
  },
  auth: ReleaseHoldAuth,
): boolean {
  if (auth.sessionId && auth.sessionId === hold.sessionId) {
    return true;
  }
  if (auth.accessToken && hold.booking) {
    return isBookingAccessGranted(
      bookingAccessSigningSecret(),
      hold.booking.id,
      auth.accessToken,
    );
  }
  return false;
}

export async function releaseHold(holdId: string, auth: ReleaseHoldAuth) {
  const hold = await prisma.seatHold.findUnique({
    where: { id: holdId },
    include: { items: true, booking: true },
  });
  if (!hold) return;
  if (!isHoldReleaseAuthorized(hold, auth)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Not authorized to release hold",
      403,
    );
  }
  if (hold.booking?.status === "PAID") return;
  await releaseHoldInternal(hold);
}

async function releaseHoldInternal(hold: {
  id: string;
  items: { scheduleSeatId: string }[];
  booking: { id: string; status: string; holdId: string | null } | null;
}) {
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
    await tx.seatHold.delete({ where: { id: hold.id } });
  });
}

export async function createBookingWithClient(
  db: DbClient,
  input: CreateBookingInput,
  resolvedUserId?: string,
) {
  const paymentExpiresAt = new Date(Date.now() + SEAT_HOLD_PAYMENT_TTL_MS);

  const hold = await db.seatHold.findUnique({
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
  if (input.sessionId !== hold.sessionId) {
    throw new AppError(ErrorCode.FORBIDDEN, "Hold session mismatch", 403);
  }

  const boardingPoint = await db.boardingPoint.findFirst({
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
  const seatsOnSchedule = await db.scheduleSeat.findMany({
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
    const reclaimed = await db.scheduleSeat.updateMany({
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
    await db.payment.deleteMany({ where: { bookingId: cancelledId } });
    await db.bookingSeat.deleteMany({ where: { bookingId: cancelledId } });
    await db.ticket.deleteMany({ where: { bookingId: cancelledId } });
    await db.counterTransaction.deleteMany({
      where: { bookingId: cancelledId },
    });
    await db.booking.delete({ where: { id: cancelledId } });
  }

  await db.seatHold.update({
    where: { id: hold.id },
    data: { expiresAt: paymentExpiresAt },
  });

  const booking = await db.booking.create({
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

  return { booking, paymentExpiresAt };
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

  const { booking, paymentExpiresAt } = await prisma.$transaction(async (tx) =>
    createBookingWithClient(tx, input, resolvedUserId),
  );

  return {
    ...toBookingDto(booking, {
      holdId: booking.holdId,
      holdExpiresAt: paymentExpiresAt.toISOString(),
    }),
    bookingAccessToken: createBookingAccessToken(bookingAccessSigningSecret(), {
      bookingId: booking.id,
      exp: paymentExpiresAt.getTime(),
    }),
  };
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

export async function getBooking(
  id: string,
  access?: { userId?: string; accessToken?: string },
) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      seats: { include: { scheduleSeat: true } },
      hold: true,
    },
  });
  if (!booking) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Not found", 404);
  }

  const isOwner = Boolean(access?.userId && booking.userId === access.userId);
  const hasToken = isBookingAccessGranted(
    bookingAccessSigningSecret(),
    id,
    access?.accessToken,
  );

  if (!isOwner && !hasToken) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Not found", 404);
  }

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
