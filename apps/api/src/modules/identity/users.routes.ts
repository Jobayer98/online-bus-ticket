import { Router } from "express";
import { prisma } from "@repo/database";
import { AppError, ErrorCode, successResponse } from "@repo/shared";
import { authenticateRequired } from "../../middleware/auth.js";

export const usersRouter = Router();

usersRouter.get("/me", authenticateRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, phone: true, email: true, name: true, role: true },
    });
    if (!user) throw new AppError(ErrorCode.NOT_FOUND, "User not found", 404);
    res.json(successResponse(user));
  } catch (e) {
    next(e);
  }
});

usersRouter.get("/me/bookings", authenticateRequired, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          schedule: { include: { route: true, coach: true } },
          seats: { include: { scheduleSeat: true } },
        },
      }),
      prisma.booking.count({ where: { userId: req.userId! } }),
    ]);
    const data = bookings.map((b) => ({
      id: b.id,
      status: b.status,
      totalAmount: b.totalAmount,
      createdAt: b.createdAt.toISOString(),
      routeSlug: b.schedule.route.slug,
      departureAt: b.schedule.departureAt.toISOString(),
      seatLabels: b.seats.map((s) => s.scheduleSeat.label),
    }));
    res.json({ data, meta: { page, pageSize, total } });
  } catch (e) {
    next(e);
  }
});
