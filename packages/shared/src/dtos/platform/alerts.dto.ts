import { z } from "zod";
import {
  platformAlertSeveritySchema,
  platformAlertStatusSchema,
} from "../../schemas/platform/alerts.schema.js";

export const platformAlertDtoSchema = z.object({
  id: z.string(),
  severity: platformAlertSeveritySchema,
  title: z.string(),
  message: z.string(),
  status: platformAlertStatusSchema,
  source: z.string(),
  ruleKey: z.string().nullable(),
  tenantId: z.string().nullable(),
  tenantName: z.string().nullable(),
  createdAt: z.string(),
  acknowledgedAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
});

export type PlatformAlertDto = z.infer<typeof platformAlertDtoSchema>;
