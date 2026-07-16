import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeatClass, TimePeriod } from "@repo/shared";
import { prismaMock } from "../../test/mocks/database.js";
import { searchSchedules } from "./schedules.service.js";

describe("searchSchedules (E14-18/E14-20)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.stop.findUnique
      .mockResolvedValueOnce({ id: "from", city: "Dhaka" })
      .mockResolvedValueOnce({ id: "to", city: "Pabna" });
    prismaMock.route.findFirst.mockResolvedValue({
      id: "route-1",
      slug: "dhaka-pabna",
      fromStop: { name: "Gabtoli" },
      toStop: { name: "Pabna" },
    });
    prismaMock.schedule.findMany.mockResolvedValue([]);
    prismaMock.scheduleSeat.groupBy.mockResolvedValue([]);
  });

  it("uses Dhaka day bounds when querying facet schedules", async () => {
    await searchSchedules({
      fromStopId: "from",
      toStopId: "to",
      date: "2026-05-31",
    });

    const facetCall = prismaMock.schedule.findMany.mock.calls[0]?.[0];
    expect(facetCall?.where).toMatchObject({
      departureAt: {
        gte: new Date("2026-05-30T18:00:00.000Z"),
        lte: new Date("2026-05-31T17:59:59.999Z"),
      },
    });
  });

  it("filters seatClass in SQL via scheduleSeats.some", async () => {
    prismaMock.schedule.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await searchSchedules({
      fromStopId: "from",
      toStopId: "to",
      date: "2026-05-31",
      seatClass: SeatClass.BUSINESS,
    });

    const resultCall = prismaMock.schedule.findMany.mock.calls[1]?.[0];
    expect(resultCall?.where).toMatchObject({
      scheduleSeats: {
        some: { seatClass: SeatClass.BUSINESS },
      },
    });
  });

  it("filters timePeriod in SQL on the results query", async () => {
    prismaMock.schedule.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await searchSchedules({
      fromStopId: "from",
      toStopId: "to",
      date: "2026-05-31",
      timePeriod: TimePeriod.MORNING,
    });

    const resultCall = prismaMock.schedule.findMany.mock.calls[1]?.[0];
    expect(resultCall?.where).toMatchObject({
      departureAt: {
        gte: new Date("2026-05-31T05:00:00.000+06:00"),
        lte: new Date("2026-05-31T10:59:59.999+06:00"),
      },
    });
  });

  it("aggregates seat counts via groupBy instead of loading all seats", async () => {
    prismaMock.schedule.findMany
      .mockResolvedValueOnce([{ id: "s1", departureAt: new Date() }])
      .mockResolvedValueOnce([
        {
          id: "s1",
          departureAt: new Date("2026-05-31T04:30:00.000Z"),
          estimatedArrivalAt: new Date("2026-05-31T10:00:00.000Z"),
          baseFare: 85000,
          coach: { coachNumber: "DH-1", busType: "AC" },
        },
      ]);
    prismaMock.scheduleSeat.groupBy
      .mockResolvedValueOnce([
        {
          scheduleId: "s1",
          seatClass: "STANDARD",
          _count: { _all: 2 },
          _min: { price: 85000 },
        },
      ])
      .mockResolvedValueOnce([{ scheduleId: "s1", seatClass: "STANDARD" }]);

    const result = await searchSchedules({
      fromStopId: "from",
      toStopId: "to",
      date: "2026-05-31",
    });

    expect(prismaMock.scheduleSeat.groupBy).toHaveBeenCalled();
    expect(result.schedules[0]?.availableSeats).toBe(2);
    expect(result.facets.total).toBe(1);
  });
});
