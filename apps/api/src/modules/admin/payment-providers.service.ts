import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  credentialHintFor,
  type CreateBankAccountInput,
  type CreateWithdrawalInput,
  type PaymentProviderCode,
  type TenantPaymentProviderDto,
  type UpsertTenantPaymentProviderInput,
  maskAccountNumber,
} from "@repo/shared";
import {
  decryptCredentials,
  decryptPlaintext,
  encryptPlaintext,
} from "../../lib/credential-cipher.js";
import {
  getOrCreateWallet,
  listLedgerEntries,
} from "../payment/tenant-wallet.service.js";

const DISPLAY_NAMES: Record<PaymentProviderCode, string> = {
  BKASH: "bKash",
  SSLCOMMERZ: "SSLCommerz",
};

export async function listTenantPaymentProviders(
  tenantId: string,
): Promise<TenantPaymentProviderDto[]> {
  const systemProviders = await prisma.systemPaymentProvider.findMany();
  const tenantProviders = await prisma.tenantPaymentProvider.findMany({
    where: { tenantId },
  });
  const tenantMap = new Map(tenantProviders.map((p) => [p.code, p]));

  const activeOwn = tenantProviders.filter(
    (p) => p.isActive && p.credentialsEncrypted,
  );

  return systemProviders.map((sys) => {
    const tenant = tenantMap.get(sys.code);
    let creds: Record<string, unknown> | null = null;
    if (tenant?.credentialsEncrypted) {
      creds = decryptCredentials(tenant.credentialsEncrypted);
    }
    const configured = Boolean(tenant?.credentialsEncrypted);
    const isActiveOwn = Boolean(tenant?.isActive && configured);
    const usesSystem =
      activeOwn.length === 0 && sys.isEnabled && sys.credentialsEncrypted;

    let settlementRoute: "TENANT_DIRECT" | "SYSTEM" | null = null;
    if (isActiveOwn) settlementRoute = "TENANT_DIRECT";
    else if (usesSystem) settlementRoute = "SYSTEM";

    return {
      code: sys.code,
      displayName: DISPLAY_NAMES[sys.code],
      systemEnabled: sys.isEnabled,
      isActive: tenant?.isActive ?? false,
      configured,
      sandboxMode: tenant?.sandboxMode ?? sys.sandboxMode,
      credentialHint: credentialHintFor(sys.code, creds),
      settlementRoute,
    };
  });
}

export async function upsertTenantPaymentProvider(
  tenantId: string,
  code: PaymentProviderCode,
  _input: UpsertTenantPaymentProviderInput,
): Promise<TenantPaymentProviderDto> {
  const system = await prisma.systemPaymentProvider.findUnique({
    where: { code },
  });
  if (!system?.isEnabled) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Provider is not enabled by platform",
      400,
    );
  }

  // const row = await prisma.tenantPaymentProvider.upsert({
  //   where: { tenantId_code: { tenantId, code } },
  //   create: {
  //     tenantId,
  //     code,
  //     isActive: input.isActive ?? false,
  //     sandboxMode: input.sandboxMode ?? true,
  //     credentialsEncrypted,
  //   },
  //   update: {
  //     isActive: input.isActive ?? existing?.isActive ?? false,
  //     sandboxMode: input.sandboxMode ?? existing?.sandboxMode ?? true,
  //     credentialsEncrypted: credentialsEncrypted ?? undefined,
  //   },
  // });

  const list = await listTenantPaymentProviders(tenantId);
  return list.find((p) => p.code === code)!;
}

export async function deleteTenantPaymentProvider(
  tenantId: string,
  code: PaymentProviderCode,
): Promise<void> {
  await prisma.tenantPaymentProvider.deleteMany({
    where: { tenantId, code },
  });
}

export async function getTenantWalletSummary(tenantId: string) {
  const { wallet, entries } = await listLedgerEntries(tenantId);
  return {
    wallet: { balanceMinor: wallet.balanceMinor },
    entries: entries.map((e) => ({
      id: e.id,
      type: e.type,
      amountMinor: e.amountMinor,
      balanceAfterMinor: e.balanceAfterMinor,
      referenceType: e.referenceType,
      referenceId: e.referenceId,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export async function createBankAccount(
  tenantId: string,
  input: CreateBankAccountInput,
) {
  if (input.isDefault) {
    await prisma.tenantBankAccount.updateMany({
      where: { tenantId },
      data: { isDefault: false },
    });
  }

  const row = await prisma.tenantBankAccount.create({
    data: {
      tenantId,
      bankName: input.bankName,
      accountName: input.accountName,
      accountNumberEncrypted: encryptPlaintext(input.accountNumber),
      isDefault: input.isDefault ?? false,
    },
  });

  return {
    id: row.id,
    bankName: row.bankName,
    accountName: row.accountName,
    accountNumberMasked: maskAccountNumber(input.accountNumber),
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listBankAccounts(tenantId: string) {
  const rows = await prisma.tenantBankAccount.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    bankName: row.bankName,
    accountName: row.accountName,
    accountNumberMasked: maskAccountNumber(
      decryptPlaintext(row.accountNumberEncrypted),
    ),
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function deleteBankAccount(tenantId: string, id: string) {
  const row = await prisma.tenantBankAccount.findFirst({
    where: { id, tenantId },
  });
  if (!row) {
    throw new AppError(ErrorCode.NOT_FOUND, "Bank account not found", 404);
  }
  await prisma.tenantBankAccount.delete({ where: { id } });
}

export async function createWithdrawalRequest(
  tenantId: string,
  input: CreateWithdrawalInput,
) {
  const wallet = await getOrCreateWallet(tenantId);
  if (wallet.balanceMinor < input.amountMinor) {
    throw new AppError(ErrorCode.CONFLICT, "Insufficient wallet balance", 409);
  }

  const account = await prisma.tenantBankAccount.findFirst({
    where: { id: input.bankAccountId, tenantId },
  });
  if (!account) {
    throw new AppError(ErrorCode.NOT_FOUND, "Bank account not found", 404);
  }

  const pending = await prisma.withdrawalRequest.count({
    where: { tenantId, status: "PENDING" },
  });
  if (pending > 0) {
    throw new AppError(
      ErrorCode.CONFLICT,
      "A withdrawal request is already pending",
      409,
    );
  }

  const row = await prisma.withdrawalRequest.create({
    data: {
      tenantId,
      bankAccountId: input.bankAccountId,
      amountMinor: input.amountMinor,
    },
  });

  return formatWithdrawal(row, account);
}

export async function listTenantWithdrawals(tenantId: string) {
  const rows = await prisma.withdrawalRequest.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { bankAccount: true },
  });
  return rows.map((r) => formatWithdrawal(r, r.bankAccount));
}

function formatWithdrawal(
  row: {
    id: string;
    tenantId: string;
    bankAccountId: string;
    amountMinor: number;
    status: string;
    reviewNote: string | null;
    reviewedAt: Date | null;
    paidAt: Date | null;
    createdAt: Date;
  },
  account: {
    bankName: string;
    accountName: string;
    accountNumberEncrypted: string;
  },
) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    bankAccountId: row.bankAccountId,
    bankName: account.bankName,
    accountName: account.accountName,
    accountNumberMasked: maskAccountNumber(
      decryptPlaintext(account.accountNumberEncrypted),
    ),
    amountMinor: row.amountMinor,
    status: row.status as "PENDING" | "APPROVED" | "REJECTED" | "PAID",
    reviewNote: row.reviewNote,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}
