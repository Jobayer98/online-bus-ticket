import { prisma } from "@repo/database";
import {
  NotificationChannel,
  NotificationStatus,
  formatDateDdMmYyyy,
  formatMoneyBdt,
  formatTime12h,
  slugToRouteTitle,
  type BookingTicketNotificationDto,
} from "@repo/shared";

import { logger } from "../../lib/logger.js";
import { getEmailProvider, getSmsProvider } from "./providers.js";
import { generateTicketPng } from "./ticket-png.js";

function buildSmsBody(
  ticket: BookingTicketNotificationDto,
  companyName: string,
): string {
  const routeTitle = slugToRouteTitle(ticket.routeSlug);
  const date = formatDateDdMmYyyy(ticket.departureAt.slice(0, 10));
  const time = formatTime12h(ticket.departureAt);
  const seats = ticket.seatLabels.join(", ");
  const amount = formatMoneyBdt(ticket.totalAmount);
  const brand = companyName.toUpperCase();
  return [
    `${brand}: Ticket confirmed!`,
    `PNR: ${ticket.passengerNumber}`,
    `Route: ${routeTitle}`,
    `Date: ${date} ${time}`,
    `Seats: ${seats}`,
    `Amount: ${amount}`,
    "Show this SMS at boarding.",
  ].join("\n");
}

function buildEmailHtml(
  ticket: BookingTicketNotificationDto,
  companyName: string,
): string {
  const routeTitle = slugToRouteTitle(ticket.routeSlug);
  const date = formatDateDdMmYyyy(ticket.departureAt.slice(0, 10));
  const time = formatTime12h(ticket.departureAt);
  const seats = ticket.seatLabels.join(", ");
  const amount = formatMoneyBdt(ticket.totalAmount);
  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;color:#0f172a">
  <h2>Your bus ticket is confirmed</h2>
  <p>Hello ${ticket.passengerName},</p>
  <p>Thank you for booking with ${companyName}. Your e-ticket is attached as a PNG.</p>
  <table style="border-collapse:collapse">
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">PNR</td><td><strong>${ticket.passengerNumber}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Route</td><td>${routeTitle}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Travel date</td><td>${date} ${time}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Seats</td><td>${seats}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Boarding</td><td>${ticket.boardingPoint}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Amount</td><td>${amount}</td></tr>
  </table>
  <p style="color:#64748b;font-size:12px">Present the attached ticket (printed or on mobile) with a valid ID at boarding.</p>
</body></html>`;
}

async function resolveTenantCompanyName(tenantId: string | null): Promise<string> {
  if (!tenantId) return "Your bus operator";
  const profile = await prisma.siteProfile.findFirst({
    where: { tenantId, status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    select: { companyName: true },
  });
  return profile?.companyName?.trim() || "Your bus operator";
}

async function loadNotificationPayload(
  bookingId: string,
): Promise<{ ticket: BookingTicketNotificationDto; companyName: string } | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ticket: true,
      boardingPoint: true,
      schedule: { include: { route: true } },
      seats: { include: { scheduleSeat: true } },
    },
  });
  if (!booking?.ticket || booking.status !== "PAID") return null;

  const companyName = await resolveTenantCompanyName(booking.tenantId);
  const email = booking.passengerEmail?.trim();
  const ticket = {
    bookingId: booking.id,
    passengerNumber: booking.ticket.passengerNumber,
    passengerName: booking.passengerName,
    passengerPhone: booking.passengerPhone,
    scheduleId: booking.scheduleId,
    departureAt: booking.schedule.departureAt.toISOString(),
    routeSlug: booking.schedule.route.slug,
    seatLabels: booking.seats.map((s) => s.scheduleSeat.label),
    totalAmount: booking.totalAmount,
    boardingPoint: booking.boardingPoint.name,
    ...(email ? { passengerEmail: email } : {}),
  };
  return { ticket, companyName };
}

async function shouldSkip(
  bookingId: string,
  channel: NotificationChannel,
): Promise<boolean> {
  const existing = await prisma.notificationLog.findUnique({
    where: { bookingId_channel: { bookingId, channel } },
  });
  return existing?.status === NotificationStatus.SENT;
}

async function recordNotification(
  bookingId: string,
  channel: NotificationChannel,
  recipient: string,
  status: NotificationStatus,
  error?: string,
): Promise<void> {
  await prisma.notificationLog.upsert({
    where: { bookingId_channel: { bookingId, channel } },
    create: {
      bookingId,
      channel,
      recipient,
      status,
      error: error ?? null,
      sentAt: status === NotificationStatus.SENT ? new Date() : null,
    },
    update: {
      recipient,
      status,
      error: error ?? null,
      sentAt: status === NotificationStatus.SENT ? new Date() : null,
    },
  });
}

async function sendSmsNotification(
  bookingId: string,
  ticket: BookingTicketNotificationDto,
  companyName: string,
): Promise<void> {
  if (await shouldSkip(bookingId, NotificationChannel.SMS)) return;

  const recipient = ticket.passengerPhone;
  try {
    await getSmsProvider().send({
      to: recipient,
      body: buildSmsBody(ticket, companyName),
    });
    await recordNotification(
      bookingId,
      NotificationChannel.SMS,
      recipient,
      NotificationStatus.SENT,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMS send failed";
    logger.error({ err, bookingId }, "SMS notification failed");
    await recordNotification(
      bookingId,
      NotificationChannel.SMS,
      recipient,
      NotificationStatus.FAILED,
      message,
    );
  }
}

async function sendEmailNotification(
  bookingId: string,
  ticket: BookingTicketNotificationDto,
  companyName: string,
): Promise<void> {
  const email = ticket.passengerEmail?.trim();
  if (!email) {
    await recordNotification(
      bookingId,
      NotificationChannel.EMAIL,
      "",
      NotificationStatus.SKIPPED,
      "No passenger email",
    );
    return;
  }

  if (await shouldSkip(bookingId, NotificationChannel.EMAIL)) return;

  try {
    const png = await generateTicketPng(ticket);
    await getEmailProvider().send({
      to: email,
      subject: `Your bus ticket — ${ticket.passengerNumber}`,
      html: buildEmailHtml(ticket, companyName),
      attachments: [
        {
          filename: `ticket-${ticket.passengerNumber}.png`,
          content: png,
          contentType: "image/png",
        },
      ],
    });
    await recordNotification(
      bookingId,
      NotificationChannel.EMAIL,
      email,
      NotificationStatus.SENT,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    logger.error({ err, bookingId }, "Email notification failed");
    await recordNotification(
      bookingId,
      NotificationChannel.EMAIL,
      email,
      NotificationStatus.FAILED,
      message,
    );
  }
}

/** Sends SMS always; email with PNG only when passenger email is present. */
export async function sendBookingNotifications(bookingId: string): Promise<void> {
  const payload = await loadNotificationPayload(bookingId);
  if (!payload) {
    logger.warn({ bookingId }, "Skipping notifications: booking not paid or no ticket");
    return;
  }

  const { ticket, companyName } = payload;
  await sendSmsNotification(bookingId, ticket, companyName);
  await sendEmailNotification(bookingId, ticket, companyName);
}
