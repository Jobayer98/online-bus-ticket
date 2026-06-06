import { z } from "zod";
import { planStatusSchema, planTierSchema } from "../../enums/platform.js";

export const listPlatformTenantsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  planTier: planTierSchema.optional(),
  planStatus: planStatusSchema.optional(),
  search: z.string().trim().max(100).optional(),
  createdWithinDays: z.coerce.number().int().min(1).max(365).optional(),
});

export type ListPlatformTenantsQuery = z.infer<
  typeof listPlatformTenantsQuerySchema
>;
