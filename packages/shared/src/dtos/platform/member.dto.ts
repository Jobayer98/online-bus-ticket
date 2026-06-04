import { z } from "zod";
import { tenantMemberRoleSchema } from "../../enums/platform.js";

export const tenantMemberDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  role: tenantMemberRoleSchema,
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    phone: z.string(),
    email: z.string().nullable(),
  }),
});

export const tenantMemberListDtoSchema = z.object({
  members: z.array(tenantMemberDtoSchema),
  total: z.number(),
});

export type TenantMemberDto = z.infer<typeof tenantMemberDtoSchema>;
export type TenantMemberListDto = z.infer<typeof tenantMemberListDtoSchema>;
