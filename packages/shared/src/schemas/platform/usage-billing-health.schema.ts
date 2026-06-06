import { z } from "zod";
import { planTierSchema } from "../../enums/platform.js";

export const platformUsageQuerySchema = z.object({
  periodDays: z.coerce.number().int().min(7).max(90).optional().default(30),
  tenantId: z.string().optional(),
});

export type PlatformUsageQuery = z.infer<typeof platformUsageQuerySchema>;

export const subscriptionStatusSchema = z.enum([
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "SUSPENDED",
  "CANCELLED",
]);

export const listPlatformSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: subscriptionStatusSchema.optional(),
  planTier: planTierSchema.optional(),
});

export type ListPlatformSubscriptionsQuery = z.infer<
  typeof listPlatformSubscriptionsQuerySchema
>;

export const upgradeSubscriptionSchema = z.object({
  planTier: planTierSchema,
});

export type UpgradeSubscriptionInput = z.infer<
  typeof upgradeSubscriptionSchema
>;

export const subscriptionRefundSchema = z.object({
  amountMinor: z.number().int().positive(),
  reason: z.string().min(3).max(500),
});

export type SubscriptionRefundInput = z.infer<typeof subscriptionRefundSchema>;

export const platformBillingRevenueQuerySchema = z.object({
  periodDays: z.coerce.number().int().min(7).max(90).optional().default(30),
});

export type PlatformBillingRevenueQuery = z.infer<
  typeof platformBillingRevenueQuerySchema
>;

export const platformHealthMetricsQuerySchema = z.object({
  periodDays: z.coerce.number().int().min(1).max(30).optional().default(7),
});

export type PlatformHealthMetricsQuery = z.infer<
  typeof platformHealthMetricsQuerySchema
>;
