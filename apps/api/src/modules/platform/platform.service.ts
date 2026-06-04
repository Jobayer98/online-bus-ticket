import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  type CreateTenantInput,
  type UpdateTenantInput,
  type RegisterTenantInput,
} from "@repo/shared";
import { signToken } from "../../middleware/auth.js";
import { invalidateTenantCache } from "../../middleware/subdomain-tenant-resolver.js";

function toTenantDto(tenant: {
  id: string;
  name: string;
  slug: string;
  subdomainPrefix: string;
  customDomain: string | null;
  planTier: string;
  planStatus: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    subdomainPrefix: tenant.subdomainPrefix,
    customDomain: tenant.customDomain,
    planTier: tenant.planTier,
    planStatus: tenant.planStatus,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
  };
}

export async function listTenants(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.count(),
  ]);
  return {
    tenants: tenants.map(toTenantDto),
    meta: { page, pageSize, total },
  };
}

export async function getTenant(id: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);
  return toTenantDto(tenant);
}

export async function createTenant(input: CreateTenantInput) {
  const subdomainPrefix = input.subdomainPrefix ?? input.slug;
  const existing = await prisma.tenant.findFirst({
    where: { OR: [{ slug: input.slug }, { subdomainPrefix }] },
  });
  if (existing) {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Slug or subdomain prefix already taken",
      409,
    );
  }
  const tenant = await prisma.tenant.create({
    data: {
      name: input.name,
      slug: input.slug,
      subdomainPrefix,
      customDomain: input.customDomain ?? null,
      planTier: input.planTier ?? "FREE",
      planStatus: input.planStatus ?? "TRIAL",
    },
  });
  return toTenantDto(tenant);
}

export async function updateTenant(id: string, input: UpdateTenantInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.planTier !== undefined && { planTier: input.planTier }),
      ...(input.planStatus !== undefined && { planStatus: input.planStatus }),
      ...(input.customDomain !== undefined && {
        customDomain: input.customDomain,
      }),
    },
  });

  invalidateTenantCache(updated.slug);
  return toTenantDto(updated);
}

export async function registerTenant(input: RegisterTenantInput) {
  const slug = input.slug.toLowerCase();
  const existing = await prisma.tenant.findFirst({
    where: { OR: [{ slug }, { subdomainPrefix: slug }] },
  });
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, "Slug already taken", 409);
  }

  const phoneExists = await prisma.user.findUnique({
    where: { phone: input.ownerPhone },
  });
  if (phoneExists) {
    throw new AppError(ErrorCode.CONFLICT, "Phone already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.ownerPassword, 10);

  const { tenant, user } = await prisma.$transaction(async (tx) => {
    const newTenant = await tx.tenant.create({
      data: {
        name: input.companyName,
        slug,
        subdomainPrefix: slug,
        planTier: "FREE",
        planStatus: "TRIAL",
      },
    });

    const newUser = await tx.user.create({
      data: {
        name: input.ownerName,
        phone: input.ownerPhone,
        email: input.ownerEmail ?? null,
        passwordHash,
        role: "ADMIN",
      },
    });

    await tx.tenantMembership.create({
      data: {
        tenantId: newTenant.id,
        userId: newUser.id,
        role: "ADMIN",
      },
    });

    return { tenant: newTenant, user: newUser };
  });

  const token = signToken({ userId: user.id, role: user.role });

  return {
    tenant: toTenantDto(tenant),
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
}
