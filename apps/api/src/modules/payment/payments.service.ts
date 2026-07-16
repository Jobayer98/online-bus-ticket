import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  SEAT_HOLD_PAYMENT_TTL_MS,
  type ConfirmPaymentResponseDto,
  type InitiatePaymentInput,
  type InitiatePaymentResponseDto,
  type PaymentProviderCode,
} from "@repo/shared";
import {
  createPaymentClientSecret,
  paymentSigningSecret,
  verifyPaymentClientSecret,
} from "../../lib/payment-client-secret.js";
import { bookingPaymentUrls } from "../../lib/payment-urls.js";
import type { DbClient } from "../../lib/db-client.js";
import { enqueueBookingNotifications } from "../../jobs/dispatch-notifications.js";
import {
  issueTicket,
  issueTicketWithClient,
  toIssuedTicket,
  type IssuedTicket,
} from "../ticket/tickets.service.js";
import {
  listAvailableGateways,
  resolveGatewayForPayment,
} from "./gateway-resolver.service.js";
import { getPaymentAdapter } from "./payment.providers.js";
import { creditTenantWalletWithClient } from "./tenant-wallet.service.js";
import type { VerifiedPaymentEvent } from "./payment.ports.js";

type BookingForPayment = {
  id: string;
  tenantId: string | null;
  status: string;
  totalAmount: number;
  passengerName: string;
  passengerPhone: string;
  scheduleId: string;
  hold: { expiresAt: Date } | null;
};

function assertBookingPayable(booking: BookingForPayment): void {
  if (booking.status === "PAID") {
    throw new AppError(ErrorCode.CONFLICT, "Already paid", 409);
  }
  if (booking.status === "CANCELLED") {
    throw new AppError(ErrorCode.CONFLICT, "Booking cancelled", 409);
  }
  if (booking.status === "REFUNDED") {
    throw new AppError(ErrorCode.CONFLICT, "Booking refunded", 409);
  }
  if (booking.status !== "HELD") {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Booking is not ready for payment",
      409,
    );
  }
  const holdExpiresAt =
    booking.hold?.expiresAt ??
    new Date(Date.now() + SEAT_HOLD_PAYMENT_TTL_MS);
  if (holdExpiresAt < new Date()) {
    throw new AppError(ErrorCode.HOLD_EXPIRED, "Hold expired", 409);
  }
}

export async function listPaymentGateways(tenantId: string | null) {
  const gateways = await listAvailableGateways(tenantId);
  return { gateways };
}

export async function initiatePaymentWithClient(
  db: DbClient,
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResponseDto> {
  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    include: {
      hold: true,
      tenant: { select: { subdomainPrefix: true, slug: true } },
    },
  });
  if (!booking) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);
  }
  assertBookingPayable(booking);

  const holdExpiresAt =
    booking.hold?.expiresAt ??
    new Date(Date.now() + SEAT_HOLD_PAYMENT_TTL_MS);

  if (input.method === "CASH") {
    const payment = await db.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        method: input.method,
        status: "PENDING",
      },
      update: {
        method: input.method,
        status: "PENDING",
        amount: booking.totalAmount,
      },
    });
    const clientSecret = createPaymentClientSecret(paymentSigningSecret(), {
      paymentId: payment.id,
      bookingId: booking.id,
      exp: holdExpiresAt.getTime(),
    });
    return {
      paymentId: payment.id,
      bookingId: booking.id,
      amount: payment.amount,
      method: payment.method,
      clientSecret,
    };
  }

  if (!input.providerCode) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "providerCode is required for online payment",
      400,
    );
  }

  const gateway = await resolveGatewayForPayment(
    booking.tenantId,
    input.providerCode,
  );
  const adapter = getPaymentAdapter(gateway.code);

  const payment = await db.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      method: input.method,
      status: "PENDING",
      providerCode: gateway.code,
      settlementRoute: gateway.settlementRoute,
      systemProviderId: gateway.systemProviderId,
      tenantProviderId: gateway.tenantProviderId,
    },
    update: {
      method: input.method,
      status: "PENDING",
      amount: booking.totalAmount,
      providerCode: gateway.code,
      settlementRoute: gateway.settlementRoute,
      systemProviderId: gateway.systemProviderId,
      tenantProviderId: gateway.tenantProviderId,
      providerRef: null,
      providerSessionId: null,
    },
  });

  const clientSecret = createPaymentClientSecret(paymentSigningSecret(), {
    paymentId: payment.id,
    bookingId: booking.id,
    exp: holdExpiresAt.getTime(),
  });

  const urls = bookingPaymentUrls(
    gateway.code,
    booking.id,
    input.scheduleId ?? booking.scheduleId,
    clientSecret,
  );

  const tenantSubdomain =
    booking.tenant?.subdomainPrefix ?? booking.tenant?.slug ?? undefined;

  const session = await adapter.createCheckoutSession(
    {
      paymentId: payment.id,
      orderId: payment.id,
      amountMinor: payment.amount,
      customerPhone: booking.passengerPhone,
      customerName: booking.passengerName,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
      ipnUrl: urls.ipnUrl,
      sandboxMode: gateway.sandboxMode,
      tenantSubdomain,
    },
    gateway.credentials,
  );

  await db.payment.update({
    where: { id: payment.id },
    data: { providerSessionId: session.sessionId },
  });

  return {
    paymentId: payment.id,
    bookingId: booking.id,
    amount: payment.amount,
    method: payment.method,
    clientSecret,
    providerCode: gateway.code,
    settlementRoute: gateway.settlementRoute,
    redirectUrl: session.redirectUrl,
    sessionId: session.sessionId,
  };
}

