import { Router } from "express";
import { prisma } from "@repo/database";
import {
  createScheduleSchema,
  rescheduleSchema,
  successResponse,
  AppError,
  ErrorCode,
  priceForScheduleSeat,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { requireSchedulePlanLimit } from "../../middleware/plan-limits.middleware.js";

async function initScheduleSeats(
  scheduleId: string,
  coachId: string,
  baseFare: number,
) {
  const coach = await prisma.coach.findUnique({
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
  await prisma.scheduleSeat.createMany({
    data: coach.seatLayout.templates.map((t) => ({
      scheduleId,
      label: t.label,
      seatClass: t.seatClass,
      status: "AVAILABLE",
      price: priceForScheduleSeat(baseFare),
    })),
  });
}

export const adminSchedulesRouter = Router();
adminSchedulesRouter.use(authenticateRequired);

adminSchedulesRouter.get(
  "/",
  requireRole("ADMIN", "COUNTER_SELLER"),
  async (req, res, next) => {
    try {
      const schedules = await prisma.schedule.findMany({
        where: { tenantId: req.tenant?.id },
        include: { route: true, coach: true },
        orderBy: { departureAt: "asc" },
      });
      res.json(successResponse(schedules));
    } catch (e) {
      next(e);
    }
  },
);

adminSchedulesRouter.post(
  "/",
  requireRole("ADMIN"),
  requireSchedulePlanLimit,
  async (req, res, next) => {
    try {
      const input = createScheduleSchema.parse(req.body);
      const schedule = await prisma.schedule.create({
        data: {
          routeId: input.routeId,
          coachId: input.coachId,
          departureAt: new Date(input.departureAt),
          estimatedArrivalAt: new Date(input.estimatedArrivalAt),
          baseFare: input.baseFare,
          tenantId: req.tenant?.id,
        },
      });
      await initScheduleSeats(schedule.id, schedule.coachId, schedule.baseFare);
      res.status(201).json(successResponse(schedule));
    } catch (e) {
      next(e);
    }
  },
);

adminSchedulesRouter.patch(
  "/:id/reschedule",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const input = rescheduleSchema.parse(req.body);
      const existing = await prisma.schedule.findFirst({
        where: { id: String(req.params.id), tenantId: req.tenant?.id },
      });
      if (!existing)
        throw new AppError(ErrorCode.NOT_FOUND, "Schedule not found", 404);
      const [schedule] = await prisma.$transaction([
        prisma.schedule.update({
          where: { id: String(req.params.id) },
          data: {
            departureAt: new Date(input.departureAt),
            estimatedArrivalAt: new Date(input.estimatedArrivalAt),
          },
        }),
        prisma.rescheduleLog.create({
          data: {
            scheduleId: String(req.params.id),
            previousDeparture: existing.departureAt,
            newDeparture: new Date(input.departureAt),
            reason: input.reason,
          },
        }),
      ]);
      res.json(successResponse(schedule));
    } catch (e) {
      next(e);
    }
  },
);

adminSchedulesRouter.patch(
  "/:id/cancel",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const existing = await prisma.schedule.findFirst({
        where: { id: String(req.params.id), tenantId: req.tenant?.id },
      });
      if (!existing)
        throw new AppError(ErrorCode.NOT_FOUND, "Schedule not found", 404);
      const schedule = await prisma.schedule.update({
        where: { id: String(req.params.id) },
        data: { status: "CANCELLED" },
      });
      res.json(successResponse(schedule));
    } catch (e) {
      next(e);
    }
  },
);
