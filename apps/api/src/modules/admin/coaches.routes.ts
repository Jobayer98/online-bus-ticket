import { Router } from "express";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  coachIdParamsSchema,
  createCoachSchema,
  successResponse,
  updateCoachSchema,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

export const adminCoachesRouter = Router();
adminCoachesRouter.use(authenticateRequired, requireRole("ADMIN", "COUNTER_SELLER"));

const coachInclude = { seatLayout: true } as const;

adminCoachesRouter.get("/", async (_req, res, next) => {
  try {
    const coaches = await prisma.coach.findMany({
      include: coachInclude,
      orderBy: { coachNumber: "asc" },
    });
    res.json(successResponse(coaches));
  } catch (e) {
    next(e);
  }
});

adminCoachesRouter.post("/", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = createCoachSchema.parse(req.body);
    const coach = await prisma.coach.create({
      data: {
        coachNumber: input.coachNumber,
        busType: input.busType,
        seatLayoutId: input.seatLayoutId ?? null,
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
      where: { id },
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
    const scheduleCount = await prisma.schedule.count({ where: { coachId: id } });
    if (scheduleCount > 0) {
      throw new AppError(
        ErrorCode.CONFLICT,
        "Cannot delete coach with existing schedules",
        409,
      );
    }
    await prisma.coach.delete({ where: { id } });
    res.json(successResponse({ deleted: true }));
  } catch (e) {
    next(e);
  }
});
