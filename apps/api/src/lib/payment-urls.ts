export function paymentWebhookBaseUrl(): string {
  const base =
    process.env.PAYMENT_WEBHOOK_BASE_URL ??
    process.env.API_URL ??
    "http://localhost:4000";
  return base.replace(/\/$/, "");
}

export function bookingPaymentUrls(
  providerCode: string,
  bookingId: string,
  scheduleId: string,
  clientSecret: string,
): {
  successUrl: string;
  cancelUrl: string;
  ipnUrl: string;
} {
  const base = paymentWebhookBaseUrl();
  const q = new URLSearchParams({
    bookingId,
    scheduleId,
    clientSecret,
  });
  return {
    successUrl: `${base}/api/v1/payments/callback/${providerCode}?${q}&status=success`,
    cancelUrl: `${base}/api/v1/payments/callback/${providerCode}?${q}&status=cancel`,
    ipnUrl: `${base}/api/v1/payments/webhook/${providerCode}`,
  };
}

export function invoicePaymentUrls(
  providerCode: string,
  invoiceId: string,
  clientSecret: string,
): {
  successUrl: string;
  cancelUrl: string;
  ipnUrl: string;
} {
  const base = paymentWebhookBaseUrl();
  const q = new URLSearchParams({ invoiceId, clientSecret });
  return {
    successUrl: `${base}/api/v1/payments/callback/${providerCode}?${q}&status=success&type=invoice`,
    cancelUrl: `${base}/api/v1/payments/callback/${providerCode}?${q}&status=cancel&type=invoice`,
    ipnUrl: `${base}/api/v1/payments/webhook/${providerCode}`,
  };
}
