import { prisma } from "@repo/database";
import {
  importScheduleRowSchema,
  type ImportResultDto,
  type ImportSchedulesInput,
} from "@repo/shared";
import { createScheduleWithSeats } from "./schedules-admin.service.js";

const PLAN_LIMITS = {
  FREE: { maxSchedulesPerMonth: 50 },
  PRO: { maxSchedulesPerMonth: Infinity },
  ENTERPRISE: { maxSchedulesPerMonth: Infinity },
} as const;

async function getRemainingScheduleSlots(
  tenantId: string,
  planTier: string,
): Promise<number> {
  const limits =
    PLAN_LIMITS[planTier as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.FREE;
  if (limits.maxSchedulesPerMonth === Infinity) return Infinity;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const scheduleCount = await prisma.schedule.count({
    where: { tenantId, createdAt: { gte: startOfMonth } },
  });

  return Math.max(0, limits.maxSchedulesPerMonth - scheduleCount);
}

export async function importSchedules(
  input: ImportSchedulesInput,
  tenantId: string | undefined,
  planTier: string | undefined,
): Promise<ImportResultDto> {
  const result: ImportResultDto = { created: 0, skipped: 0, errors: [] };

  let remaining = Infinity;
  if (tenantId && planTier) {
    remaining = await getRemainingScheduleSlots(tenantId, planTier);
    if (remaining <= 0) {
      return {
        created: 0,
        skipped: 0,
        errors: [
          {
            row: 0,
            message: "Monthly schedule limit reached for your plan",
          },
        ],
      };
    }
  }

  const routeSlugs = [...new Set(input.rows.map((r) => r.routeSlug.trim()))];
  const coachNumbers = [
    ...new Set(input.rows.map((r) => r.coachNumber.trim())),
  ];

  const [routes, coaches] = await Promise.all([
    prisma.route.findMany({
      where: { tenantId, slug: { in: routeSlugs } },
      select: { id: true, slug: true },
    }),
    prisma.coach.findMany({
      where: { tenantId, coachNumber: { in: coachNumbers } },
      select: {
        id: true,
        coachNumber: true,
        seatLayoutId: true,
      },
    }),
  ]);

  const routeBySlug = new Map(routes.map((r) => [r.slug, r.id]));
  const coachByNumber = new Map(coaches.map((c) => [c.coachNumber, c]));

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 1;
    const parsed = importScheduleRowSchema.safeParse(input.rows[i]);
    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ?? "Invalid row data";
      result.errors.push({ row: rowNum, message });
      continue;
    }
    const row = parsed.data;
    const routeSlug = row.routeSlug.trim();
    const coachNumber = row.coachNumber.trim();

    if (remaining <= 0) {
      result.errors.push({
        row: rowNum,
        message: "Monthly schedule limit reached for your plan",
      });
      continue;
    }

    const routeId = routeBySlug.get(routeSlug);
    if (!routeId) {
      result.errors.push({
        row: rowNum,
        message: `Route not found: "${routeSlug}"`,
      });
      continue;
    }

    const coach = coachByNumber.get(coachNumber);
    if (!coach) {
      result.errors.push({
        row: rowNum,
        message: `Coach not found: "${coachNumber}"`,
      });
      continue;
    }

    if (!coach.seatLayoutId) {
      result.errors.push({
        row: rowNum,
        message: `Coach "${coachNumber}" has no seat layout`,
      });
      continue;
    }

    try {
      await createScheduleWithSeats({
        routeId,
        coachId: coach.id,
        departureAt: new Date(row.departureAt),
        estimatedArrivalAt: new Date(row.estimatedArrivalAt),
        baseFare: Math.round(row.baseFareTaka * 100),
        tenantId,
      });
      result.created++;
      if (remaining !== Infinity) remaining--;
    } catch (e) {
      result.errors.push({
        row: rowNum,
        message: e instanceof Error ? e.message : "Failed to create schedule",
      });
    }
  }

  return result;
}
