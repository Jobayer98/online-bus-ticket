import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  emptySearchFacets,
  getTimePeriod,
  priceForScheduleSeat,
  SeatClass,
  buildScheduleDepartureWhere,
  type SearchSchedulesFacets,
  type SearchSchedulesQuery,
  type ScheduleCardDto,
} from "@repo/shared";
import type { Prisma } from "@repo/database";

const SEAT_CLASS_ORDER = [
  SeatClass.STANDARD,
  SeatClass.PREMIUM,
  SeatClass.BUSINESS,
] as const;

type SeatAggRow = {
  scheduleId: string;
  seatClass: string;
  _count: { _all: number };
  _min: { price: number | null };
};

type SeatClassAggRow = {
  scheduleId: string;
  seatClass: string;
};

export type SearchSchedulesResult = {
  schedules: ScheduleCardDto[];
  facets: SearchSchedulesFacets;
};

function uniqueSeatClasses(
  seatClasses: Iterable<string>,
): Array<(typeof SEAT_CLASS_ORDER)[number]> {
  const seen = new Set(seatClasses);
  return SEAT_CLASS_ORDER.filter((sc) => seen.has(sc));
}

function buildBaseWhere(
  routeId: string,
  query: SearchSchedulesQuery,
): Prisma.ScheduleWhereInput {
  const departureWhere = buildScheduleDepartureWhere(
    query.date,
    query.timePeriod,
  );

  return {
    routeId,
    status: "SCHEDULED",
    ...(departureWhere as Prisma.ScheduleWhereInput),
    ...(query.busType ? { coach: { busType: query.busType } } : {}),
    ...(query.seatClass
      ? {
          scheduleSeats: {
            some: {
              seatClass: query.seatClass,
              status: "AVAILABLE",
            },
          },
        }
      : {}),
  };
}

function buildFacetWhere(
  routeId: string,
  query: SearchSchedulesQuery,
): Prisma.ScheduleWhereInput {
  const departureWhere = buildScheduleDepartureWhere(query.date);

  return {
    routeId,
    status: "SCHEDULED",
    ...(departureWhere as Prisma.ScheduleWhereInput),
    ...(query.busType ? { coach: { busType: query.busType } } : {}),
  };
}

function buildScheduleCard(
  schedule: {
    id: string;
    departureAt: Date;
    estimatedArrivalAt: Date;
    baseFare: number;
    coach: { coachNumber: string; busType: string };
  },
  route: {
    slug: string;
    fromStop: { name: string };
    toStop: { name: string };
  },
  availableBySchedule: Map<
    string,
    { count: number; minPrice: number | null; classes: Set<string> }
  >,
  layoutClassesBySchedule: Map<string, Set<string>>,
): ScheduleCardDto {
  const available = availableBySchedule.get(schedule.id);
  const layoutClasses =
    layoutClassesBySchedule.get(schedule.id) ?? new Set<string>();
  const seatClasses = uniqueSeatClasses([
    ...layoutClasses,
    ...(available ? [...available.classes] : []),
  ]);

  return {
    scheduleId: schedule.id,
    coachNumber: schedule.coach.coachNumber,
    startPoint: route.fromStop.name,
    departureAt: schedule.departureAt.toISOString(),
    endPoint: route.toStop.name,
    estimatedArrivalAt: schedule.estimatedArrivalAt.toISOString(),
    busType: schedule.coach.busType as ScheduleCardDto["busType"],
    seatClasses,
    fareFrom: available?.minPrice ?? schedule.baseFare,
    availableSeats: available?.count ?? 0,
    routeSlug: route.slug,
  };
}

function indexAvailableSeats(rows: SeatAggRow[]) {
  const availableBySchedule = new Map<
    string,
    { count: number; minPrice: number | null; classes: Set<string> }
  >();

  for (const row of rows) {
    const existing = availableBySchedule.get(row.scheduleId) ?? {
      count: 0,
      minPrice: null,
      classes: new Set<string>(),
    };
    existing.count += row._count._all;
    existing.classes.add(row.seatClass);
    if (row._min.price != null) {
      existing.minPrice =
        existing.minPrice == null
          ? row._min.price
          : Math.min(existing.minPrice, row._min.price);
    }
    availableBySchedule.set(row.scheduleId, existing);
  }

  return availableBySchedule;
}

