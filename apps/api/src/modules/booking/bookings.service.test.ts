import "../../test/mocks/database.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../test/mocks/database.js";
import { createHold, createBookingWithClient, releaseHold } from "./bookings.service.js";

vi.mock("../../lib/booking-access-token.js", () => ({
  bookingAccessSigningSecret: vi.fn(() => "secret"),
  createBookingAccessToken: vi.fn(() => "token"),
  isBookingAccessGranted: vi.fn(() => false),
}));

describe("createHold concurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.schedule.findUnique.mockResolvedValue({
      id: "sched-1",
      status: "SCHEDULED",
    });
    prismaMock.seatHold.create.mockResolvedValue({
      id: "hold-1",
      expiresAt: new Date("2026-06-01T12:10:00.000Z"),
      items: [
        {
          scheduleSeat: {
            label: "A1",
            seatClass: "STANDARD",
            price: 85000,
          },
        },
      ],
    });
  });

  it("rejects when optimistic lock cannot claim all seats", async () => {
    prismaMock.scheduleSeat.findMany.mockResolvedValue([
      { id: "seat-1", label: "A1", seatClass: "STANDARD", price: 85000 },
    ]);
    prismaMock.scheduleSeat.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      createHold({
        scheduleId: "sched-1",
        seatLabels: ["A1"],
        sessionId: "sess-1",
      }),
    ).rejects.toMatchObject({
      code: "SEAT_NOT_AVAILABLE",
      statusCode: 409,
    });

    expect(prismaMock.seatHold.create).not.toHaveBeenCalled();
  });

  it("creates hold when all seats lock as AVAILABLE", async () => {
    prismaMock.scheduleSeat.findMany.mockResolvedValue([
      { id: "seat-1", label: "A1", seatClass: "STANDARD", price: 85000 },
    ]);
    prismaMock.scheduleSeat.updateMany.mockResolvedValue({ count: 1 });

    const result = await createHold({
      scheduleId: "sched-1",
      seatLabels: ["A1"],
      sessionId: "sess-1",
    });

    expect(result.holdId).toBe("hold-1");
  });
});

describe("createBookingWithClient session binding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.seatHold.findUnique.mockResolvedValue({
      id: "hold-1",
      scheduleId: "sched-1",
      sessionId: "sess-owner",
      expiresAt: new Date(Date.now() + 60_000),
      items: [
        {
          scheduleSeatId: "seat-1",
          scheduleSeat: { price: 85000 },
        },
      ],
      booking: null,
    });
    prismaMock.boardingPoint.findFirst.mockResolvedValue({ id: "bp-1" });
    prismaMock.scheduleSeat.findMany.mockResolvedValue([
      { id: "seat-1", status: "HELD" },
    ]);
  });

  it("rejects when sessionId does not match hold", async () => {
    await expect(
      createBookingWithClient(
        prismaMock as never,
        {
          holdId: "hold-1",
          boardingPointId: "bp-1",
          passenger: { name: "A", phone: "01700000000" },
          sessionId: "sess-other",
        },
      ),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      statusCode: 403,
    });
  });
});

describe("releaseHold authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects release without matching session or token", async () => {
    prismaMock.seatHold.findUnique.mockResolvedValue({
      id: "hold-1",
      sessionId: "sess-owner",
      items: [{ scheduleSeatId: "seat-1" }],
      booking: null,
    });

    await expect(
      releaseHold("hold-1", { sessionId: "sess-other" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      statusCode: 403,
    });
  });
});
