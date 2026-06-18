import "../../test/mocks/database.js";
import request from "supertest";
import { createTestApp } from "../../test/helpers.js";

describe("payment webhook", () => {
  it("acknowledges non-refund events", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/payments/webhook")
      .send({ event: "payment.completed", providerRef: "bkash_abc" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ received: true });
  });

  it("rejects refund-shaped webhook events", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/payments/webhook")
      .send({ event: "payment.refunded", providerRef: "bkash_abc" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("REFUND_NOT_ALLOWED");
  });

  it("acknowledges empty body (provider ping)", async () => {
    const app = await createTestApp();
    const res = await request(app).post("/api/v1/payments/webhook").send({});

    expect(res.status).toBe(200);
    expect(res.body.data.received).toBe(true);
  });
});

describe("refund surface", () => {
  it("has no public POST /bookings/refund", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/bookings/refund")
      .send({ bookingId: "clh3qbaz41000l8145c6v8v9k" });

    expect(res.status).toBe(404);
  });

  it("has no public POST /payments/refund", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/payments/refund")
      .send({ bookingId: "clh3qbaz41000l8145c6v8v9k" });

    expect(res.status).toBe(404);
  });

  it("requires auth for POST /counter/refund", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/counter/refund")
      .send({ bookingId: "clh3qbaz41000l8145c6v8v9k" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
