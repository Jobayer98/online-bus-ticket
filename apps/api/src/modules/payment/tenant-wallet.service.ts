import { prisma } from "@repo/database";
import type { LedgerReferenceType } from "@repo/database";
import type { DbClient } from "../../lib/db-client.js";

export async function creditTenantWalletWithClient(
  db: DbClient,
  input: {
    tenantId: string;
    amountMinor: number;
    referenceType: LedgerReferenceType;
    referenceId: string;
    note?: string;
  },
): Promise<void> {
  const existing = await db.tenantWallet.findUnique({
    where: { tenantId: input.tenantId },
  });
  const previousBalance = existing?.balanceMinor ?? 0;
  const newBalance = previousBalance + input.amountMinor;

  await db.tenantWallet.upsert({
    where: { tenantId: input.tenantId },
    create: { tenantId: input.tenantId, balanceMinor: newBalance },
    update: { balanceMinor: newBalance },
  });

  await db.tenantLedgerEntry.create({
    data: {
      tenantId: input.tenantId,
      type: "CREDIT",
      amountMinor: input.amountMinor,
      balanceAfterMinor: newBalance,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      note: input.note,
    },
  });
}

export async function debitTenantWalletWithClient(
  db: DbClient,
  input: {
    tenantId: string;
    amountMinor: number;
    referenceType: LedgerReferenceType;
    referenceId: string;
    note?: string;
  },
): Promise<void> {
  const wallet = await db.tenantWallet.findUnique({
    where: { tenantId: input.tenantId },
  });
  if (!wallet || wallet.balanceMinor < input.amountMinor) {
    throw new Error("INSUFFICIENT_WALLET_BALANCE");
  }

  const updated = await db.tenantWallet.updateMany({
    where: {
      tenantId: input.tenantId,
      balanceMinor: { gte: input.amountMinor },
    },
    data: { balanceMinor: { decrement: input.amountMinor } },
  });
  if (updated.count !== 1) {
    throw new Error("INSUFFICIENT_WALLET_BALANCE");
  }

  const newBalance = wallet.balanceMinor - input.amountMinor;
  await db.tenantLedgerEntry.create({
    data: {
      tenantId: input.tenantId,
      type: "DEBIT",
      amountMinor: input.amountMinor,
      balanceAfterMinor: newBalance,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      note: input.note,
    },
  });
}

export async function getOrCreateWallet(tenantId: string) {
  return prisma.tenantWallet.upsert({
    where: { tenantId },
    create: { tenantId, balanceMinor: 0 },
    update: {},
  });
}

export async function listLedgerEntries(tenantId: string, limit = 50) {
  const wallet = await getOrCreateWallet(tenantId);
  const entries = await prisma.tenantLedgerEntry.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return { wallet, entries };
}