export async function initiatePayment(input: InitiatePaymentInput) {
  return initiatePaymentWithClient(prisma, input);
}

function assertVerifiedAmount(
  verified: VerifiedPaymentEvent,
  payment: { amount: number; id: string },
): void {
  if (verified.paymentId !== payment.id) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Payment reference mismatch", 401);
  }
  if (
    verified.status === "COMPLETED" &&
    verified.amountMinor !== payment.amount
  ) {
    throw new AppError(ErrorCode.CONFLICT, "Payment amount mismatch", 409);
  }
}

export async function confirmPaymentWithClient(
  db: DbClient,
  bookingId: string,
  clientSecret: string,
  idempotencyKey?: string,
  providerRef?: string,
  verified?: VerifiedPaymentEvent,
): Promise<IssuedTicket> {
  const tokenPayload = verifyPaymentClientSecret(
    paymentSigningSecret(),
    clientSecret,
    bookingId,
  );

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      hold: true,
      seats: true,
      payment: true,
      ticket: true,
    },
  });
  if (!booking) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);
  }

  if (booking.status === "PAID") {
    if (!booking.payment || booking.payment.status !== "COMPLETED") {
      throw new AppError(ErrorCode.CONFLICT, "Already paid", 409);
    }
    if (booking.payment.id !== tokenPayload.paymentId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid payment token", 401);
    }
    if (booking.ticket) {
      return toIssuedTicket(booking.ticket);
    }
    return toIssuedTicket(await issueTicketWithClient(db, bookingId));
  }

  assertBookingPayable(booking);

  if (!booking.payment || booking.payment.status !== "PENDING") {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Payment not initiated or already completed",
      409,
    );
  }
  if (booking.payment.id !== tokenPayload.paymentId) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid payment token", 401);
  }

  if (booking.payment.method === "ONLINE") {
    if (!providerRef && !verified?.providerRef) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "providerRef is required for online payment",
        400,
      );
    }
    const ref = verified?.providerRef ?? providerRef!;
    if (verified) {
      assertVerifiedAmount(verified, booking.payment);
      if (verified.status !== "COMPLETED") {
        throw new AppError(ErrorCode.CONFLICT, "Payment not completed", 409);
      }
    }
    providerRef = ref;
  }

  const updated = await db.payment.updateMany({
    where: { bookingId, status: "PENDING", id: tokenPayload.paymentId },
    data: {
      status: "COMPLETED",
      idempotencyKey,
      providerRef: providerRef ?? undefined,
    },
  });
  if (updated.count !== 1) {
    throw new AppError(
      ErrorCode.CONFLICT,
      "Payment not initiated or already completed",
      409,
    );
  }
  await db.booking.update({
    where: { id: bookingId, status: "HELD" },
    data: { status: "PAID" },
  });
  const seatIds = booking.seats.map((s) => s.scheduleSeatId);
  await db.scheduleSeat.updateMany({
    where: { id: { in: seatIds } },
    data: { status: "SOLD" },
  });

  if (
    booking.payment.settlementRoute === "SYSTEM" &&
    booking.tenantId
  ) {
    await creditTenantWalletWithClient(db, {
      tenantId: booking.tenantId,
      amountMinor: booking.payment.amount,
      referenceType: "BOOKING_PAYMENT",
      referenceId: booking.payment.id,
      note: `Booking ${booking.id}`,
    });
  }

  return toIssuedTicket(await issueTicketWithClient(db, bookingId));
}

