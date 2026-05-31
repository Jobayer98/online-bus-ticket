import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  getTimePeriod,
  SeatClass,
  type SearchSchedulesQuery,
  type ScheduleCardDto,
} from "@repo/shared";

const SEAT_CLASS_ORDER = [
  SeatClass.STANDARD,
  SeatClass.PREMIUM,
  SeatClass.BUSINESS,
] as const;

function uniqueSeatClasses(seats: { seatClass: string }[]): string[] {
  const seen = new Set<string>();
  for (const seat of seats) seen.add(seat.seatClass);
  return SEAT_CLASS_ORDER.filter((sc) => seen.has(sc));
}

export async function searchSchedules(
  query: SearchSchedulesQuery,
): Promise<ScheduleCardDto[]> {
  const [fromStop, toStop] = await Promise.all([
    prisma.stop.findUnique({ where: { id: query.fromStopId } }),
    prisma.stop.findUnique({ where: { id: query.toStopId } }),
  ]);
  if (!fromStop || !toStop) {
    throw new AppError(ErrorCode.NOT_FOUND, "Stop not found", 404);
  }

  const route = await prisma.route.findFirst({
    where: {
      fromStop: { city: { equals: fromStop.city, mode: "insensitive" } },
      toStop: { city: { equals: toStop.city, mode: "insensitive" } },
    },
    include: { fromStop: true, toStop: true },
  });
  if (!route) {
    throw new AppError(ErrorCode.ROUTE_NOT_FOUND, "Route not found", 404);
  }

  const dayStart = new Date(`${query.date}T00:00:00.000Z`);
  const dayEnd = new Date(`${query.date}T23:59:59.999Z`);

  const schedules = await prisma.schedule.findMany({
    where: {
      routeId: route.id,
      status: "SCHEDULED",
      departureAt: { gte: dayStart, lte: dayEnd },
      ...(query.busType ? { coach: { busType: query.busType } } : {}),
    },
    include: {
      coach: true,
      scheduleSeats: true,
    },
    orderBy: { departureAt: "asc" },
  });

  return schedules
    .filter((s) => {
      if (query.timePeriod && getTimePeriod(s.departureAt) !== query.timePeriod) {
        return false;
      }
      if (query.seatClass) {
        const hasClass = s.scheduleSeats.some(
          (seat) =>
            seat.seatClass === query.seatClass && seat.status === "AVAILABLE",
        );
        if (!hasClass) return false;
      }
      return true;
    })
    .map((s) => {
      const available = s.scheduleSeats.filter((x) => x.status === "AVAILABLE");
      const fares = available.map((x) => x.price);
      return {
        scheduleId: s.id,
        coachNumber: s.coach.coachNumber,
        startPoint: route.fromStop.name,
        departureAt: s.departureAt.toISOString(),
        endPoint: route.toStop.name,
        estimatedArrivalAt: s.estimatedArrivalAt.toISOString(),
        busType: s.coach.busType,
        seatClasses: uniqueSeatClasses(s.scheduleSeats),
        fareFrom: fares.length ? Math.min(...fares) : s.baseFare,
        availableSeats: available.length,
        routeSlug: route.slug,
      };
    });
}

export async function getSeatMap(scheduleId: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      coach: { include: { seatLayout: { include: { templates: true } } } },
      scheduleSeats: true,
      route: { include: { boardingPoints: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  if (!schedule) throw new AppError(ErrorCode.NOT_FOUND, "Schedule not found", 404);
  if (schedule.status === "CANCELLED") {
    throw new AppError(ErrorCode.CONFLICT, "Schedule cancelled", 409);
  }

  const layout = schedule.coach.seatLayout;
  const seatByLabel = new Map(
    schedule.scheduleSeats.map((ss) => [ss.label, ss]),
  );
  const classMultiplier: Record<string, number> = {
    STANDARD: 1,
    PREMIUM: 1.3,
    BUSINESS: 1.6,
  };

  const priceForClass = (seatClass: string) =>
    Math.round(schedule.baseFare * (classMultiplier[seatClass] ?? 1));

  let seats: {
    label: string;
    row: number;
    col: number;
    seatClass: string;
    status: "AVAILABLE" | "HELD" | "SOLD";
    price: number;
  }[];

  if (layout?.templates.length) {
    seats = layout.templates.map((tmpl) => {
      const ss = seatByLabel.get(tmpl.label);
      return {
        label: tmpl.label,
        row: tmpl.row,
        col: tmpl.col,
        seatClass: ss?.seatClass ?? tmpl.seatClass,
        status: (ss?.status ?? "SOLD") as "AVAILABLE" | "HELD" | "SOLD",
        price: ss?.price ?? priceForClass(tmpl.seatClass),
      };
    });
    for (const ss of schedule.scheduleSeats) {
      if (!seats.some((s) => s.label === ss.label)) {
        const tmpl = layout.templates.find((t) => t.label === ss.label);
        seats.push({
          label: ss.label,
          row: tmpl?.row ?? 0,
          col: tmpl?.col ?? 0,
          seatClass: ss.seatClass,
          status: ss.status as "AVAILABLE" | "HELD" | "SOLD",
          price: ss.price,
        });
      }
    }
  } else {
    seats = schedule.scheduleSeats.map((ss) => ({
      label: ss.label,
      row: 0,
      col: 0,
      seatClass: ss.seatClass,
      status: ss.status as "AVAILABLE" | "HELD" | "SOLD",
      price: ss.price,
    }));
  }

  return {
    scheduleId,
    rows: layout?.rows ?? 0,
    cols: layout?.cols ?? 0,
    seats,
    boardingPoints: schedule.route.boardingPoints.map((bp) => ({
      id: bp.id,
      name: bp.name,
      sortOrder: bp.sortOrder,
    })),
  };
}

export async function getRouteBySlug(slug: string) {
  return prisma.route.findUnique({
    where: { slug },
    include: { fromStop: true, toStop: true },
  });
}
