import "../../test/mocks/database.js";
import request from "supertest";
import { prismaMock } from "../../test/mocks/database.js";
import { createTestApp } from "../../test/helpers.js";
import { signToken } from "../../middleware/auth.js";

describe("users routes", () => {
  it("GET /users/me requires authentication", async () => {
    const app = await createTestApp();
    const res = await request(app).get("/api/v1/users/me");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /users/me returns profile when authenticated", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      phone: "01700000000",
      email: null,
      name: "Passenger",
      role: "USER",
    });

    const token = signToken({ userId: "user-1", role: "USER" });
    const app = await createTestApp();
    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: "user-1",
      phone: "01700000000",
      role: "USER",
    });
  });
});