export async function confirmPayment(
  bookingId: string,
  clientSecret: string,
  idempotencyKey?: string,
  providerRef?: string,
): Promise<ConfirmPaymentResponseDto> {
  if (idempotencyKey) {
    const existing = await prisma.payment.findUnique({
      where: { idempotencyKey },
      include: { booking: { include: { ticket: true } } },
    });
    if (existing?.status === "COMPLETED" && existing.booking) {
      const ticket = existing.booking.ticket
        ? toIssuedTicket(existing.booking.ticket)
        : toIssuedTicket(await issueTicket(existing.booking.id));
      enqueueBookingNotifications(existing.booking.id);
      return { bookingId: existing.booking.id, ticket };
    }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });
  if (!booking?.payment) {
    throw new AppError(ErrorCode.BOOKING_NOT_FOUND, "Booking not found", 404);
  }

  let verified: VerifiedPaymentEvent | undefined;
  if (booking.payment.method === "ONLINE" && providerRef) {
    verified = await verifyOnlinePayment(booking.payment, providerRef);
  }

  const ticket = await prisma.$transaction(async (tx) =>
    confirmPaymentWithClient(
      tx,
      bookingId,
      clientSecret,
      idempotencyKey,
      providerRef,
      verified,
    ),
  );

  enqueueBookingNotifications(bookingId);
  return { bookingId, ticket };
}

async function verifyOnlinePayment(
  payment: {
    id: string;
    amount: number;
    providerCode: string | null;
    bookingId: string | null;
  },
  providerRef: string,
): Promise<VerifiedPaymentEvent> {
  if (!payment.providerCode || !payment.bookingId) {
    throw new AppError(ErrorCode.CONFLICT, "Invalid payment state", 409);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payment.bookingId },
  });

  const gateway = await resolveGatewayForPayment(
    booking?.tenantId ?? null,
    payment.providerCode as PaymentProviderCode,
  );
  const adapter = getPaymentAdapter(gateway.code);
  if (!adapter.queryPayment) {
    throw new AppError(ErrorCode.CONFLICT, "Provider verification unavailable", 409);
  }
  const verified = await adapter.queryPayment(providerRef, gateway.credentials);
  if (verified.amountMinor !== payment.amount) {
    throw new AppError(ErrorCode.CONFLICT, "Payment amount mismatch", 409);
  }
  return verified;
}

export async function processProviderWebhook(
  providerCode: PaymentProviderCode,
  rawBody: unknown,
  headers: Record<string, string>,
): Promise<{ handled: boolean; paymentId?: string }> {
  const payload = rawBody as Record<string, string>;
  const paymentId =
    payload.tran_id ??
    payload.merchantInvoiceNumber ??
    payload.paymentID;

  if (!paymentId) {
    return { handled: false };
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ id: paymentId }, { providerSessionId: paymentId }],
      providerCode,
    },
    include: { booking: { include: { hold: true } } },
  });

  if (!payment) return { handled: false };

  if (payment.status === "COMPLETED") {
    return { handled: true, paymentId: payment.id };
  }

  const gateway = await resolveGatewayForPayment(
    payment.booking?.tenantId ?? null,
    providerCode,
  );
  const adapter = getPaymentAdapter(providerCode);
  const verified = await adapter.verifyWebhook(
    rawBody,
    headers,
    gateway.credentials,
  );

  if (!verified || verified.status !== "COMPLETED") {
    if (verified?.status === "FAILED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", providerRef: verified.providerRef },
      });
    }
    return { handled: true, paymentId: payment.id };
  }

  assertVerifiedAmount(verified, payment);

  if (!payment.bookingId) {
    return { handled: false };
  }

  const holdExpiresAt = payment.booking?.hold?.expiresAt;
  if (holdExpiresAt && holdExpiresAt < new Date()) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", providerRef: verified.providerRef },
    });
    return { handled: true, paymentId: payment.id };
  }

  const clientSecret = createPaymentClientSecret(paymentSigningSecret(), {
    paymentId: payment.id,
    bookingId: payment.bookingId,
    exp: Date.now() + 60_000,
  });

  await prisma.$transaction(async (tx) => {
    await confirmPaymentWithClient(
      tx,
      payment.bookingId!,
      clientSecret,
      `webhook_${verified.providerRef}`,
      verified.providerRef,
      verified,
    );
  });

  enqueueBookingNotifications(payment.bookingId);
  return { handled: true, paymentId: payment.id };
}

