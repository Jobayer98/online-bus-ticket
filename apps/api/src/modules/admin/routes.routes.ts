import { Router } from "express";
import { prisma } from "@repo/database";
import { createRouteSchema, successResponse, AppError, ErrorCode } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { requireRoutePlanLimit } from "../../middleware/plan-limits.middleware.js";
import { adminRouteBoardingPointsRouter } from "./route-boarding-points.routes.js";

function slugify(from: string, to: string) {
  return `${from}-${to}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const adminRoutesRouter = Router();
adminRoutesRouter.use(authenticateRequired, requireRole("ADMIN", "COUNTER_SELLER"));

adminRoutesRouter.use(
  "/:routeId/boarding-points",
  adminRouteBoardingPointsRouter,
);

adminRoutesRouter.get("/", async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      where: { tenantId: req.tenant?.id },
      include: { fromStop: true, toStop: true },
    });
    res.json(successResponse(routes));
  } catch (e) {
    next(e);
  }
});

adminRoutesRouter.post("/", requireRole("ADMIN"), requireRoutePlanLimit, async (req, res, next) => {
  try {
    const input = createRouteSchema.parse(req.body);
    const tenantId = req.tenant?.id;
    const [from, to] = await Promise.all([
      prisma.stop.findFirst({ where: { id: input.fromStopId, tenantId } }),
      prisma.stop.findFirst({ where: { id: input.toStopId, tenantId } }),
    ]);
    if (!from || !to) throw new AppError(ErrorCode.NOT_FOUND, "Stop not found", 404);
    const slug = slugify(from.city, to.city);
    const existing = await prisma.route.findFirst({
      where: {
        tenantId,
        OR: [
          { fromStopId: input.fromStopId, toStopId: input.toStopId },
          { slug },
        ],
      },
    });
    if (existing) {
      const sameStops =
        existing.fromStopId === input.fromStopId &&
        existing.toStopId === input.toStopId;
      throw new AppError(
        ErrorCode.CONFLICT,
        sameStops
          ? "A route between these stops already exists"
          : "A route with this slug already exists",
        409,
      );
    }
    const route = await prisma.route.create({
      data: { ...input, slug, tenantId },
      include: { fromStop: true, toStop: true },
    });
    res.status(201).json(successResponse(route));
  } catch (e) {
    next(e);
  }
});
