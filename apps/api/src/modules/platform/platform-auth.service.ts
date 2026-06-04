import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  platformAuthResponseDto,
  type LoginInput,
} from "@repo/shared";
import { signToken } from "../../middleware/auth.js";

export async function platformLogin(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid credentials", 401);
  }
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Platform admin access only. Sign in on your company subdomain.",
      403,
    );
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid credentials", 401);
  }
  const token = signToken({ userId: user.id, role: user.role });
  return platformAuthResponseDto.parse({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: "SUPER_ADMIN" as const,
    },
  });
}
