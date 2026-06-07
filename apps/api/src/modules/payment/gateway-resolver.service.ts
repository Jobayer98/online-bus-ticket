import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  bkashCredentialsSchema,
  sslCommerzCredentialsSchema,
  type PaymentProviderCode,
} from "@repo/shared";
import { decryptCredentials } from "../../lib/credential-cipher.js";
import type { ResolvedGatewayCredentials } from "./payment.ports.js";

export type GatewayOption = {
  code: PaymentProviderCode;
  displayName: string;
  settlementRoute: "TENANT_DIRECT" | "SYSTEM";
};

const DISPLAY_NAMES: Record<PaymentProviderCode, string> = {
  BKASH: "bKash",
  SSLCOMMERZ: "SSLCommerz",
};

function parseCredentials(
  code: PaymentProviderCode,
  encrypted: string,
): Record<string, unknown> {
  const raw = decryptCredentials<Record<string, unknown>>(encrypted);
  if (code === "BKASH") {
    return bkashCredentialsSchema.parse(raw);
  }
  return sslCommerzCredentialsSchema.parse(raw);
}

export async function listAvailableGateways(
  tenantId: string | null,
): Promise<GatewayOption[]> {
  if (!tenantId) {
    return listSystemGateways();
  }

  const tenantProviders = await prisma.tenantPaymentProvider.findMany({
    where: {
      tenantId,
      isActive: true,
      credentialsEncrypted: { not: null },
    },
  });

  const enabledSystem = await prisma.systemPaymentProvider.findMany({
    where: { isEnabled: true },
    select: { code: true },
  });
  const enabledCodes = new Set(enabledSystem.map((p) => p.code));

  const activeTenant = tenantProviders.filter((p) =>
    enabledCodes.has(p.code),
  );

  if (activeTenant.length > 0) {
    return activeTenant.map((p) => ({
      code: p.code,
      displayName: DISPLAY_NAMES[p.code],
      settlementRoute: "TENANT_DIRECT" as const,
    }));
  }

  return listSystemGateways();
}

async function listSystemGateways(): Promise<GatewayOption[]> {
  const rows = await prisma.systemPaymentProvider.findMany({
    where: {
      isEnabled: true,
      credentialsEncrypted: { not: null },
    },
  });
  return rows.map((p) => ({
    code: p.code,
    displayName: p.displayName,
    settlementRoute: "SYSTEM" as const,
  }));
}

export async function resolveGatewayForPayment(
  tenantId: string | null,
  providerCode: PaymentProviderCode,
): Promise<ResolvedGatewayCredentials> {
  const systemRow = await prisma.systemPaymentProvider.findUnique({
    where: { code: providerCode },
  });
  if (!systemRow?.isEnabled) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Payment provider is not available",
      400,
    );
  }

  if (tenantId) {
    const tenantRow = await prisma.tenantPaymentProvider.findUnique({
      where: { tenantId_code: { tenantId, code: providerCode } },
    });
    if (
      tenantRow?.isActive &&
      tenantRow.credentialsEncrypted
    ) {
      return {
        code: providerCode,
        settlementRoute: "TENANT_DIRECT",
        systemProviderId: null,
        tenantProviderId: tenantRow.id,
        sandboxMode: tenantRow.sandboxMode,
        credentials: parseCredentials(
          providerCode,
          tenantRow.credentialsEncrypted,
        ),
      };
    }
  }

  if (!systemRow.credentialsEncrypted) {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Payment provider is not configured",
      409,
    );
  }

  return {
    code: providerCode,
    settlementRoute: "SYSTEM",
    systemProviderId: systemRow.id,
    tenantProviderId: null,
    sandboxMode: systemRow.sandboxMode,
    credentials: parseCredentials(
      providerCode,
      systemRow.credentialsEncrypted,
    ),
  };
}

export async function resolveSystemGatewayOnly(
  providerCode: PaymentProviderCode,
): Promise<ResolvedGatewayCredentials> {
  const systemRow = await prisma.systemPaymentProvider.findUnique({
    where: { code: providerCode },
  });
  if (!systemRow?.isEnabled || !systemRow.credentialsEncrypted) {
    throw new AppError(
      ErrorCode.CONFLICT,
      "System payment provider is not configured",
      409,
    );
  }
  return {
    code: providerCode,
    settlementRoute: "SYSTEM",
    systemProviderId: systemRow.id,
    tenantProviderId: null,
    sandboxMode: systemRow.sandboxMode,
    credentials: parseCredentials(
      providerCode,
      systemRow.credentialsEncrypted,
    ),
  };
}
