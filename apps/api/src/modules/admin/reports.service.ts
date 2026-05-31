import { prisma } from "@repo/database";
import {
  parseReportDateRange,
  subtractDaysFromDateStr,
  type AnalyticsOverviewDto,
  type SalesReportDto,
} from "@repo/shared";

type PaidBookingRow = Awaited<
  ReturnType<typeof fetchPaidBookingsInRange>
>[number];

async function fetchPaidBookingsInRange(from: Date, to: Date) {
  return prisma.booking.findMany({
    where: {
      status: "PAID",
      createdAt: { gte: from, lte: to },
    },
    include: {
      schedule: { include: { route: true } },
    },
  });
}

async function fetchRefundsInRange(from: Date, to: Date) {
  return prisma.counterTransaction.findMany({
    where: {
      type: "REFUND",
      createdAt: { gte: from, lte: to },
    },
    include: {
      booking: { include: { schedule: { include: { route: true } } } },
    },
  });
}

function buildChannelBreakdown(bookings: PaidBookingRow[]) {
  const online = bookings.filter((b) => b.channel === "ONLINE");
  const counter = bookings.filter((b) => b.channel === "COUNTER");
  return {
    online: {
      count: online.length,
      grossRevenue: online.reduce((s, b) => s + b.totalAmount, 0),
    },
    counter: {
      count: counter.length,
      grossRevenue: counter.reduce((s, b) => s + b.totalAmount, 0),
    },
  };
}

function buildByRoute(bookings: PaidBookingRow[]) {
  return Object.entries(
    bookings.reduce<Record<string, { count: number; grossRevenue: number }>>(
      (acc, b) => {
        const slug = b.schedule.route.slug;
        if (!acc[slug]) acc[slug] = { count: 0, grossRevenue: 0 };
        acc[slug].count++;
        acc[slug].grossRevenue += b.totalAmount;
        return acc;
      },
      {},
    ),
  ).map(([routeSlug, stats]) => ({ routeSlug, ...stats }));
}

export async function getSalesReport(
  from?: string,
  to?: string,
): Promise<SalesReportDto> {
  const range = parseReportDateRange(from, to);
  const [bookings, refunds] = await Promise.all([
    fetchPaidBookingsInRange(range.from, range.to),
    fetchRefundsInRange(range.from, range.to),
  ]);

  const grossRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const refundTotal = refunds.reduce((s, r) => s + Math.abs(r.amount), 0);
  const channels = buildChannelBreakdown(bookings);

  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    grossRevenue,
    refundTotal,
    netRevenue: grossRevenue - refundTotal,
    ticketCount: bookings.length,
    refundCount: refunds.length,
    online: channels.online,
    counter: channels.counter,
    byRoute: buildByRoute(bookings),
  };
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
  const range = parseReportDateRange(undefined, undefined);
  const thirtyDayRange = parseReportDateRange(
    subtractDaysFromDateStr(range.toDate, 30),
    range.toDate,
  );

  const [paidBookings, refunds, seatsSold30d, upcomingSchedules] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          status: "PAID",
          createdAt: { gte: thirtyDayRange.from, lte: thirtyDayRange.to },
        },
      }),
      prisma.counterTransaction.findMany({
        where: {
          type: "REFUND",
          createdAt: { gte: thirtyDayRange.from, lte: thirtyDayRange.to },
        },
      }),
      prisma.bookingSeat.count({
        where: {
          booking: {
            status: { in: ["PAID", "REFUNDED"] },
            createdAt: { gte: thirtyDayRange.from, lte: thirtyDayRange.to },
          },
        },
      }),
      prisma.schedule.count({
        where: { status: "SCHEDULED", departureAt: { gt: new Date() } },
      }),
    ]);

  const grossRevenue30d = paidBookings.reduce((s, b) => s + b.totalAmount, 0);
  const refundTotal30d = refunds.reduce((s, r) => s + Math.abs(r.amount), 0);
  const netRevenue30d = grossRevenue30d - refundTotal30d;

  return {
    grossRevenue30d,
    refundTotal30d,
    netRevenue30d,
    ticketsSold30d: paidBookings.length,
    refundCount30d: refunds.length,
    seatsSold30d,
    upcomingSchedules,
    avgTicketValue: paidBookings.length
      ? Math.round(grossRevenue30d / paidBookings.length)
      : 0,
  };
}

export async function buildSalesExportCsv(
  from?: string,
  to?: string,
): Promise<string> {
  const range = parseReportDateRange(from, to);
  const [bookings, refunds] = await Promise.all([
    fetchPaidBookingsInRange(range.from, range.to),
    fetchRefundsInRange(range.from, range.to),
  ]);

  const header = "type,id,route,amount,channel,createdAt\n";
  const saleRows = bookings
    .map(
      (b) =>
        `SALE,${b.id},${b.schedule.route.slug},${b.totalAmount},${b.channel},${b.createdAt.toISOString()}`,
    )
    .join("\n");
  const refundRows = refunds
    .map(
      (r) =>
        `REFUND,${r.bookingId},${r.booking.schedule.route.slug},${r.amount},${r.booking.channel},${r.createdAt.toISOString()}`,
    )
    .join("\n");

  const rows = [saleRows, refundRows].filter(Boolean).join("\n");
  return header + rows;
}
