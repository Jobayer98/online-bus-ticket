import type { PaymentProviderCode } from "@repo/shared";
import { BkashAdapter } from "./adapters/bkash.adapter.js";
import { SslCommerzAdapter } from "./adapters/sslcommerz.adapter.js";
import type { PaymentProviderAdapter } from "./payment.ports.js";

const adapters = new Map<PaymentProviderCode, PaymentProviderAdapter>();

function register(adapter: PaymentProviderAdapter): void {
  adapters.set(adapter.code, adapter);
}

export function getPaymentAdapter(
  code: PaymentProviderCode,
): PaymentProviderAdapter {
  const adapter = adapters.get(code);
  if (!adapter) {
    throw new Error(`No payment adapter registered for ${code}`);
  }
  return adapter;
}

export function listRegisteredAdapters(): PaymentProviderCode[] {
  return [...adapters.keys()];
}

register(new BkashAdapter());
register(new SslCommerzAdapter());
