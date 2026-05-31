import "../../test/mocks/database.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../test/mocks/database.js";
import { AppError } from "@repo/shared";

vi.mock("../booking/bookings.service.js", () => ({
  createHoldWithClient: vi.fn(),
  createBookingWithClient: vi.fn(),
}));

vi.mock("../payment/payments.service.js", () => ({
  initiatePaymentWithClient: vi.fn(),
  confirmPaymentWithClient: vi.fn(),
}));

vi.mock("../../jobs/dispatch-notifications.js", () => ({
  enqueueBookingNotifications: vi.fn(),
}));

import { createHoldWithClient, createBookingWithClient } from "../booking/bookings.service.js";
import {
  initiatePaymentWithClient,
  confirmPaymentWithClient,
} from "../payment/payments.service.js";
import { executeCounterSell } from "./counter.service.js";

describe("executeCounterSell", () => {
  const input = {
    scheduleId: "clh3qbaz40000l8145c6v8v9k",
    seatLabels: ["A1"],
    boardingPointId: "clh3qbaz40000l8145c6v8v9l",
    passenger: { name: "Walk-in", phone: "01700000000" },
    method: "CASH" as const,
  };

  const issuedTicket = { id: "ticket-1", passengerNumber: "P123456" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createHoldWithClient).mockResolvedValue({
      id: "hold-1",
      expiresAt: new Date("2026-06-01T12:10:00.000Z"),
      items: [],
    } as Awaited<ReturnType<typeof createHoldWithClient>>);
    vi.mocked(createBookingWithClient).mockResolvedValue({
      booking: {
        id: "book-1",
        totalAmount: 85000,
      },
      paymentExpiresAt: new Date("2026-06-01T12:15:00.000Z"),
    } as Awaited<ReturnType<typeof createBookingWithClient>>);
    vi.mocked(initiatePaymentWithClient).mockResolvedValue({
      paymentId: "pay-1",
      bookingId: "book-1",
      amount: 85000,
      method: "CASH",
      clientSecret: "secret",
    });
    vi.mocked(confirmPaymentWithClient).mockResolvedValue(issuedTicket);
    prismaMock.counterTransaction.create.mockResolvedValue({ id: "ct-1" });
    prismaMock.booking.update.mockResolvedValue({ id: "book-1" });
  });

  it("runs hold through ticket and channel updates in a single transaction", async () => {
    const txSteps: string[] = [];
    prismaMock.$transaction.mockImplementation(async (fn) => {
      const tx = {
        counterTransaction: {
          create: vi.fn(async () => {
            txSteps.push("audit");
            return { id: "ct-1" };
          }),
        },
        booking: {
          update: vi.fn(async () => {
            txSteps.push("channel");
            return { id: "book-1" };
          }),
        },
      };
      return fn(tx as never);
    });

    const result = await executeCounterSell("seller-1", input);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(confirmPaymentWithClient).toHaveBeenCalledWith(
      expect.anything(),
      "book-1",
      "secret",
      "counter_book-1",
    );
    expect(txSteps).toEqual(["audit", "channel"]);
    expect(result.ticket).toEqual(issuedTicket);
  });

  it("does not return ticket when transaction fails", async () => {
    prismaMock.$transaction.mockImplementation(async (fn) => {
      vi.mocked(confirmPaymentWithClient).mockRejectedValueOnce(
        new AppError("PAYMENT_FAILED", "Payment failed", 409),
      );
      return fn({} as never);
    });

    await expect(executeCounterSell("seller-1", input)).rejects.toMatchObject({
      code: "PAYMENT_FAILED",
    });
  });
});
