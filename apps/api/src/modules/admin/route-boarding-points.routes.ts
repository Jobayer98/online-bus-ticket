import { Router } from "express";
import { prisma } from "@repo/database";
import {
  AppError,
  createBoardingPointSchema,
  ErrorCode,
  successResponse,
  updateBoardingPointSchema,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

type RouteBoardingParams = {
  routeId: string;
  boardingPointId?: string;
};

export const adminRouteBoardingPointsRouter = Router({ mergeParams: true });

function routeIdFrom(req: { params: unknown }): string {
  return String((req.params as RouteBoardingParams).routeId);
}

adminRouteBoardingPointsRouter.use(
  authenticateRequired,
  requireRole("ADMIN", "COUNTER_SELLER"),
);

async function assertRouteExists(routeId: string) {
  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route) {
    throw new AppError(ErrorCode.NOT_FOUND, "Route not found", 404);
  }
  return route;
}

adminRouteBoardingPointsRouter.get("/", async (req, res, next) => {
  try {
    const routeId = routeIdFrom(req);
    await assertRouteExists(routeId);
    const points = await prisma.boardingPoint.findMany({
      where: { routeId },
      orderBy: { sortOrder: "asc" },
    });
    res.json(successResponse(points));
  } catch (e) {
    next(e);
  }
});

adminRouteBoardingPointsRouter.post(
  "/",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const routeId = routeIdFrom(req);
      await assertRouteExists(routeId);
      const input = createBoardingPointSchema.parse(req.body);

      const duplicate = await prisma.boardingPoint.findFirst({
        where: { routeId, name: input.name },
      });
      if (duplicate) {
        throw new AppError(
          ErrorCode.CONFLICT,
          "Boarding point name already exists on this route",
          409,
        );
      }

      let sortOrder = input.sortOrder;
      if (sortOrder === undefined) {
        const max = await prisma.boardingPoint.aggregate({
          where: { routeId },
          _max: { sortOrder: true },
        });
        sortOrder = (max._max.sortOrder ?? 0) + 1;
      }

      const point = await prisma.boardingPoint.create({
        data: { routeId, name: input.name, sortOrder },
      });
      res.status(201).json(successResponse(point));
    } catch (e) {
      next(e);
    }
  },
);

adminRouteBoardingPointsRouter.patch(
  "/:boardingPointId",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const routeId = routeIdFrom(req);
      const boardingPointId = String(
        (req.params as RouteBoardingParams).boardingPointId,
      );
      await assertRouteExists(routeId);
      const input = updateBoardingPointSchema.parse(req.body);

      const existing = await prisma.boardingPoint.findFirst({
        where: { id: boardingPointId, routeId },
      });
      if (!existing) {
        throw new AppError(ErrorCode.NOT_FOUND, "Boarding point not found", 404);
      }

      if (input.name && input.name !== existing.name) {
        const duplicate = await prisma.boardingPoint.findFirst({
          where: {
            routeId,
            name: input.name,
            id: { not: boardingPointId },
          },
        });
        if (duplicate) {
          throw new AppError(
            ErrorCode.CONFLICT,
            "Boarding point name already exists on this route",
            409,
          );
        }
      }

      const point = await prisma.boardingPoint.update({
        where: { id: boardingPointId },
        data: input,
      });
      res.json(successResponse(point));
    } catch (e) {
      next(e);
    }
  },
);

adminRouteBoardingPointsRouter.delete(
  "/:boardingPointId",
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const routeId = routeIdFrom(req);
      const boardingPointId = String(
        (req.params as RouteBoardingParams).boardingPointId,
      );
      await assertRouteExists(routeId);

      const existing = await prisma.boardingPoint.findFirst({
        where: { id: boardingPointId, routeId },
      });
      if (!existing) {
        throw new AppError(ErrorCode.NOT_FOUND, "Boarding point not found", 404);
      }

      const bookingCount = await prisma.booking.count({
        where: { boardingPointId },
      });
      if (bookingCount > 0) {
        throw new AppError(
          ErrorCode.CONFLICT,
          "Cannot delete boarding point used by existing bookings",
          409,
        );
      }

      await prisma.boardingPoint.delete({ where: { id: boardingPointId } });
      res.json(successResponse({ deleted: true }));
    } catch (e) {
      next(e);
    }
  },
);
