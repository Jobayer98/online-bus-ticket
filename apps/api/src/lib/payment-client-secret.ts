import { createHmac, timingSafeEqual } from "crypto";
import { AppError, ErrorCode } from "@repo/shared";

export type PaymentClientSecretPayload = {
  paymentId: string;
  bookingId: string;
  exp: number;
};

function signBody(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createPaymentClientSecret(
  secret: string,
  payload: PaymentClientSecretPayload,
): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${signBody(secret, body)}`;
}

export function verifyPaymentClientSecret(
  secret: string,
  token: string,
  expectedBookingId: string,
): PaymentClientSecretPayload {
  const dot = token.indexOf(".");
  if (dot <= 0) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid payment token", 401);
  }
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = signBody(secret, body);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid payment token", 401);
  }

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8"),
  ) as PaymentClientSecretPayload;

  if (payload.bookingId !== expectedBookingId) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid payment token", 401);
  }
  if (payload.exp < Date.now()) {
    throw new AppError(ErrorCode.HOLD_EXPIRED, "Payment session expired", 409);
  }

  return payload;
}

export function paymentSigningSecret(): string {
  return (
    process.env.PAYMENT_SIGNING_SECRET ??
    process.env.JWT_SECRET ??
    "dev-secret-change-me"
  );
}
