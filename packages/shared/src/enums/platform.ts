import { z } from "zod";

export const PlanTier = {
  FREE: "FREE",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type PlanTier = (typeof PlanTier)[keyof typeof PlanTier];
export const planTierSchema = z.enum(["FREE", "PRO", "ENTERPRISE"]);

export const PlanStatus = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
} as const;
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];
export const planStatusSchema = z.enum([
  "TRIAL",
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
]);

export const TenantMemberRole = {
  ADMIN: "ADMIN",
  COUNTER_SELLER: "COUNTER_SELLER",
} as const;
export type TenantMemberRole =
  (typeof TenantMemberRole)[keyof typeof TenantMemberRole];
export const tenantMemberRoleSchema = z.enum(["ADMIN", "COUNTER_SELLER"]);
