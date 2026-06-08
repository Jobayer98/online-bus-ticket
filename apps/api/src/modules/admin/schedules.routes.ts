import { Router } from "express";
import { prisma } from "@repo/database";
import {
  createScheduleSchema,
  importResultDtoSchema,
  importSchedulesSchema,
  rescheduleSchema,
  successResponse,
  AppError,
  ErrorCode,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { requireSchedulePlanLimit } from "../../middleware/plan-limits.middleware.js";
import { coachInclude } from "./coaches.routes.js";
import { createScheduleWithSeats } from "./schedules-admin.service.js";
import { importSchedules } from "./schedules-import.service.js";

export const adminSchedulesRouter = Router();
adminSchedulesRouter.use(authenticateRequired);

adminSchedulesRouter.get(
  "/",
  requireRole("ADMIN", "COUNTER_SELLER"),
  async (req, res, next) => {
    try {
      const schedules = await prisma.schedule.findMany({
        where: { tenantId: req.tenant?.id },
        include: { route: true, coach: { include: coachInclude } },
        orderBy: { departureAt: "asc" },
      });
      res.json(successResponse(schedules));
    } catch (e) {
      next(e);
    }
  },
);

adminSchedulesRouter.post(
  "/import",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const input = importSchedulesSchema.parse(req.body);
      const result = await importSchedules(
        input,
        req.tenant?.id,
        req.tenant?.planTier,
      );
      res.json(successResponse(importResultDtoSchema.parse(result)));
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
      const schedule = await createScheduleWithSeats({
        routeId: input.routeId,
        coachId: input.coachId,
        departureAt: new Date(input.departureAt),
        estimatedArrivalAt: new Date(input.estimatedArrivalAt),
        baseFare: input.baseFare,
        tenantId: req.tenant?.id,
      });
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
