import "../../test/mocks/database.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../test/mocks/database.js";
import { createHold } from "./bookings.service.js";

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
    expect(prismaMock.scheduleSeat.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["seat-1"] },
        scheduleId: "sched-1",
        status: "AVAILABLE",
      },
      data: { status: "HELD" },
    });
  });
});
