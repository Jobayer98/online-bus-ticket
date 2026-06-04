import { z } from "zod";

export const platformAuthUserDto = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().nullable().optional(),
  role: z.literal("SUPER_ADMIN"),
});

export const platformAuthResponseDto = z.object({
  token: z.string(),
  user: platformAuthUserDto,
});

export type PlatformAuthResponseDto = z.infer<typeof platformAuthResponseDto>;
