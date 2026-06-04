import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import {
  inviteMemberSchema,
  successResponse,
  AppError,
  ErrorCode,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";

export const adminMembersRouter = Router();
adminMembersRouter.use(authenticateRequired, requireRole("ADMIN"));

adminMembersRouter.get("/", async (req, res, next) => {
  try {
    if (!req.tenant) {
      return next(
        new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant context missing", 404),
      );
    }
    const members = await prisma.tenantMembership.findMany({
      where: { tenantId: req.tenant.id },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
      orderBy: { id: "asc" },
    });
    const total = members.length;
    res.json({
      data: members.map((m) => ({
        id: m.id,
        tenantId: m.tenantId,
        userId: m.userId,
        role: m.role,
        user: m.user,
      })),
      meta: { page: 1, pageSize: total, total },
    });
  } catch (e) {
    next(e);
  }
});

adminMembersRouter.post("/", async (req, res, next) => {
  try {
    if (!req.tenant) {
      return next(
        new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant context missing", 404),
      );
    }
    const input = inviteMemberSchema.parse(req.body);
    const tenantId = req.tenant.id;

    let user = await prisma.user.findUnique({
      where: { phone: input.phone },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(
        Math.random().toString(36).slice(2) + "Aa1!",
        10,
      );
      user = await prisma.user.create({
        data: {
          phone: input.phone,
          name: input.name ?? null,
          passwordHash,
          role: "USER",
        },
      });
    }

    const existing = await prisma.tenantMembership.findFirst({
      where: { tenantId, userId: user.id },
    });
    if (existing) {
      throw new AppError(
        ErrorCode.MEMBER_ALREADY_EXISTS,
        "User is already a member of this tenant",
        409,
      );
    }

    const membership = await prisma.tenantMembership.create({
      data: { tenantId, userId: user.id, role: input.role },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    res.status(201).json(
      successResponse({
        id: membership.id,
        tenantId: membership.tenantId,
        userId: membership.userId,
        role: membership.role,
        user: membership.user,
      }),
    );
  } catch (e) {
    next(e);
  }
});

adminMembersRouter.delete("/:membershipId", async (req, res, next) => {
  try {
    if (!req.tenant) {
      return next(
        new AppError(ErrorCode.TENANT_NOT_FOUND, "Tenant context missing", 404),
      );
    }
    const membership = await prisma.tenantMembership.findFirst({
      where: { id: req.params.membershipId, tenantId: req.tenant.id },
    });
    if (!membership) {
      throw new AppError(ErrorCode.NOT_FOUND, "Membership not found", 404);
    }
    await prisma.tenantMembership.delete({
      where: { id: req.params.membershipId },
    });
    res.json(successResponse({ deleted: true }));
  } catch (e) {
    next(e);
  }
});
