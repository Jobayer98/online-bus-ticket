import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  credentialHintFor,
  type SystemPaymentProviderDto,
  type UpdateSystemPaymentProviderInput,
} from "@repo/shared";
import {
  decryptCredentials,
  encryptCredentials,
} from "../../lib/credential-cipher.js";
import {
  bkashCredentialsSchema,
  sslCommerzCredentialsSchema,
} from "@repo/shared";
import type { PaymentProviderCode } from "@repo/shared";
import { logPlatformAudit, type PlatformAuditActor } from "./platform-audit.service.js";

function toDto(row: {
  id: string;
  code: PaymentProviderCode;
  displayName: string;
  isEnabled: boolean;
  credentialsEncrypted: string | null;
  sandboxMode: boolean;
}): SystemPaymentProviderDto {
  let creds: Record<string, unknown> | null = null;
  if (row.credentialsEncrypted) {
    creds = decryptCredentials(row.credentialsEncrypted);
  }
  return {
    id: row.id,
    code: row.code,
    displayName: row.displayName,
    isEnabled: row.isEnabled,
    configured: Boolean(row.credentialsEncrypted),
    sandboxMode: row.sandboxMode,
    credentialHint: credentialHintFor(row.code, creds),
  };
}

export async function listSystemPaymentProviders(): Promise<
  SystemPaymentProviderDto[]
> {
  const rows = await prisma.systemPaymentProvider.findMany({
    orderBy: { code: "asc" },
  });
  return rows.map(toDto);
}

export async function updateSystemPaymentProvider(
  code: PaymentProviderCode,
  input: UpdateSystemPaymentProviderInput,
  audit: { actor: PlatformAuditActor; ipAddress?: string | null },
): Promise<SystemPaymentProviderDto> {
  const existing = await prisma.systemPaymentProvider.findUnique({
    where: { code },
  });
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, "Provider not found", 404);
  }

  let credentialsEncrypted = existing.credentialsEncrypted;
  if (input.credentials) {
    const parsed =
      code === "BKASH"
        ? bkashCredentialsSchema.parse(input.credentials)
        : sslCommerzCredentialsSchema.parse(input.credentials);
    credentialsEncrypted = encryptCredentials(parsed);
  }

  const updated = await prisma.systemPaymentProvider.update({
    where: { code },
    data: {
      isEnabled: input.isEnabled ?? existing.isEnabled,
      sandboxMode: input.sandboxMode ?? existing.sandboxMode,
      credentialsEncrypted,
    },
  });

  await logPlatformAudit({
    action: "UPDATE",
    resourceType: "SYSTEM_PAYMENT_PROVIDER",
    resourceId: updated.id,
    changes: {
      code,
      isEnabled: updated.isEnabled,
      configured: Boolean(updated.credentialsEncrypted),
    },
    ipAddress: audit.ipAddress,
    actor: audit.actor,
  });

  return toDto(updated);
}
