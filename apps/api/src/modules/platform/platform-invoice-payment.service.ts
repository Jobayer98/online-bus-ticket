import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  type PaymentProviderCode,
} from "@repo/shared";
import {
  createPaymentClientSecret,
  paymentSigningSecret,
  verifyPaymentClientSecret,
} from "../../lib/payment-client-secret.js";
import { invoicePaymentUrls } from "../../lib/payment-urls.js";
import { resolveSystemGatewayOnly } from "../payment/gateway-resolver.service.js";
import { getPaymentAdapter } from "../payment/payment.providers.js";
import { logPlatformAudit, type PlatformAuditActor } from "./platform-audit.service.js";

function webAppBaseUrl(): string {
  return (
    process.env.WEB_APP_URL ??
    process.env.NEXT_PUBLIC_WEB_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function initiateInvoicePayment(
  invoiceId: string,
  providerCode: PaymentProviderCode,
  audit: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const invoice = await prisma.platformInvoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: true },
  });
  if (!invoice) {
    throw new AppError(ErrorCode.NOT_FOUND, "Invoice not found", 404);
  }
  if (invoice.status === "PAID") {
    throw new AppError(ErrorCode.CONFLICT, "Invoice already paid", 409);
  }

  const gateway = await resolveSystemGatewayOnly(providerCode);
  const adapter = getPaymentAdapter(providerCode);

  const payment = await prisma.payment.upsert({
    where: { platformInvoiceId: invoice.id },
    create: {
      platformInvoiceId: invoice.id,
      amount: invoice.amountMinor,
      method: "ONLINE",
      status: "PENDING",
      providerCode: gateway.code,
      settlementRoute: "SYSTEM",
      systemProviderId: gateway.systemProviderId,
    },
    update: {
      amount: invoice.amountMinor,
      status: "PENDING",
      providerCode: gateway.code,
      settlementRoute: "SYSTEM",
      systemProviderId: gateway.systemProviderId,
      providerRef: null,
      providerSessionId: null,
    },
  });

  const clientSecret = createPaymentClientSecret(paymentSigningSecret(), {
    paymentId: payment.id,
    bookingId: invoice.id,
    exp: Date.now() + 30 * 60 * 1000,
  });

  const urls = invoicePaymentUrls(providerCode, invoice.id, clientSecret);
  const session = await adapter.createCheckoutSession(
    {
      paymentId: payment.id,
      orderId: payment.id,
      amountMinor: payment.amount,
      customerName: invoice.tenant.name,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
      ipnUrl: urls.ipnUrl,
      sandboxMode: gateway.sandboxMode,
    },
    gateway.credentials,
  );

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerSessionId: session.sessionId },
  });

  await logPlatformAudit({
    action: "UPDATE",
    resourceType: "TENANT",
    resourceId: invoice.tenantId,
    changes: { invoiceId, paymentInitiated: true, providerCode },
    ipAddress: audit.ipAddress,
    actor: audit.actor,
  });

  return {
    invoiceId: invoice.id,
    paymentId: payment.id,
    redirectUrl: session.redirectUrl,
    clientSecret,
  };
}

export async function confirmInvoicePaymentFromWebhook(
  paymentId: string,
  providerRef: string,
  amountMinor: number,
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { platformInvoice: true },
  });
  if (!payment?.platformInvoiceId || !payment.platformInvoice) return;
  if (payment.status === "COMPLETED") return;
  if (amountMinor !== payment.amount) {
    throw new AppError(ErrorCode.CONFLICT, "Invoice payment amount mismatch", 409);
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "COMPLETED", providerRef },
    });
    await tx.platformInvoice.update({
      where: { id: payment.platformInvoiceId! },
      data: { status: "PAID", paidAt: new Date() },
    });
    await tx.subscription.update({
      where: { id: payment.platformInvoice!.subscriptionId },
      data: { status: "ACTIVE" },
    });
  });
}

export async function confirmInvoicePaymentCallback(query: {
  invoiceId?: string;
  clientSecret?: string;
  status?: string;
  val_id?: string;
  paymentID?: string;
  providerCode?: PaymentProviderCode;
}): Promise<{ redirectUrl: string }> {
  const base = webAppBaseUrl();
  if (query.status === "cancel" || !query.invoiceId || !query.clientSecret) {
    return { redirectUrl: `${base}/platform?tab=billing&cancelled=1` };
  }

  verifyPaymentClientSecret(
    paymentSigningSecret(),
    query.clientSecret,
    query.invoiceId,
  );

  const payment = await prisma.payment.findUnique({
    where: { platformInvoiceId: query.invoiceId },
  });
  if (!payment?.providerCode) {
    return { redirectUrl: `${base}/platform?tab=billing&error=1` };
  }

  const gateway = await resolveSystemGatewayOnly(payment.providerCode);
  const adapter = getPaymentAdapter(payment.providerCode);

  let providerRef: string | null = null;
  let amountMinor = payment.amount;

  if (query.val_id && adapter.queryPayment) {
    const verified = await adapter.queryPayment(query.val_id, gateway.credentials);
    providerRef = verified.providerRef;
    amountMinor = verified.amountMinor;
  } else if (query.paymentID) {
    const verified = await adapter.verifyWebhook(
      { paymentID: query.paymentID },
      {},
      gateway.credentials,
    );
    if (verified?.status === "COMPLETED") {
      providerRef = verified.providerRef;
      amountMinor = verified.amountMinor;
    }
  }

  if (providerRef) {
    await confirmInvoicePaymentFromWebhook(payment.id, providerRef, amountMinor);
  }

  return { redirectUrl: `${base}/platform?tab=billing&paid=1` };
}

export async function processInvoiceWebhook(
  providerCode: PaymentProviderCode,
  rawBody: unknown,
  headers: Record<string, string>,
) {
  const payload = rawBody as Record<string, string>;
  const paymentId = payload.tran_id ?? payload.merchantInvoiceNumber;
  if (!paymentId) return { handled: false };

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ id: paymentId }, { providerSessionId: paymentId }],
      providerCode,
      platformInvoiceId: { not: null },
    },
  });
  if (!payment) return { handled: false };
  if (payment.status === "COMPLETED") return { handled: true };

  const gateway = await resolveSystemGatewayOnly(providerCode);
  const adapter = getPaymentAdapter(providerCode);
  const verified = await adapter.verifyWebhook(rawBody, headers, gateway.credentials);
  if (!verified || verified.status !== "COMPLETED") return { handled: true };

  await confirmInvoicePaymentFromWebhook(
    payment.id,
    verified.providerRef,
    verified.amountMinor,
  );
  return { handled: true };
}
