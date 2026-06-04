import { z } from "zod";

export const registerTenantSchema = z.object({
  companyName: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  ownerName: z.string().min(1).max(100),
  ownerPhone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\+?[0-9]+$/, "Invalid phone number"),
  ownerEmail: z.string().email().optional(),
  ownerPassword: z.string().min(8).max(100),
});

export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;
