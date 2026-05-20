import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import { AppError, ErrorCode, type LoginInput, type RegisterInput } from "@repo/shared";
import { signToken } from "../../middleware/auth.js";

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, "Phone already registered", 409);
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      phone: input.phone,
      email: input.email,
      name: input.name,
      passwordHash,
      role: "USER",
    },
  });
  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid credentials", 401);
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid credentials", 401);
  }
  const token = signToken({ userId: user.id, role: user.role });
  // #region agent log
  fetch("http://127.0.0.1:7854/ingest/f6036832-8c1b-4501-95fc-cb1871e7602a", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1df7a0",
    },
    body: JSON.stringify({
      sessionId: "1df7a0",
      runId: "login",
      hypothesisId: "D",
      location: "auth.service.ts:login",
      message: "login success",
      data: { role: user.role, tokenLen: token.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return { token, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } };
}
