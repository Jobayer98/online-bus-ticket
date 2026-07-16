import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  maskAccountNumber,
} from "@repo/shared";

type ReviewWithdrawalInput = { reviewNote?: string };
import { decryptPlaintext } from "../../lib/credential-cipher.js";
import { debitTenantWalletWithClient } from "../payment/tenant-wallet.service.js";
import { logPlatformAudit, type PlatformAuditActor } from "./platform-audit.service.js";

export async function listPlatformWithdrawals(status?: string) {
  const where = status ? { status: status as "PENDING" } : {};
  const rows = await prisma.withdrawalRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      bankAccount: true,
      tenant: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    tenantName: r.tenant.name,
    bankAccountId: r.bankAccountId,
    bankName: r.bankAccount.bankName,
    accountName: r.bankAccount.accountName,
    accountNumberMasked: maskAccountNumber(
      decryptPlaintext(r.bankAccount.accountNumberEncrypted),
    ),
    amountMinor: r.amountMinor,
    status: r.status,
    reviewNote: r.reviewNote,
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    paidAt: r.paidAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function approveWithdrawal(
  id: string,
  input: ReviewWithdrawalInput,
  audit: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const row = await prisma.withdrawalRequest.findUnique({
    where: { id },
    include: { bankAccount: true },
  });
  if (!row) {
    throw new AppError(ErrorCode.NOT_FOUND, "Withdrawal not found", 404);
  }
  if (row.status !== "PENDING") {
    throw new AppError(ErrorCode.CONFLICT, "Withdrawal is not pending", 409);
  }

  await prisma.$transaction(async (tx) => {
    await debitTenantWalletWithClient(tx, {
      tenantId: row.tenantId,
      amountMinor: row.amountMinor,
      referenceType: "WITHDRAWAL",
      referenceId: row.id,
      note: input.reviewNote,
    });
    await tx.withdrawalRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewNote: input.reviewNote ?? null,
        reviewedById: audit.actor.actorId ?? null,
        reviewedAt: new Date(),
      },
    });
  });

  await logPlatformAudit({
    action: "UPDATE",
    resourceType: "WITHDRAWAL",
    resourceId: id,
    changes: { status: "APPROVED", amountMinor: row.amountMinor },
    ipAddress: audit.ipAddress,
    actor: audit.actor,
  });

  return listPlatformWithdrawals();
}

export async function rejectWithdrawal(
  id: string,
  input: ReviewWithdrawalInput,
  audit: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const row = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!row) {
    throw new AppError(ErrorCode.NOT_FOUND, "Withdrawal not found", 404);
  }
  if (row.status !== "PENDING") {
    throw new AppError(ErrorCode.CONFLICT, "Withdrawal is not pending", 409);
  }

  await prisma.withdrawalRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewNote: input.reviewNote ?? null,
      reviewedById: audit.actor.actorId ?? null,
      reviewedAt: new Date(),
    },
  });

  await logPlatformAudit({
    action: "UPDATE",
    resourceType: "WITHDRAWAL",
    resourceId: id,
    changes: { status: "REJECTED" },
    ipAddress: audit.ipAddress,
    actor: audit.actor,
  });
}

export async function markWithdrawalPaid(
  id: string,
  audit: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const row = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!row) {
    throw new AppError(ErrorCode.NOT_FOUND, "Withdrawal not found", 404);
  }
  if (row.status !== "APPROVED") {
    throw new AppError(ErrorCode.CONFLICT, "Withdrawal must be approved first", 409);
  }

  await prisma.withdrawalRequest.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });

  await logPlatformAudit({
    action: "UPDATE",
    resourceType: "WITHDRAWAL",
    resourceId: id,
    changes: { status: "PAID" },
    ipAddress: audit.ipAddress,
    actor: audit.actor,
  });
}
