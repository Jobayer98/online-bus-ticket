import { z } from "zod";
import { planStatusSchema, planTierSchema } from "../../enums/platform.js";

export const platformDashboardTopTenantSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  planTier: planTierSchema,
  planStatus: planStatusSchema,
  bookingsThisMonth: z.number(),
  revenueThisMonth: z.number(),
});

export const platformDashboardPlanDistributionSchema = z.object({
  planTier: planTierSchema,
  count: z.number(),
  percentage: z.number(),
});

export const platformDashboardAlertSchema = z.object({
  severity: z.enum(["info", "warning", "danger"]),
  message: z.string(),
  tenantId: z.string().optional(),
  tenantName: z.string().optional(),
});

export const platformDashboardOverviewDtoSchema = z.object({
  totalMrr: z.number(),
  activeTenants: z.number(),
  licensedCapacity: z.number(),
  monthlyBookings: z.number(),
  platformRevenue30d: z.number(),
  bookingsGrowthPct: z.number().nullable(),
  platformUptimePct: z.number(),
  topTenants: z.array(platformDashboardTopTenantSchema),
  planDistribution: z.array(platformDashboardPlanDistributionSchema),
  alerts: z.array(platformDashboardAlertSchema),
});

export type PlatformDashboardOverviewDto = z.infer<
  typeof platformDashboardOverviewDtoSchema
>;
