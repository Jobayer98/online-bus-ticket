import { Router } from "express";
import { prisma } from "@repo/database";
import { createLayoutSchema, successResponse } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

export const adminLayoutsRouter = Router();
adminLayoutsRouter.use(authenticateRequired, requireRole("ADMIN"));

adminLayoutsRouter.get("/", async (req, res, next) => {
  try {
    const layouts = await prisma.seatLayout.findMany({
      where: { tenantId: req.tenant?.id },
      include: { templates: true },
    });
    res.json(successResponse(layouts));
  } catch (e) {
    next(e);
  }
});

adminLayoutsRouter.post("/", async (req, res, next) => {
  try {
    const input = createLayoutSchema.parse(req.body);
    const layout = await prisma.seatLayout.create({
      data: {
        name: input.name,
        rows: input.rows,
        cols: input.cols,
        tenantId: req.tenant?.id,
        templates: { create: input.templates },
      },
      include: { templates: true },
    });
    res.status(201).json(successResponse(layout));
  } catch (e) {
    next(e);
  }
});
