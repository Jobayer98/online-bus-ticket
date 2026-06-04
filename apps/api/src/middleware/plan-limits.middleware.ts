import type { RequestHandler } from "express";
import { prisma } from "@repo/database";
import { AppError, ErrorCode } from "@repo/shared";

const PLAN_LIMITS = {
  FREE: { maxRoutes: 5, maxSchedulesPerMonth: 50 },
  PRO: { maxRoutes: Infinity, maxSchedulesPerMonth: Infinity },
  ENTERPRISE: { maxRoutes: Infinity, maxSchedulesPerMonth: Infinity },
} as const;

export const requireRoutePlanLimit: RequestHandler = async (req, _res, next) => {
  const tenant = req.tenant;
  if (!tenant) return next();

  const planTier = tenant.planTier as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planTier] ?? PLAN_LIMITS.FREE;

  if (limits.maxRoutes === Infinity) return next();

  const routeCount = await prisma.route.count({
    where: { tenantId: tenant.id },
  });

  if (routeCount >= limits.maxRoutes) {
    return next(
      new AppError(
        ErrorCode.PLAN_LIMIT_EXCEEDED,
        `Your ${planTier} plan allows up to ${limits.maxRoutes} routes. Upgrade to PRO to create more.`,
        403,
      ),
    );
  }
  next();
};

export const requireSchedulePlanLimit: RequestHandler = async (
  req,
  _res,
  next,
) => {
  const tenant = req.tenant;
  if (!tenant) return next();

  const planTier = tenant.planTier as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planTier] ?? PLAN_LIMITS.FREE;

  if (limits.maxSchedulesPerMonth === Infinity) return next();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const scheduleCount = await prisma.schedule.count({
    where: { tenantId: tenant.id, createdAt: { gte: startOfMonth } },
  });

  if (scheduleCount >= limits.maxSchedulesPerMonth) {
    return next(
      new AppError(
        ErrorCode.PLAN_LIMIT_EXCEEDED,
        `Your ${planTier} plan allows up to ${limits.maxSchedulesPerMonth} schedules per month. Upgrade to PRO to create more.`,
        403,
      ),
    );
  }
  next();
};
