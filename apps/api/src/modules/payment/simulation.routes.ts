import { randomUUID } from "crypto";
import { Router } from "express";
import { prisma } from "@repo/database";
import { AppError, ErrorCode } from "@repo/shared";
import { confirmPaymentWithClient } from "./payments.service.js";
import { enqueueBookingNotifications } from "../../jobs/dispatch-notifications.js";

export const simulationRouter = Router();

function buildWebUrl(
  tenantSubdomain: string | null | undefined,
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const mainDomain =
    process.env.MAIN_DOMAIN ??
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ??
    "lvh.me:3000";
  const webAppUrl = (
    process.env.WEB_APP_URL ??
    process.env.WEB_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  if (!tenantSubdomain) {
    return `${webAppUrl}${normalizedPath}`;
  }

  try {
    const protocol = new URL(webAppUrl).protocol;
    const [mainHost, mainPort] = mainDomain.includes(":")
      ? mainDomain.split(":")
      : [mainDomain, ""];
    const portSuffix = mainPort ? `:${mainPort}` : "";
    return `${protocol}//${tenantSubdomain}.${mainHost}${portSuffix}${normalizedPath}`;
  } catch {
    return `${webAppUrl}${normalizedPath}`;
  }
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

/**
 * GET /api/v1/payments/simulation/auto
 *
 * Auto-confirm or auto-fail endpoint for mock payment simulation.
 * Called directly by MockPaymentAdapter (AUTO_SUCCEED) or by the
 * manual simulation page when the user clicks "Pay Now".
 *
 * Query params:
 *   bookingId    - the booking CUID
 *   clientSecret - signed payment token from POST /payments/initiate
 *   paymentId    - payment row ID (used to build providerRef)
 *   providerRef  - optional; defaults to MOCK-{paymentId}
 *   outcome      - "succeed" | anything else = fail
 */
simulationRouter.get("/auto", async (req, res, next) => {
  const { bookingId, clientSecret, paymentId, outcome } = req.query as Record<
    string,
    string | undefined
  >;

  try {
    const tenantSubdomain = bookingId
      ? await tenantSubdomainForBooking(bookingId)
      : null;

    const cancelUrl = bookingId
      ? buildWebUrl(tenantSubdomain, `/booking/payment/cancel?bookingId=${bookingId}`)
      : buildWebUrl(tenantSubdomain, "/");

    if (outcome !== "succeed") {
      res.redirect(cancelUrl);
      return;
    }

    if (!bookingId || !clientSecret || !paymentId) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "bookingId, clientSecret and paymentId are required",
        400,
      );
    }

    const providerRef =
      (req.query.providerRef as string | undefined) ?? `MOCK-${paymentId}`;

    await prisma.$transaction(async (tx) => {
      await confirmPaymentWithClient(
        tx,
        bookingId,
        clientSecret,
        `sim_${randomUUID()}`,
        providerRef,
      );
    });

    enqueueBookingNotifications(bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ticket: true },
    });

    const pn = booking?.ticket?.passengerNumber ?? "";
    const scheduleId = booking?.scheduleId ?? "";

    res.redirect(
      buildWebUrl(
        tenantSubdomain,
        `/booking/${scheduleId}/confirmation?passengerNumber=${pn}&bookingId=${bookingId}`,
      ),
    );
  } catch (e) {
    next(e);
  }
});
