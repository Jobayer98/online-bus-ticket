import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";
import { AppError, ErrorCode, priceForScheduleSeat } from "@repo/shared";

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function initScheduleSeats(
  db: DbClient,
  scheduleId: string,
  coachId: string,
  baseFare: number,
) {
  const coach = await db.coach.findUnique({
    where: { id: coachId },
    include: { seatLayout: { include: { templates: true } } },
  });
  if (!coach?.seatLayout) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Coach has no seat layout",
      400,
    );
  }
  await db.scheduleSeat.createMany({
    data: coach.seatLayout.templates.map((t) => ({
      scheduleId,
      label: t.label,
      seatClass: t.seatClass,
      status: "AVAILABLE",
      price: priceForScheduleSeat(baseFare),
    })),
  });
}

export async function createScheduleWithSeats(data: {
  routeId: string;
  coachId: string;
  departureAt: Date;
  estimatedArrivalAt: Date;
  baseFare: number;
  tenantId: string | undefined;
}) {
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.schedule.create({
      data: {
        routeId: data.routeId,
        coachId: data.coachId,
        departureAt: data.departureAt,
        estimatedArrivalAt: data.estimatedArrivalAt,
        baseFare: data.baseFare,
        tenantId: data.tenantId,
      },
    });
    await initScheduleSeats(tx, schedule.id, schedule.coachId, schedule.baseFare);
    return schedule;
  });
}
