import bcrypt from "bcryptjs";
import { prisma, seedTenantCmsDefaults } from "@repo/database";
import {
  AppError,
  ErrorCode,
  planMonthlyPriceMinor,
  type CreateTenantInput,
  type UpdateTenantInput,
  type RegisterTenantInput,
  type ListPlatformTenantsQuery,
  type PlanTier,
  type PlanStatus,
  todayInDhaka,
  dhakaStartOfDay,
  dhakaEndOfDay,
} from "@repo/shared";
import type { Prisma } from "@repo/database";
import { signToken } from "../../middleware/auth.js";
import { invalidateTenantCache } from "../../middleware/subdomain-tenant-resolver.js";
import {
  logPlatformAudit,
  resolveAuditActor,
  type PlatformAuditActor,
} from "./platform-audit.service.js";
import {
  createSubscriptionForTenant,
  syncSubscriptionFromTenant,
} from "./platform-subscription.service.js";

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

function monthRange() {
  const today = todayInDhaka();
  const start = dhakaStartOfDay(`${today.slice(0, 7)}-01`);
  const end = dhakaEndOfDay(today);
  return { start, end };
}

async function bookingStatsForTenants(tenantIds: string[]) {
  if (tenantIds.length === 0) return new Map<string, { bookings: number; revenue: number }>();

  const { start, end } = monthRange();
  const rows = await prisma.booking.groupBy({
    by: ["tenantId"],
    where: {
      tenantId: { in: tenantIds },
      status: "PAID",
      createdAt: { gte: start, lte: end },
    },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });

  return new Map(
    rows
      .filter((r) => r.tenantId)
      .map((r) => [
        r.tenantId!,
        {
          bookings: r._count._all,
          revenue: r._sum.totalAmount ?? 0,
        },
      ]),
  );
}

function buildTenantWhere(query: ListPlatformTenantsQuery): Prisma.TenantWhereInput {
  const where: Prisma.TenantWhereInput = {};

  if (query.planTier) where.planTier = query.planTier;
  if (query.planStatus) where.planStatus = query.planStatus;
  if (query.createdWithinDays) {
    const cutoff = new Date(Date.now() - query.createdWithinDays * 86_400_000);
    where.createdAt = { gte: cutoff };
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { slug: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function auditActionForStatusChange(
  before: string,
  after: string,
): "UPDATE" | "SUSPEND" | "ACTIVATE" {
  if (after === "SUSPENDED" && before !== "SUSPENDED") return "SUSPEND";
  if (before === "SUSPENDED" && after !== "SUSPENDED") return "ACTIVATE";
  return "UPDATE";
}

function pickChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const changes: Record<string, unknown> = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      changes[key] = { before: before[key], after: after[key] };
    }
  }
  return Object.keys(changes).length
    ? { before, after, fields: changes }
    : null;
}

export async function listTenants(query: ListPlatformTenantsQuery) {
  const skip = (query.page - 1) * query.pageSize;
  const where = buildTenantWhere(query);

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { members: true } } },
    }),
    prisma.tenant.count({ where }),
  ]);

  const stats = await bookingStatsForTenants(tenants.map((t) => t.id));

  return {
    tenants: tenants.map((t) => {
      const month = stats.get(t.id) ?? { bookings: 0, revenue: 0 };
      const memberCount = t._count.members;
      return {
        ...toTenantDto(t),
        memberCount,
        bookingsThisMonth: month.bookings,
        revenueThisMonth: month.revenue,
      };
    }),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getTenantDetail(id: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
        orderBy: { role: "asc" },
      },
    },
  });
  if (!tenant) {
    throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);
  }

  const { start, end } = monthRange();
  const [paidBookings, refunds] = await Promise.all([
    prisma.booking.findMany({
      where: {
        tenantId: id,
        status: "PAID",
        createdAt: { gte: start, lte: end },
      },
      select: { totalAmount: true },
    }),
    prisma.counterTransaction.findMany({
      where: {
        tenantId: id,
        type: "REFUND",
        createdAt: { gte: start, lte: end },
      },
      select: { amount: true },
    }),
  ]);

  const grossRevenue = paidBookings.reduce((s, b) => s + b.totalAmount, 0);
  const refundTotal = refunds.reduce((s, r) => s + Math.abs(r.amount), 0);

  const adminMember = tenant.members.find((m) => m.role === "ADMIN");

  return {
    ...toTenantDto(tenant),
    members: tenant.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      phone: m.user.phone,
      email: m.user.email,
      role: m.role,
    })),
    statsThisMonth: {
      bookings: paidBookings.length,
      grossRevenue,
      refunds: refundTotal,
      netRevenue: grossRevenue - refundTotal,
    },
    ownerContact: adminMember
      ? {
          name: adminMember.user.name,
          phone: adminMember.user.phone,
          email: adminMember.user.email,
        }
      : null,
    monthlyMrr: planMonthlyPriceMinor(tenant.planTier as PlanTier),
  };
}

export async function getTenant(id: string) {
  const detail = await getTenantDetail(id);
  return toTenantDto({
    id: detail.id,
    name: detail.name,
    slug: detail.slug,
    subdomainPrefix: detail.subdomainPrefix,
    customDomain: detail.customDomain,
    planTier: detail.planTier,
    planStatus: detail.planStatus,
    createdAt: new Date(detail.createdAt),
    updatedAt: new Date(detail.updatedAt),
  });
}

export async function createTenant(
  input: CreateTenantInput,
  audit?: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
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

  await createSubscriptionForTenant(
    tenant.id,
    tenant.planTier as PlanTier,
    tenant.planStatus as PlanStatus,
  );

  if (audit) {
    await logPlatformAudit({
      action: "CREATE",
      resourceType: "TENANT",
      resourceId: tenant.id,
      changes: { after: toTenantDto(tenant) },
      ipAddress: audit.ipAddress,
      actor: audit.actor,
    });
  }

  return toTenantDto(tenant);
}

export async function updateTenant(
  id: string,
  input: UpdateTenantInput,
  audit?: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant not found", 404);

  const before = {
    name: tenant.name,
    planTier: tenant.planTier,
    planStatus: tenant.planStatus,
    customDomain: tenant.customDomain,
  };

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

  await syncSubscriptionFromTenant(
    updated.id,
    updated.planTier as PlanTier,
    updated.planStatus as PlanStatus,
  );

  if (audit) {
    const after = {
      name: updated.name,
      planTier: updated.planTier,
      planStatus: updated.planStatus,
      customDomain: updated.customDomain,
    };
    const action =
      input.planStatus !== undefined
        ? auditActionForStatusChange(before.planStatus, after.planStatus)
        : "UPDATE";

    await logPlatformAudit({
      action,
      resourceType: "TENANT",
      resourceId: updated.id,
      changes: pickChanges(before, after),
      ipAddress: audit.ipAddress,
      actor: audit.actor,
    });
  }

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

    await seedTenantCmsDefaults(tx, newTenant.id, input.companyName);

    return { tenant: newTenant, user: newUser };
  });

  await createSubscriptionForTenant(tenant.id, "FREE", "TRIAL");

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

export { resolveAuditActor };
