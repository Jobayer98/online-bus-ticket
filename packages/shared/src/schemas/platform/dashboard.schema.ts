import { z } from "zod";

export const platformDashboardQuerySchema = z.object({
  periodDays: z.coerce.number().int().min(7).max(90).optional().default(30),
});

export type PlatformDashboardQuery = z.infer<typeof platformDashboardQuerySchema>;
