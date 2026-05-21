import { describe, expect, it } from "vitest";
import type { BookingTicketNotificationDto } from "@repo/shared";
import { generateTicketPng } from "./ticket-png.js";

const sample: BookingTicketNotificationDto = {
  bookingId: "b1",
  passengerNumber: "P999999",
  passengerName: "Test User",
  passengerPhone: "01711111111",
  scheduleId: "s1",
  departureAt: "2026-06-01T10:00:00.000Z",
  routeSlug: "dhaka-chittagong",
  seatLabels: ["B2", "B3"],
  totalAmount: 250000,
  boardingPoint: "Gabtoli",
};

describe("generateTicketPng", () => {
  it(
    "returns a valid PNG buffer",
    async () => {
    const png = await generateTicketPng(sample);
    expect(png.length).toBeGreaterThan(1000);
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    },
    15_000,
  );
});
