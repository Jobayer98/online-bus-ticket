import { Router } from "express";
import { prisma } from "@repo/database";
import { successResponse } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

export const adminReportsRouter = Router();
adminReportsRouter.use(authenticateRequired, requireRole("ADMIN"));

adminReportsRouter.get("/sales", async (req, res, next) => {
  try {
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: from, lte: to },
      },
      include: {
        schedule: { include: { route: true } },
        payment: true,
      },
    });

    const online = bookings.filter((b) => b.channel === "ONLINE");
    const counter = bookings.filter((b) => b.channel === "COUNTER");

    res.json(
      successResponse({
        from: from.toISOString(),
        to: to.toISOString(),
        totalRevenue: bookings.reduce((s, b) => s + b.totalAmount, 0),
        ticketCount: bookings.length,
        online: {
          count: online.length,
          revenue: online.reduce((s, b) => s + b.totalAmount, 0),
        },
        counter: {
          count: counter.length,
          revenue: counter.reduce((s, b) => s + b.totalAmount, 0),
        },
        byRoute: Object.entries(
          bookings.reduce<Record<string, { count: number; revenue: number }>>(
            (acc, b) => {
              const slug = b.schedule.route.slug;
              if (!acc[slug]) acc[slug] = { count: 0, revenue: 0 };
              acc[slug].count++;
              acc[slug].revenue += b.totalAmount;
              return acc;
            },
            {},
          ),
        ).map(([routeSlug, stats]) => ({ routeSlug, ...stats })),
      }),
    );
  } catch (e) {
    next(e);
  }
});

adminReportsRouter.get("/analytics/overview", async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const [paidBookings, totalSchedules, soldSeats] = await Promise.all([
      prisma.booking.findMany({
        where: { status: "PAID", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.schedule.count({ where: { status: "SCHEDULED" } }),
      prisma.scheduleSeat.count({ where: { status: "SOLD" } }),
    ]);
    const revenue = paidBookings.reduce((s, b) => s + b.totalAmount, 0);
    res.json(
      successResponse({
        revenue30d: revenue,
        tickets30d: paidBookings.length,
        activeSchedules: totalSchedules,
        soldSeats,
        avgTicketValue: paidBookings.length
          ? Math.round(revenue / paidBookings.length)
          : 0,
      }),
    );
  } catch (e) {
    next(e);
  }
});

adminReportsRouter.get("/export/csv", async (req, res, next) => {
  try {
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const bookings = await prisma.booking.findMany({
      where: { status: "PAID", createdAt: { gte: from, lte: to } },
      include: { schedule: { include: { route: true } } },
    });
    const header = "id,route,amount,channel,createdAt\n";
    const rows = bookings
      .map(
        (b) =>
          `${b.id},${b.schedule.route.slug},${b.totalAmount},${b.channel},${b.createdAt.toISOString()}`,
      )
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sales.csv");
    res.send(header + rows);
  } catch (e) {
    next(e);
  }
});
