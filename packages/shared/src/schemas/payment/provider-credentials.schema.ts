import { z } from "zod";

export const bkashCredentialsSchema = z.object({
  appKey: z.string().min(1),
  appSecret: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  sandboxMode: z.boolean().default(true),
});

export type BkashCredentials = z.infer<typeof bkashCredentialsSchema>;

export const sslCommerzCredentialsSchema = z.object({
  storeId: z.string().min(1),
  storePassword: z.string().min(1),
  sandboxMode: z.boolean().default(true),
});

export type SslCommerzCredentials = z.infer<
  typeof sslCommerzCredentialsSchema
>;

export const providerCredentialsSchema = z.union([
  bkashCredentialsSchema.extend({ code: z.literal("BKASH") }),
  sslCommerzCredentialsSchema.extend({ code: z.literal("SSLCOMMERZ") }),
]);

export type ProviderCredentials = z.infer<typeof providerCredentialsSchema>;

/** Mask a secret for API responses */
export function maskSecret(value: string, visiblePrefix = 4): string {
  if (value.length <= visiblePrefix) return "***";
  return `${value.slice(0, visiblePrefix)}***`;
}

export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\s/g, "");
  if (digits.length <= 4) return "****";
  return `****${digits.slice(-4)}`;
}
