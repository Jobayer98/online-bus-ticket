import { z } from "zod";
import { tenantMemberRoleSchema } from "../../enums/platform.js";
import { tenantDtoSchema } from "./tenant.dto.js";

export const platformTenantMemberDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().nullable(),
  phone: z.string(),
  email: z.string().nullable(),
  role: tenantMemberRoleSchema,
});

export const platformTenantStatsDtoSchema = z.object({
  bookings: z.number(),
  grossRevenue: z.number(),
  refunds: z.number(),
  netRevenue: z.number(),
});

export const platformTenantOwnerContactDtoSchema = z.object({
  name: z.string().nullable(),
  phone: z.string(),
  email: z.string().nullable(),
});

export const platformTenantDetailDtoSchema = tenantDtoSchema.extend({
  members: z.array(platformTenantMemberDtoSchema),
  statsThisMonth: platformTenantStatsDtoSchema,
  ownerContact: platformTenantOwnerContactDtoSchema.nullable(),
  monthlyMrr: z.number(),
});

export type PlatformTenantDetailDto = z.infer<
  typeof platformTenantDetailDtoSchema
>;
