import { createHash } from "node:crypto";
import {
  sslCommerzCredentialsSchema,
  type SslCommerzCredentials,
} from "@repo/shared";
import type {
  CheckoutContext,
  CheckoutSession,
  PaymentProviderAdapter,
  VerifiedPaymentEvent,
} from "../payment.ports.js";

function baseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";
}

function parseCreds(credentials: Record<string, unknown>): SslCommerzCredentials {
  return sslCommerzCredentialsSchema.parse(credentials);
}

function minorToMajor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

function majorToMinor(amountMajor: string): number {
  return Math.round(parseFloat(amountMajor) * 100);
}

export class SslCommerzAdapter implements PaymentProviderAdapter {
  readonly code = "SSLCOMMERZ" as const;

  async createCheckoutSession(
    ctx: CheckoutContext,
    credentials: Record<string, unknown>,
  ): Promise<CheckoutSession> {
    const creds = parseCreds(credentials);
    const url = `${baseUrl(creds.sandboxMode)}/gwprocess/v4/api.php`;

    const body = new URLSearchParams({
      store_id: creds.storeId,
      store_passwd: creds.storePassword,
      total_amount: minorToMajor(ctx.amountMinor),
      currency: "BDT",
      tran_id: ctx.paymentId,
      success_url: ctx.successUrl,
      fail_url: ctx.cancelUrl,
      cancel_url: ctx.cancelUrl,
      ipn_url: ctx.ipnUrl,
      cus_name: ctx.customerName ?? "Customer",
      cus_phone: ctx.customerPhone ?? "01700000000",
      product_name: "Bus ticket",
      product_category: "Travel",
      product_profile: "general",
      shipping_method: "NO",
      num_of_item: "1",
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await res.json()) as {
      status?: string;
      GatewayPageURL?: string;
      sessionkey?: string;
      failedreason?: string;
    };

    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      throw new Error(data.failedreason ?? "SSLCommerz session creation failed");
    }

    return {
      sessionId: data.sessionkey ?? ctx.paymentId,
      redirectUrl: data.GatewayPageURL,
    };
  }

  async verifyWebhook(
    rawBody: unknown,
    _headers: Record<string, string>,
    credentials: Record<string, unknown>,
  ): Promise<VerifiedPaymentEvent | null> {
    const creds = parseCreds(credentials);
    const payload = rawBody as Record<string, string>;
    const status = payload.status;
    const tranId = payload.tran_id;
    const valId = payload.val_id;
    const amount = payload.amount ?? payload.currency_amount;
    const verifyKey = payload.verify_key;
    const verifySign = payload.verify_sign;

    if (!tranId || !status) return null;

    if (verifyKey && verifySign) {
      const keys = verifyKey.split(",").map((k) => k.trim());
      const parts: string[] = [];
      for (const key of keys.sort()) {
        if (payload[key] !== undefined) {
          parts.push(`${key}=${payload[key]}`);
        }
      }
      const data = parts.join("&");
      const expected = createHash("md5")
        .update(data + creds.storePassword)
        .digest("hex");
      if (expected !== verifySign) {
        return null;
      }
    }

    if (status !== "VALID" && status !== "VALIDATED") {
      if (status === "FAILED" || status === "CANCELLED") {
        return {
          providerRef: valId ?? tranId,
          amountMinor: amount ? majorToMinor(amount) : 0,
          paymentId: tranId,
          status: "FAILED",
        };
      }
      return null;
    }

    if (valId) {
      const validated = await this.validateTransaction(valId, creds);
      if (!validated) return null;
      return {
        providerRef: valId,
        amountMinor: validated.amountMinor,
        paymentId: tranId,
        status: "COMPLETED",
        raw: validated.raw,
      };
    }

    return {
      providerRef: tranId,
      amountMinor: amount ? majorToMinor(amount) : 0,
      paymentId: tranId,
      status: "COMPLETED",
    };
  }

  async queryPayment(
    providerRef: string,
    credentials: Record<string, unknown>,
  ): Promise<VerifiedPaymentEvent> {
    const creds = parseCreds(credentials);
    const validated = await this.validateTransaction(providerRef, creds);
    if (!validated || validated.status !== "VALID") {
      throw new Error("SSLCommerz validation failed");
    }
    return {
      providerRef,
      amountMinor: validated.amountMinor,
      paymentId: validated.tranId,
      status: "COMPLETED",
      raw: validated.raw,
    };
  }

  private async validateTransaction(
    valId: string,
    creds: SslCommerzCredentials,
  ): Promise<{
    status: string;
    amountMinor: number;
    tranId: string;
    raw: unknown;
  } | null> {
    const url = `${baseUrl(creds.sandboxMode)}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(creds.storeId)}&store_passwd=${encodeURIComponent(creds.storePassword)}&format=json`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status?: string;
      tran_id?: string;
      amount?: string;
      currency_amount?: string;
    };
    if (!data.status || !data.tran_id) return null;
    const amt = data.currency_amount ?? data.amount ?? "0";
    return {
      status: data.status,
      amountMinor: majorToMinor(amt),
      tranId: data.tran_id,
      raw: data,
    };
  }
}
