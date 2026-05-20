import request from "supertest";
import { createTestApp } from "../../test/helpers.js";

describe("GET /api/v1/health", () => {
  it("returns ok status in data envelope", async () => {
    const app = await createTestApp();
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        status: "ok",
        version: expect.any(String),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      },
    });
  });
});
