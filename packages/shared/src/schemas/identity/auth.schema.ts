import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
