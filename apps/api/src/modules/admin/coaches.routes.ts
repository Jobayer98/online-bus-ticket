import { Router } from "express";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  coachIdParamsSchema,
  createCoachSchema,
  importCoachesSchema,
  importResultDtoSchema,
  successResponse,
  updateCoachSchema,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { importCoaches } from "./coaches-import.service.js";

export const adminCoachesRouter = Router();
adminCoachesRouter.use(authenticateRequired, requireRole("ADMIN", "COUNTER_SELLER"));

export const coachInclude = {
  seatLayout: { include: { templates: { select: { seatClass: true } } } },
} as const;

adminCoachesRouter.get("/", async (req, res, next) => {
  try {
    const coaches = await prisma.coach.findMany({
      where: { tenantId: req.tenant?.id },
      include: coachInclude,
      orderBy: { coachNumber: "asc" },
    });
    res.json(successResponse(coaches));
  } catch (e) {
    next(e);
  }
});

adminCoachesRouter.post(
  "/import",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const input = importCoachesSchema.parse(req.body);
      const result = await importCoaches(input, req.tenant?.id);
      res.json(successResponse(importResultDtoSchema.parse(result)));
    } catch (e) {
      next(e);
    }
  },
);

adminCoachesRouter.post("/", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = createCoachSchema.parse(req.body);
    const coach = await prisma.coach.create({
      data: {
        coachNumber: input.coachNumber,
        busType: input.busType,
        seatLayoutId: input.seatLayoutId ?? null,
        tenantId: req.tenant?.id,
      },
      include: coachInclude,
    });
    res.status(201).json(successResponse(coach));
  } catch (e) {
    next(e);
  }
});

adminCoachesRouter.patch("/:id", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = coachIdParamsSchema.parse(req.params);
    const input = updateCoachSchema.parse(req.body);
    const coach = await prisma.coach.update({
      where: { id, tenantId: req.tenant?.id },
      data: {
        ...(input.coachNumber !== undefined && { coachNumber: input.coachNumber }),
        ...(input.busType !== undefined && { busType: input.busType }),
        ...(input.seatLayoutId !== undefined && {
          seatLayoutId: input.seatLayoutId,
        }),
      },
      include: coachInclude,
    });
    res.json(successResponse(coach));
  } catch (e) {
    next(e);
  }
});

adminCoachesRouter.delete("/:id", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id } = coachIdParamsSchema.parse(req.params);
    const scheduleCount = await prisma.schedule.count({
      where: { coachId: id, tenantId: req.tenant?.id },
    });
    if (scheduleCount > 0) {
      throw new AppError(
        ErrorCode.CONFLICT,
        "Cannot delete coach with existing schedules",
        409,
      );
    }
    await prisma.coach.delete({ where: { id, tenantId: req.tenant?.id } });
    res.json(successResponse({ deleted: true }));
  } catch (e) {
    next(e);
  }
});
