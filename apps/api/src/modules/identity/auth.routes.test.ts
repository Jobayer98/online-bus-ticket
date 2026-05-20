import "../../test/mocks/database.js";
import request from "supertest";
import { vi } from "vitest";
import { createTestApp } from "../../test/helpers.js";
import * as authService from "./auth.service.js";

vi.mock("./auth.service.js", () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /auth/register validates body", async () => {
    const app = await createTestApp();
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ phone: "1", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(authService.register).not.toHaveBeenCalled();
  });

  it("POST /auth/register returns user on success", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      token: "jwt-token",
      user: {
        id: "u1",
        phone: "01700000000",
        name: "Test",
        role: "USER",
      },
    });

    const app = await createTestApp();
    const res = await request(app).post("/api/v1/auth/register").send({
      phone: "01700000000",
      password: "secret12",
      name: "Test",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe("jwt-token");
    expect(res.headers["set-cookie"]?.join("")).toContain("token=");
  });

  it("POST /auth/logout clears cookie", async () => {
    const app = await createTestApp();
    const res = await request(app).post("/api/v1/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.data.ok).toBe(true);
    expect(res.headers["set-cookie"]?.join("")).toMatch(/token=;/);
  });
});
