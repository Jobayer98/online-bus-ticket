import "../../test/mocks/database.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../test/mocks/database.js";

vi.mock("../../lib/payment-client-secret.js", () => ({
  paymentSigningSecret: vi.fn(() => "test-secret"),
  verifyPaymentClientSecret: vi.fn(() => ({
    paymentId: "pay-1",
    bookingId: "book-1",
  })),
  createPaymentClientSecret: vi.fn(),
}));

vi.mock("../ticket/tickets.service.js", () => ({
  issueTicketWithClient: vi.fn(),
  issueTicket: vi.fn(),
  toIssuedTicket: vi.fn((t: { id: string; passengerNumber: string }) => t),
}));

vi.mock("../../jobs/dispatch-notifications.js", () => ({
  enqueueBookingNotifications: vi.fn(),
}));

import { issueTicketWithClient, issueTicket } from "../ticket/tickets.service.js";
import { confirmPaymentWithClient, confirmPayment } from "./payments.service.js";

describe("confirmPaymentWithClient", () => {
  const bookingBase = {
    id: "book-1",
    status: "HELD",
    totalAmount: 85000,
    hold: { expiresAt: new Date(Date.now() + 60_000) },
    seats: [{ scheduleSeatId: "seat-1" }],
    payment: { id: "pay-1", status: "PENDING" },
    ticket: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(issueTicketWithClient).mockResolvedValue({
      id: "ticket-1",
      passengerNumber: "P123456",
      bookingId: "book-1",
      qrPayload: "{}",
      createdAt: new Date(),
    });
  });

  it("issues ticket inside the same transaction as payment confirm", async () => {
    const db = {
      booking: {
        findUnique: vi.fn().mockResolvedValue(bookingBase),
        update: vi.fn(),
      },
      payment: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      scheduleSeat: {
        updateMany: vi.fn(),
      },
    };

    const ticket = await confirmPaymentWithClient(
      db as never,
      "book-1",
      "secret",
    );

    expect(issueTicketWithClient).toHaveBeenCalledWith(db, "book-1");
    expect(ticket).toMatchObject({
      id: "ticket-1",
      passengerNumber: "P123456",
    });
  });

  it("compensates missing ticket for already PAID booking", async () => {
    const db = {
      booking: {
        findUnique: vi.fn().mockResolvedValue({
          ...bookingBase,
          status: "PAID",
          payment: { id: "pay-1", status: "COMPLETED" },
          ticket: null,
        }),
      },
    };

    const ticket = await confirmPaymentWithClient(
      db as never,
      "book-1",
      "secret",
    );

    expect(issueTicketWithClient).toHaveBeenCalledWith(db, "book-1");
    expect(ticket.passengerNumber).toBe("P123456");
  });
});

describe("confirmPayment idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.payment.findUnique = vi.fn();
    vi.mocked(issueTicket).mockResolvedValue({
      id: "ticket-legacy",
      passengerNumber: "P999999",
      bookingId: "book-1",
      qrPayload: "{}",
      createdAt: new Date(),
    });
  });

  it("repairs PAID booking missing ticket on idempotent retry", async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      status: "COMPLETED",
      bookingId: "book-1",
      booking: { ticket: null },
    });

    const result = await confirmPayment("book-1", "secret", "idem-1");

    expect(issueTicket).toHaveBeenCalledWith("book-1");
    expect(result.ticket.passengerNumber).toBe("P999999");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
