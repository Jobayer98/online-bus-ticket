import { z } from "zod";
import { tenantMemberRoleSchema } from "../../enums/platform.js";

export const inviteMemberSchema = z.object({
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\+?[0-9]+$/, "Invalid phone number"),
  role: tenantMemberRoleSchema,
  name: z.string().min(1).max(100).optional(),
});

export const updateMemberRoleSchema = z.object({
  role: tenantMemberRoleSchema,
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
