import type {
  PaymentProviderCode,
  PaymentSettlementRoute,
} from "@repo/shared";

export type CheckoutContext = {
  paymentId: string;
  orderId: string;
  amountMinor: number;
  customerPhone?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  sandboxMode: boolean;
};

export type CheckoutSession = {
  sessionId: string;
  redirectUrl: string;
  providerMetadata?: Record<string, unknown>;
};

export type VerifiedPaymentEvent = {
  providerRef: string;
  amountMinor: number;
  paymentId: string;
  status: "COMPLETED" | "FAILED" | "PENDING";
  raw?: unknown;
};

export type ResolvedGatewayCredentials = {
  code: PaymentProviderCode;
  settlementRoute: PaymentSettlementRoute;
  systemProviderId: string | null;
  tenantProviderId: string | null;
  sandboxMode: boolean;
  credentials: Record<string, unknown>;
};

export interface PaymentProviderAdapter {
  readonly code: PaymentProviderCode;
  createCheckoutSession(
    ctx: CheckoutContext,
    credentials: Record<string, unknown>,
  ): Promise<CheckoutSession>;
  verifyWebhook(
    rawBody: unknown,
    headers: Record<string, string>,
    credentials: Record<string, unknown>,
  ): Promise<VerifiedPaymentEvent | null>;
  queryPayment?(
    providerRef: string,
    credentials: Record<string, unknown>,
  ): Promise<VerifiedPaymentEvent>;
}
