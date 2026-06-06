import { z } from "zod";
import { planTierSchema } from "../../enums/platform.js";
import { subscriptionStatusSchema } from "../../schemas/platform/usage-billing-health.schema.js";

export const platformTenantUsageRowSchema = z.object({
  tenantId: z.string(),
  tenantName: z.string(),
  slug: z.string(),
  planTier: planTierSchema,
  bookings: z.number(),
  bookingsSharePct: z.number(),
  apiCalls: z.number(),
  avgResponseMs: z.number(),
  errorRatePct: z.number(),
  revenue: z.number(),
});

export const platformUsageOverviewDtoSchema = z.object({
  periodDays: z.number(),
  totalApiCalls: z.number(),
  totalBookings: z.number(),
  avgResponseMs: z.number(),
  errorRatePct: z.number(),
  tenants: z.array(platformTenantUsageRowSchema),
  bookingsByDay: z.array(
    z.object({ date: z.string(), bookings: z.number() }),
  ),
});

export type PlatformUsageOverviewDto = z.infer<
  typeof platformUsageOverviewDtoSchema
>;

export const platformTenantUsageDetailDtoSchema =
  platformTenantUsageRowSchema.extend({
    topEndpoints: z.array(
      z.object({
        endpoint: z.string(),
        calls: z.number(),
        errorRatePct: z.number(),
      }),
    ),
  });

export type PlatformTenantUsageDetailDto = z.infer<
  typeof platformTenantUsageDetailDtoSchema
>;

export const platformSubscriptionDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  tenantSlug: z.string(),
  planTier: planTierSchema,
  status: subscriptionStatusSchema,
  monthlyPriceMinor: z.number(),
  billingCycleStart: z.string(),
  billingCycleEnd: z.string(),
  nextBillDate: z.string().nullable(),
  autoRenew: z.boolean(),
  churnRisk: z.boolean(),
});

export type PlatformSubscriptionDto = z.infer<
  typeof platformSubscriptionDtoSchema
>;

export const platformBillingRevenueDtoSchema = z.object({
  mrr: z.number(),
  arr: z.number(),
  activeSubscriptions: z.number(),
  churnRatePct: z.number().nullable(),
  arpu: z.number(),
  collectionRatePct: z.number(),
  cancelledThisPeriod: z.number(),
  planDistribution: z.array(
    z.object({
      planTier: planTierSchema,
      count: z.number(),
      mrr: z.number(),
    }),
  ),
});

export type PlatformBillingRevenueDto = z.infer<
  typeof platformBillingRevenueDtoSchema
>;

export const platformServiceStatusSchema = z.object({
  name: z.string(),
  status: z.enum(["healthy", "degraded", "down"]),
  detail: z.string(),
});

export const platformHealthDtoSchema = z.object({
  overallStatus: z.enum(["operational", "degraded", "outage"]),
  uptimePct: z.number(),
  services: z.array(platformServiceStatusSchema),
  lastCheckedAt: z.string(),
});

export type PlatformHealthDto = z.infer<typeof platformHealthDtoSchema>;

export const platformHealthMetricsDtoSchema = z.object({
  periodDays: z.number(),
  errorRatePct: z.number(),
  avgResponseMs: z.number(),
  requestsPerMinute: z.number(),
  memoryUsagePct: z.number(),
  recentErrors: z.array(
    z.object({
      timestamp: z.string(),
      endpoint: z.string(),
      statusCode: z.number(),
      responseTimeMs: z.number(),
      tenantId: z.string().nullable(),
    }),
  ),
  uptimeByDay: z.array(
    z.object({ date: z.string(), uptimePct: z.number() }),
  ),
});

export type PlatformHealthMetricsDto = z.infer<
  typeof platformHealthMetricsDtoSchema
>;

export const subscriptionRefundResultDtoSchema = z.object({
  subscriptionId: z.string(),
  amountMinor: z.number(),
  reason: z.string(),
  refundedAt: z.string(),
});

export type SubscriptionRefundResultDto = z.infer<
  typeof subscriptionRefundResultDtoSchema
>;
