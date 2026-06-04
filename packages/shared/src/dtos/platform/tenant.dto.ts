import { z } from "zod";
import { planStatusSchema, planTierSchema } from "../../enums/platform.js";

export const tenantDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  subdomainPrefix: z.string(),
  customDomain: z.string().nullable(),
  planTier: planTierSchema,
  planStatus: planStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tenantListDtoSchema = z.object({
  tenants: z.array(tenantDtoSchema),
  total: z.number(),
});

export const registerTenantResponseDtoSchema = z.object({
  tenant: tenantDtoSchema,
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    phone: z.string(),
    role: z.string(),
  }),
});

export type TenantDto = z.infer<typeof tenantDtoSchema>;
export type TenantListDto = z.infer<typeof tenantListDtoSchema>;
export type RegisterTenantResponseDto = z.infer<
  typeof registerTenantResponseDtoSchema
>;
