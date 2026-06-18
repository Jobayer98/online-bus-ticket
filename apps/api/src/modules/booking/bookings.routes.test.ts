import "../../test/mocks/database.js";
import request from "supertest";
import { vi } from "vitest";
import { createTestApp } from "../../test/helpers.js";
import * as bookingService from "./bookings.service.js";

vi.mock("./bookings.service.js", () => ({
  createHold: vi.fn(),
  releaseHold: vi.fn(),
  createBooking: vi.fn(),
  getBooking: vi.fn(),
}));

describe("booking routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /bookings/hold validates request body", async () => {
    const app = await createTestApp();
    const res = await request(app).post("/api/v1/bookings/hold").send({
      scheduleId: "bad",
      seatLabels: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(bookingService.createHold).not.toHaveBeenCalled();
  });

  it("POST /bookings/hold creates hold", async () => {
    vi.mocked(bookingService.createHold).mockResolvedValue({
      holdId: "hold-1",
      expiresAt: new Date().toISOString(),
      seatLabels: ["A1"],
      totalAmount: 85000,
      lineItems: [{ label: "A1", seatClass: "STANDARD", price: 85000 }],
    });

    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/bookings/hold")
      .send({
        scheduleId: "clh3qbaz41000l8145c6v8v9k",
        seatLabels: ["A1"],
        sessionId: "sess-1",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.holdId).toBe("hold-1");
  });

  it("DELETE /bookings/hold/:id requires sessionId or accessToken", async () => {
    const app = await createTestApp();
    const res = await request(app).delete(
      "/api/v1/bookings/hold/clh3qbaz41000l8145c6v8v9k",
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(bookingService.releaseHold).not.toHaveBeenCalled();
  });
});
