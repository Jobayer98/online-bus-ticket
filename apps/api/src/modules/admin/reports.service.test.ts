import "../../test/mocks/database.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../test/mocks/database.js";
import {
  buildSalesExportCsv,
  getAnalyticsOverview,
  getSalesReport,
} from "./reports.service.js";

describe("getSalesReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes gross, refund total, and net revenue", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      {
        id: "b1",
        totalAmount: 100_000,
        channel: "ONLINE",
        createdAt: new Date("2026-05-15T10:00:00.000Z"),
        schedule: { route: { slug: "dhaka-pabna" } },
      },
      {
        id: "b2",
        totalAmount: 50_000,
        channel: "COUNTER",
        createdAt: new Date("2026-05-16T10:00:00.000Z"),
        schedule: { route: { slug: "dhaka-pabna" } },
      },
    ] as never);
    prismaMock.counterTransaction.findMany.mockResolvedValue([
      {
        id: "r1",
        bookingId: "b2",
        amount: -50_000,
        createdAt: new Date("2026-05-17T10:00:00.000Z"),
        booking: {
          channel: "COUNTER",
          schedule: { route: { slug: "dhaka-pabna" } },
        },
      },
    ] as never);

    const report = await getSalesReport("2026-05-01", "2026-05-31");

    expect(report.grossRevenue).toBe(150_000);
    expect(report.refundTotal).toBe(50_000);
    expect(report.netRevenue).toBe(100_000);
    expect(report.ticketCount).toBe(2);
    expect(report.refundCount).toBe(1);
    expect(report.online.grossRevenue).toBe(100_000);
    expect(report.counter.grossRevenue).toBe(50_000);
  });
});

describe("getAnalyticsOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns scoped 30d KPIs and upcoming schedules", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      { totalAmount: 80_000 },
    ] as never);
    prismaMock.counterTransaction.findMany.mockResolvedValue([
      { amount: -20_000 },
    ] as never);
    prismaMock.bookingSeat.count.mockResolvedValue(3);
    prismaMock.schedule.count.mockResolvedValue(5);

    const overview = await getAnalyticsOverview();

    expect(overview.grossRevenue30d).toBe(80_000);
    expect(overview.refundTotal30d).toBe(20_000);
    expect(overview.netRevenue30d).toBe(60_000);
    expect(overview.ticketsSold30d).toBe(1);
    expect(overview.refundCount30d).toBe(1);
    expect(overview.seatsSold30d).toBe(3);
    expect(overview.upcomingSchedules).toBe(5);
    expect(overview.avgTicketValue).toBe(80_000);
  });
});

describe("buildSalesExportCsv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes SALE and REFUND rows with negative refund amounts", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      {
        id: "b1",
        totalAmount: 85_000,
        channel: "ONLINE",
        createdAt: new Date("2026-05-20T05:00:00.000Z"),
        schedule: { route: { slug: "dhaka-pabna" } },
      },
    ] as never);
    prismaMock.counterTransaction.findMany.mockResolvedValue([
      {
        bookingId: "b2",
        amount: -85_000,
        createdAt: new Date("2026-05-21T05:00:00.000Z"),
        booking: {
          channel: "COUNTER",
          schedule: { route: { slug: "dhaka-pabna" } },
        },
      },
    ] as never);

    const csv = await buildSalesExportCsv("2026-05-01", "2026-05-31");

    expect(csv).toContain("type,id,route,amount,channel,createdAt");
    expect(csv).toContain("SALE,b1,dhaka-pabna,85000,ONLINE");
    expect(csv).toContain("REFUND,b2,dhaka-pabna,-85000,COUNTER");
  });
});
