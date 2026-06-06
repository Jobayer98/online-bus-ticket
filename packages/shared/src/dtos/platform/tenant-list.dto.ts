import { z } from "zod";
import { tenantDtoSchema } from "./tenant.dto.js";

export const platformTenantListItemDtoSchema = tenantDtoSchema.extend({
  memberCount: z.number(),
  bookingsThisMonth: z.number(),
  revenueThisMonth: z.number(),
});

export type PlatformTenantListItemDto = z.infer<
  typeof platformTenantListItemDtoSchema
>;