function webAppBaseUrl(): string {
  return (
    process.env.WEB_APP_URL ??
    process.env.WEB_URL ??
    process.env.NEXT_PUBLIC_WEB_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function mainDomain(): string {
  const configured =
    process.env.MAIN_DOMAIN ??
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ??
    "lvh.me:3000";
  return configured.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function webAppProtocol(): string {
  try {
    return new URL(webAppBaseUrl()).protocol;
  } catch {
    return "http:";
  }
}

function tenantWebAppUrl(
  tenantSubdomain: string | null | undefined,
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!tenantSubdomain) {
    return `${webAppBaseUrl()}${normalizedPath}`;
  }

  return `${webAppProtocol()}//${tenantSubdomain}.${mainDomain()}${normalizedPath}`;
}

async function tenantSubdomainForBooking(
  bookingId: string,
): Promise<string | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      tenant: { select: { subdomainPrefix: true, slug: true } },
    },
  });
  return booking?.tenant?.subdomainPrefix ?? booking?.tenant?.slug ?? null;
}

export async function processPaymentCallback(query: {
  providerCode: PaymentProviderCode;
  bookingId?: string;
  invoiceId?: string;
  clientSecret?: string;
  status?: string;
  type?: string;
  val_id?: string;
  paymentID?: string;
}): Promise<{ redirectUrl: string }> {
  if (query.status === "cancel") {
    const tenantSubdomain = query.bookingId
      ? await tenantSubdomainForBooking(query.bookingId)
      : null;
    return {
      redirectUrl: query.bookingId
        ? tenantWebAppUrl(
            tenantSubdomain,
            `/booking/payment/cancel?bookingId=${query.bookingId}`,
          )
        : `${webAppBaseUrl()}/platform?tab=billing&cancelled=1`,
    };
  }

  if (query.type === "invoice" && query.invoiceId && query.clientSecret) {
    const { confirmInvoicePaymentCallback } = await import(
      "../platform/platform-invoice-payment.service.js"
    );
    return confirmInvoicePaymentCallback(query);
  }

  if (!query.bookingId || !query.clientSecret) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Invalid callback", 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { bookingId: query.bookingId },
    include: { booking: true },
  });
  if (!payment?.providerCode) {
    throw new AppError(ErrorCode.NOT_FOUND, "Payment not found", 404);
  }

  const gateway = await resolveGatewayForPayment(
    payment.booking?.tenantId ?? null,
    payment.providerCode,
  );
  const adapter = getPaymentAdapter(payment.providerCode);

  let verified: VerifiedPaymentEvent | null = null;
  if (query.val_id && adapter.queryPayment) {
    verified = await adapter.queryPayment(query.val_id, gateway.credentials);
  } else if (query.paymentID) {
    verified = await adapter.verifyWebhook(
      { paymentID: query.paymentID },
      {},
      gateway.credentials,
    );
  }

  if (verified?.status === "COMPLETED") {
    await prisma.$transaction(async (tx) => {
      await confirmPaymentWithClient(
        tx,
        query.bookingId!,
        query.clientSecret!,
        `callback_${verified!.providerRef}`,
        verified!.providerRef,
        verified!,
      );
    });
    enqueueBookingNotifications(query.bookingId!);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: query.bookingId },
    include: {
      ticket: true,
      schedule: true,
      tenant: { select: { subdomainPrefix: true, slug: true } },
    },
  });
  const pn = booking?.ticket?.passengerNumber ?? "";
  const scheduleId = booking?.scheduleId ?? "";
  const tenantSubdomain =
    booking?.tenant?.subdomainPrefix ?? booking?.tenant?.slug ?? null;
  return {
    redirectUrl: tenantWebAppUrl(
      tenantSubdomain,
      `/booking/${scheduleId}/confirmation?passengerNumber=${pn}&bookingId=${query.bookingId}`,
    ),
  };
}
