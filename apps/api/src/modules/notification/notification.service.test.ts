import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotificationChannel,
  NotificationStatus,
  type BookingTicketNotificationDto,
} from "@repo/shared";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    booking: { findUnique: vi.fn() },
    notificationLog: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

vi.mock("@repo/database", () => ({ prisma: prismaMock }));

const smsSend = vi.fn();
const emailSend = vi.fn();

vi.mock("./providers.js", () => ({
  getSmsProvider: () => ({ send: smsSend }),
  getEmailProvider: () => ({ send: emailSend }),
}));

vi.mock("./ticket-png.js", () => ({
  generateTicketPng: vi.fn().mockResolvedValue(Buffer.from("png")),
}));

import { sendBookingNotifications } from "./notification.service.js";

const baseTicket: BookingTicketNotificationDto = {
  bookingId: "booking_1",
  passengerNumber: "P123456",
  passengerName: "Karim",
  passengerPhone: "01700000000",
  scheduleId: "sched_1",
  departureAt: "2026-05-21T04:30:00.000Z",
  routeSlug: "dhaka-pabna",
  seatLabels: ["A1"],
  totalAmount: 120000,
  boardingPoint: "Gabtoli",
};

function mockPaidBooking(email?: string) {
  prismaMock.booking.findUnique.mockResolvedValue({
    id: "booking_1",
    status: "PAID",
    scheduleId: "sched_1",
    passengerName: "Karim",
    passengerPhone: "01700000000",
    passengerEmail: email ?? null,
    totalAmount: 120000,
    ticket: { passengerNumber: "P123456" },
    boardingPoint: { name: "Gabtoli" },
    schedule: {
      departureAt: new Date("2026-05-21T04:30:00.000Z"),
      route: { slug: "dhaka-pabna" },
    },
    seats: [{ scheduleSeat: { label: "A1" } }],
  });
}

describe("sendBookingNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.notificationLog.findUnique.mockResolvedValue(null);
    prismaMock.notificationLog.upsert.mockResolvedValue({});
    mockPaidBooking();
  });

  it("sends SMS for every paid booking", async () => {
    await sendBookingNotifications("booking_1");

    expect(smsSend).toHaveBeenCalledOnce();
    expect(smsSend.mock.calls[0][0].to).toBe("01700000000");
    expect(smsSend.mock.calls[0][0].body).toContain("P123456");
    expect(prismaMock.notificationLog.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          channel: NotificationChannel.SMS,
          status: NotificationStatus.SENT,
        }),
      }),
    );
  });

  it("skips email when passenger email is absent", async () => {
    await sendBookingNotifications("booking_1");

    expect(emailSend).not.toHaveBeenCalled();
    expect(prismaMock.notificationLog.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          channel: NotificationChannel.EMAIL,
          status: NotificationStatus.SKIPPED,
        }),
      }),
    );
  });

  it("sends email with PNG when passenger email is provided", async () => {
    mockPaidBooking("karim@example.com");

    await sendBookingNotifications("booking_1");

    expect(emailSend).toHaveBeenCalledOnce();
    expect(emailSend.mock.calls[0][0].to).toBe("karim@example.com");
    expect(emailSend.mock.calls[0][0].attachments?.[0].filename).toBe(
      "ticket-P123456.png",
    );
    expect(emailSend.mock.calls[0][0].attachments?.[0].contentType).toBe(
      "image/png",
    );
  });

  it("does not resend SMS when already SENT", async () => {
    prismaMock.notificationLog.findUnique.mockImplementation(
      async (args: { where: { bookingId_channel: { channel: string } } }) => {
        if (args.where.bookingId_channel.channel === NotificationChannel.SMS) {
          return { status: NotificationStatus.SENT };
        }
        return null;
      },
    );

    await sendBookingNotifications("booking_1");

    expect(smsSend).not.toHaveBeenCalled();
  });
});
