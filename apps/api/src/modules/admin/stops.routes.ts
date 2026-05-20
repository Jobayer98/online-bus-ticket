import { Router } from "express";
import { prisma } from "@repo/database";
import { createStopSchema, updateStopSchema, successResponse } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

export const adminStopsRouter = Router();
adminStopsRouter.use(authenticateRequired, requireRole("ADMIN", "COUNTER_SELLER"));

adminStopsRouter.get("/", async (_req, res, next) => {
  try {
    const stops = await prisma.stop.findMany({ orderBy: { name: "asc" } });
    res.json(successResponse(stops));
  } catch (e) {
    next(e);
  }
});

adminStopsRouter.post("/", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = createStopSchema.parse(req.body);
    const stop = await prisma.stop.create({ data: input });
    res.status(201).json(successResponse(stop));
  } catch (e) {
    next(e);
  }
});

adminStopsRouter.patch("/:id", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = updateStopSchema.parse(req.body);
    const stop = await prisma.stop.update({
      where: { id: String(req.params.id) },
      data: input,
    });
    res.json(successResponse(stop));
  } catch (e) {
    next(e);
  }
});

adminStopsRouter.delete("/:id", requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.stop.delete({ where: { id: String(req.params.id) } });
    res.json(successResponse({ deleted: true }));
  } catch (e) {
    next(e);
  }
});
