import { randomUUID } from "crypto";
import { z } from "zod";
import type {
  CheckoutContext,
  CheckoutSession,
  PaymentProviderAdapter,
  VerifiedPaymentEvent,
} from "../payment.ports.js";

const mockCredentialsSchema = z.object({
  simulationOutcome: z.enum(["AUTO_SUCCEED", "AUTO_FAIL", "MANUAL"]).default("MANUAL"),
});

const API_URL = process.env.API_URL ?? "http://localhost:4100";

function tenantSimulationPageUrl(
  tenantSubdomain: string | undefined,
  params: URLSearchParams,
): string {
  const mainDomain =
    process.env.MAIN_DOMAIN ??
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ??
    "lvh.me:3000";
  const webAppUrl = (
    process.env.WEB_APP_URL ??
    process.env.WEB_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const path = `/booking/payment/simulation?${params}`;

  if (!tenantSubdomain) {
    return `${webAppUrl}${path}`;
  }

  try {
    const protocol = new URL(webAppUrl).protocol;
    const [mainHost, mainPort] = mainDomain.includes(":")
      ? mainDomain.split(":")
      : [mainDomain, ""];
    const portSuffix = mainPort ? `:${mainPort}` : "";
    return `${protocol}//${tenantSubdomain}.${mainHost}${portSuffix}${path}`;
  } catch {
    return `${webAppUrl}${path}`;
  }
}

export class MockPaymentAdapter implements Omit<PaymentProviderAdapter, "code"> {
  readonly code = "MOCK" as const;

  async createCheckoutSession(
    ctx: CheckoutContext,
    credentials: Record<string, unknown>,
  ): Promise<CheckoutSession> {
    const creds = mockCredentialsSchema.parse(credentials);
    const sessionId = `MOCK-SESSION-${randomUUID()}`;
    const providerRef = `MOCK-${ctx.paymentId}`;

    const q = new URLSearchParams({
      bookingId: this._extractBookingId(ctx.successUrl) ?? "",
      clientSecret: this._extractClientSecret(ctx.successUrl) ?? "",
      paymentId: ctx.paymentId,
      providerRef,
    });

    let redirectUrl: string;

    switch (creds.simulationOutcome) {
      case "AUTO_SUCCEED":
        redirectUrl = `${API_URL}/api/v1/payments/simulation/auto?${q}&outcome=succeed`;
        break;
      case "AUTO_FAIL":
        redirectUrl = ctx.cancelUrl;
        break;
      case "MANUAL":
      default:
        redirectUrl = tenantSimulationPageUrl(ctx.tenantSubdomain, q);
        break;
    }

    return { sessionId, redirectUrl };
  }

  async verifyWebhook(): Promise<VerifiedPaymentEvent | null> {
    // MOCK provider never receives real webhooks
    return null;
  }

  async queryPayment(providerRef: string): Promise<VerifiedPaymentEvent> {
    // providerRef format: MOCK-{paymentId}
    const paymentId = providerRef.replace(/^MOCK-/, "");
    return {
      providerRef,
      amountMinor: 0,
      paymentId,
      status: "COMPLETED",
    };
  }

  private _extractBookingId(url: string): string | null {
    try {
      return new URL(url).searchParams.get("bookingId");
    } catch {
      return null;
    }
  }

  private _extractClientSecret(url: string): string | null {
    try {
      return new URL(url).searchParams.get("clientSecret");
    } catch {
      return null;
    }
  }
}
