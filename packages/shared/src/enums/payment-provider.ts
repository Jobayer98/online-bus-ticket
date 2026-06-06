import { z } from "zod";

export const paymentProviderCodeSchema = z.enum(["BKASH", "SSLCOMMERZ"]);
export type PaymentProviderCode = z.infer<typeof paymentProviderCodeSchema>;

export const paymentSettlementRouteSchema = z.enum([
  "TENANT_DIRECT",
  "SYSTEM",
]);
export type PaymentSettlementRoute = z.infer<
  typeof paymentSettlementRouteSchema
>;

export const withdrawalStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PAID",
]);
export type WithdrawalStatus = z.infer<typeof withdrawalStatusSchema>;

export const ledgerEntryTypeSchema = z.enum(["CREDIT", "DEBIT"]);
export type LedgerEntryType = z.infer<typeof ledgerEntryTypeSchema>;
