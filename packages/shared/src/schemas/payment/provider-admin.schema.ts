import { z } from "zod";
import { paymentProviderCodeSchema } from "../../enums/payment-provider.js";
import {
  bkashCredentialsSchema,
  sslCommerzCredentialsSchema,
  maskSecret,
} from "../payment/provider-credentials.schema.js";

export const systemPaymentProviderDtoSchema = z.object({
  id: z.string(),
  code: paymentProviderCodeSchema,
  displayName: z.string(),
  isEnabled: z.boolean(),
  configured: z.boolean(),
  sandboxMode: z.boolean(),
  credentialHint: z.string().nullable(),
});

export type SystemPaymentProviderDto = z.infer<
  typeof systemPaymentProviderDtoSchema
>;

export const updateSystemPaymentProviderSchema = z.object({
  isEnabled: z.boolean().optional(),
  sandboxMode: z.boolean().optional(),
  credentials: z
    .union([bkashCredentialsSchema, sslCommerzCredentialsSchema])
    .optional(),
});

export type UpdateSystemPaymentProviderInput = z.infer<
  typeof updateSystemPaymentProviderSchema
>;

export const tenantPaymentProviderDtoSchema = z.object({
  code: paymentProviderCodeSchema,
  displayName: z.string(),
  systemEnabled: z.boolean(),
  isActive: z.boolean(),
  configured: z.boolean(),
  sandboxMode: z.boolean(),
  credentialHint: z.string().nullable(),
  settlementRoute: z.enum(["TENANT_DIRECT", "SYSTEM"]).nullable(),
});

export type TenantPaymentProviderDto = z.infer<
  typeof tenantPaymentProviderDtoSchema
>;

export const upsertTenantPaymentProviderSchema = z.object({
  isActive: z.boolean().optional(),
  sandboxMode: z.boolean().optional(),
  credentials: z
    .union([bkashCredentialsSchema, sslCommerzCredentialsSchema])
    .optional(),
});

export type UpsertTenantPaymentProviderInput = z.infer<
  typeof upsertTenantPaymentProviderSchema
>;

export const tenantWalletDtoSchema = z.object({
  balanceMinor: z.number().int(),
});

export const tenantLedgerEntryDtoSchema = z.object({
  id: z.string(),
  type: z.enum(["CREDIT", "DEBIT"]),
  amountMinor: z.number().int(),
  balanceAfterMinor: z.number().int(),
  referenceType: z.string(),
  referenceId: z.string(),
  note: z.string().nullable(),
  createdAt: z.string(),
});

export const tenantWalletSummaryDtoSchema = z.object({
  wallet: tenantWalletDtoSchema,
  entries: z.array(tenantLedgerEntryDtoSchema),
});

export const createBankAccountSchema = z.object({
  bankName: z.string().min(1).max(120),
  accountName: z.string().min(1).max(120),
  accountNumber: z.string().min(4).max(40),
  isDefault: z.boolean().optional(),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;

export const bankAccountDtoSchema = z.object({
  id: z.string(),
  bankName: z.string(),
  accountName: z.string(),
  accountNumberMasked: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
});

export const createWithdrawalSchema = z.object({
  bankAccountId: z.string().cuid(),
  amountMinor: z.number().int().positive(),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;

export const withdrawalRequestDtoSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenantName: z.string().optional(),
  bankAccountId: z.string(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumberMasked: z.string().optional(),
  amountMinor: z.number().int(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID"]),
  reviewNote: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
});

export const reviewWithdrawalSchema = z.object({
  reviewNote: z.string().max(500).optional(),
});

export type ReviewWithdrawalInput = z.infer<typeof reviewWithdrawalSchema>;

export const payPlatformInvoiceSchema = z.object({
  providerCode: paymentProviderCodeSchema,
});

export function credentialHintFor(
  code: "BKASH" | "SSLCOMMERZ",
  creds: Record<string, unknown> | null,
): string | null {
  if (!creds) return null;
  if (code === "BKASH") {
    const key = String(creds.appKey ?? "");
    return key ? maskSecret(key) : null;
  }
  const storeId = String(creds.storeId ?? "");
  return storeId ? maskSecret(storeId) : null;
}
