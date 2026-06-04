import { z } from "zod";
import { planStatusSchema, planTierSchema } from "../../enums/platform.js";

export const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  subdomainPrefix: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain prefix must be lowercase alphanumeric with hyphens",
    )
    .optional(),
  customDomain: z.string().min(3).max(253).optional(),
  planTier: planTierSchema.optional(),
  planStatus: planStatusSchema.optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  planTier: planTierSchema.optional(),
  planStatus: planStatusSchema.optional(),
  customDomain: z.string().min(3).max(253).nullable().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
