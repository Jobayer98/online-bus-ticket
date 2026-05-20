import { Router } from "express";
import { prisma } from "@repo/database";
import { createRouteSchema, successResponse, AppError, ErrorCode } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

function slugify(from: string, to: string) {
  return `${from}-${to}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const adminRoutesRouter = Router();
adminRoutesRouter.use(authenticateRequired, requireRole("ADMIN", "COUNTER_SELLER"));

adminRoutesRouter.get("/", async (_req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      include: { fromStop: true, toStop: true },
    });
    res.json(successResponse(routes));
  } catch (e) {
    next(e);
  }
});

adminRoutesRouter.post("/", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = createRouteSchema.parse(req.body);
    const [from, to] = await Promise.all([
      prisma.stop.findUnique({ where: { id: input.fromStopId } }),
      prisma.stop.findUnique({ where: { id: input.toStopId } }),
    ]);
    if (!from || !to) throw new AppError(ErrorCode.NOT_FOUND, "Stop not found", 404);
    const slug = slugify(from.city, to.city);
    const existing = await prisma.route.findFirst({
      where: {
        OR: [
          { fromStopId: input.fromStopId, toStopId: input.toStopId },
          { slug },
        ],
      },
    });
    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, "Route already exists", 409);
    }
    const route = await prisma.route.create({
      data: { ...input, slug },
      include: { fromStop: true, toStop: true },
    });
    res.status(201).json(successResponse(route));
  } catch (e) {
    next(e);
  }
});
