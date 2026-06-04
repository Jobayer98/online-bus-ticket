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

async function assertTenantMembership(
  userId: string,
  tenantSlug: string,
): Promise<void> {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { subdomainPrefix: tenantSlug },
        { slug: tenantSlug },
      ],
    },
    select: { id: true },
  });
  if (!tenant) {
    throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);
  }
  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
  });
  if (!membership) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "You are not a member of this company",
      403,
    );
  }
}

export async function login(input: LoginInput, tenantSlug?: string) {
  const user = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid credentials", 401);
  }
  if (user.role === "SUPER_ADMIN") {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Use platform admin login at /platform/login",
      403,
    );
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid credentials", 401);
  }

  const isStaff =
    user.role === "ADMIN" || user.role === "COUNTER_SELLER";

  if (isStaff) {
    if (!tenantSlug) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        "Staff must sign in on your company subdomain",
        403,
      );
    }
    await assertTenantMembership(user.id, tenantSlug);
  }

  const token = signToken({ userId: user.id, role: user.role });
  return {
    token,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  };
}