function indexLayoutClasses(rows: SeatClassAggRow[]) {
  const layoutClassesBySchedule = new Map<string, Set<string>>();
  for (const row of rows) {
    const classes =
      layoutClassesBySchedule.get(row.scheduleId) ?? new Set<string>();
    classes.add(row.seatClass);
    layoutClassesBySchedule.set(row.scheduleId, classes);
  }
  return layoutClassesBySchedule;
}

function computeFacets(
  facetSchedules: { id: string; departureAt: Date }[],
  availableRows: SeatAggRow[],
): SearchSchedulesFacets {
  const facets = emptySearchFacets();
  facets.total = facetSchedules.length;

  for (const schedule of facetSchedules) {
    const period = getTimePeriod(schedule.departureAt);
    facets.timePeriod[period] += 1;
  }

  const seenByClass: Record<(typeof SEAT_CLASS_ORDER)[number], Set<string>> = {
    STANDARD: new Set(),
    PREMIUM: new Set(),
    BUSINESS: new Set(),
  };

  for (const row of availableRows) {
    if (row.seatClass in seenByClass) {
      seenByClass[row.seatClass as (typeof SEAT_CLASS_ORDER)[number]].add(
        row.scheduleId,
      );
    }
  }

  for (const seatClass of SEAT_CLASS_ORDER) {
    facets.seatClass[seatClass] = seenByClass[seatClass].size;
  }

  return facets;
}

export async function searchSchedules(
  query: SearchSchedulesQuery,
  tenantId?: string,
): Promise<SearchSchedulesResult> {
  const [fromStop, toStop] = await Promise.all([
    prisma.stop.findFirst({ where: { id: query.fromStopId, tenantId } }),
    prisma.stop.findFirst({ where: { id: query.toStopId, tenantId } }),
  ]);
  if (!fromStop || !toStop) {
    throw new AppError(ErrorCode.NOT_FOUND, "Stop not found", 404);
  }

  const route = await prisma.route.findFirst({
    where: {
      tenantId,
      fromStop: { city: { equals: fromStop.city, mode: "insensitive" } },
      toStop: { city: { equals: toStop.city, mode: "insensitive" } },
    },
    include: { fromStop: true, toStop: true },
  });
  if (!route) {
    throw new AppError(ErrorCode.ROUTE_NOT_FOUND, "Route not found", 404);
  }

  const facetWhere = buildFacetWhere(route.id, query);
  const resultWhere = buildBaseWhere(route.id, query);

  const [facetSchedules, resultSchedules] = await Promise.all([
    prisma.schedule.findMany({
      where: facetWhere,
      select: { id: true, departureAt: true },
      orderBy: { departureAt: "asc" },
    }),
    prisma.schedule.findMany({
      where: resultWhere,
      include: { coach: true },
      orderBy: { departureAt: "asc" },
    }),
  ]);

  if (facetSchedules.length === 0) {
    return { schedules: [], facets: emptySearchFacets() };
  }

  const facetScheduleIds = facetSchedules.map((s) => s.id);
  const resultScheduleIds = new Set(resultSchedules.map((s) => s.id));

  const [availableRows, layoutClassRows] = await Promise.all([
    prisma.scheduleSeat.groupBy({
      by: ["scheduleId", "seatClass"],
      where: {
        scheduleId: { in: facetScheduleIds },
        status: "AVAILABLE",
      },
      _count: { _all: true },
      _min: { price: true },
    }),
    prisma.scheduleSeat.groupBy({
      by: ["scheduleId", "seatClass"],
      where: { scheduleId: { in: [...resultScheduleIds] } },
    }),
  ]);

  const availableBySchedule = indexAvailableSeats(availableRows as SeatAggRow[]);
  const layoutClassesBySchedule = indexLayoutClasses(
    layoutClassRows as SeatClassAggRow[],
  );
  const facets = computeFacets(facetSchedules, availableRows as SeatAggRow[]);

  const schedules = resultSchedules.map((schedule) =>
    buildScheduleCard(
      schedule,
      route,
      availableBySchedule,
      layoutClassesBySchedule,
    ),
  );

  return { schedules, facets };
}

export async function getSeatMap(scheduleId: string, tenantId?: string) {
  const schedule = await prisma.schedule.findFirst({
    where: { id: scheduleId, tenantId },
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
  const defaultSeatPrice = priceForScheduleSeat(schedule.baseFare);

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
        price: ss?.price ?? defaultSeatPrice,
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

export async function getRouteBySlug(slug: string, tenantId?: string) {
  return prisma.route.findFirst({
    where: { slug, tenantId },
    include: { fromStop: true, toStop: true },
  });
}
