import {
  bkashCredentialsSchema,
  type BkashCredentials,
} from "@repo/shared";
import type {
  CheckoutContext,
  CheckoutSession,
  PaymentProviderAdapter,
  VerifiedPaymentEvent,
} from "../payment.ports.js";

type TokenResponse = {
  id_token?: string;
  statusCode?: string;
  statusMessage?: string;
};

type CreatePaymentResponse = {
  paymentID?: string;
  bkashURL?: string;
  statusCode?: string;
  statusMessage?: string;
};

type ExecutePaymentResponse = {
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  merchantInvoiceNumber?: string;
  statusCode?: string;
};

function parseCreds(credentials: Record<string, unknown>): BkashCredentials {
  return bkashCredentialsSchema.parse(credentials);
}

function baseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";
}

function majorFromMinor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function minorFromMajor(amount: string): number {
  return Math.round(parseFloat(amount) * 100);
}

export class BkashAdapter implements PaymentProviderAdapter {
  readonly code = "BKASH" as const;

  private tokenCache = new Map<string, { token: string; exp: number }>();

  async createCheckoutSession(
    ctx: CheckoutContext,
    credentials: Record<string, unknown>,
  ): Promise<CheckoutSession> {
    const creds = parseCreds(credentials);
    const token = await this.grantToken(creds);
    const url = `${baseUrl(creds.sandboxMode)}/tokenized/checkout/create`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: token,
        "x-app-key": creds.appKey,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: ctx.customerPhone ?? "01700000000",
        callbackURL: ctx.successUrl,
        amount: majorFromMinor(ctx.amountMinor),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: ctx.paymentId,
      }),
    });

    const data = (await res.json()) as CreatePaymentResponse;
    if (data.statusCode !== "0000" || !data.paymentID || !data.bkashURL) {
      throw new Error(data.statusMessage ?? "bKash create payment failed");
    }

    return {
      sessionId: data.paymentID,
      redirectUrl: data.bkashURL,
      providerMetadata: { paymentID: data.paymentID },
    };
  }

  async verifyWebhook(
    rawBody: unknown,
    _headers: Record<string, string>,
    credentials: Record<string, unknown>,
  ): Promise<VerifiedPaymentEvent | null> {
    const creds = parseCreds(credentials);
    const payload = rawBody as Record<string, string>;
    const paymentId = payload.paymentID ?? payload.paymentId;
    if (!paymentId) return null;

    return this.executeAndVerify(paymentId, creds);
  }

  async queryPayment(
    providerRef: string,
    credentials: Record<string, unknown>,
  ): Promise<VerifiedPaymentEvent> {
    const creds = parseCreds(credentials);
    const token = await this.grantToken(creds);
    const url = `${baseUrl(creds.sandboxMode)}/tokenized/checkout/payment/status`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: token,
        "x-app-key": creds.appKey,
      },
      body: JSON.stringify({ paymentID: providerRef }),
    });

    const data = (await res.json()) as ExecutePaymentResponse & {
      verificationStatus?: string;
    };

    if (
      data.transactionStatus !== "Completed" ||
      !data.trxID ||
      !data.merchantInvoiceNumber
    ) {
      throw new Error("bKash payment not completed");
    }

    return {
      providerRef: data.trxID,
      amountMinor: data.amount ? minorFromMajor(data.amount) : 0,
      paymentId: data.merchantInvoiceNumber,
      status: "COMPLETED",
      raw: data,
    };
  }

  private async executeAndVerify(
    paymentID: string,
    creds: BkashCredentials,
  ): Promise<VerifiedPaymentEvent | null> {
    const token = await this.grantToken(creds);
    const url = `${baseUrl(creds.sandboxMode)}/tokenized/checkout/execute`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: token,
        "x-app-key": creds.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = (await res.json()) as ExecutePaymentResponse;
    if (data.statusCode !== "0000") return null;
    if (data.transactionStatus !== "Completed" || !data.trxID) {
      return {
        providerRef: paymentID,
        amountMinor: data.amount ? minorFromMajor(data.amount) : 0,
        paymentId: data.merchantInvoiceNumber ?? "",
        status: "FAILED",
      };
    }

    return {
      providerRef: data.trxID,
      amountMinor: data.amount ? minorFromMajor(data.amount) : 0,
      paymentId: data.merchantInvoiceNumber ?? "",
      status: "COMPLETED",
      raw: data,
    };
  }

  private async grantToken(creds: BkashCredentials): Promise<string> {
    const cacheKey = `${creds.appKey}:${creds.sandboxMode}`;
    const cached = this.tokenCache.get(cacheKey);
    if (cached && cached.exp > Date.now()) {
      return cached.token;
    }

    const url = `${baseUrl(creds.sandboxMode)}/tokenized/checkout/token/grant`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: creds.username,
        password: creds.password,
        "x-app-key": creds.appKey,
      },
      body: JSON.stringify({
        app_key: creds.appKey,
        app_secret: creds.appSecret,
      }),
    });

    const data = (await res.json()) as TokenResponse;
    if (!data.id_token) {
      throw new Error(data.statusMessage ?? "bKash token grant failed");
    }

    this.tokenCache.set(cacheKey, {
      token: data.id_token,
      exp: Date.now() + 50 * 60 * 1000,
    });
    return data.id_token;
  }
}
