import { Router } from "express";
import { prisma } from "@repo/database";
import { createCoachSchema, successResponse } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

export const adminCoachesRouter = Router();
adminCoachesRouter.use(authenticateRequired, requireRole("ADMIN", "COUNTER_SELLER"));

adminCoachesRouter.get("/", async (_req, res, next) => {
  try {
    const coaches = await prisma.coach.findMany({ include: { seatLayout: true } });
    res.json(successResponse(coaches));
  } catch (e) {
    next(e);
  }
});

adminCoachesRouter.post("/", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = createCoachSchema.parse(req.body);
    const coach = await prisma.coach.create({ data: input });
    res.status(201).json(successResponse(coach));
  } catch (e) {
    next(e);
  }
});
