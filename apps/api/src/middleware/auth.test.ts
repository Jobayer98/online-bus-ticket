import express from "express";
import request from "supertest";
import { AppError, ErrorCode } from "@repo/shared";
import {
  authenticateOptional,
  authenticateRequired,
  requireRole,
  signToken,
} from "./auth.js";
import { errorHandler } from "./error-handler.js";

function authTestApp() {
  const app = express();
  app.use(authenticateOptional);

  app.get("/public", (req, res) => {
    res.json({ userId: req.userId ?? null });
  });

  app.get("/private", authenticateRequired, (req, res) => {
    res.json({ userId: req.userId });
  });

  app.get(
    "/admin-only",
    authenticateRequired,
    requireRole("ADMIN"),
    (_req, res) => {
      res.json({ ok: true });
    },
  );

  app.use(errorHandler);
  return app;
}

describe("auth middleware", () => {
  const app = authTestApp();

  it("signToken produces a verifiable bearer token", async () => {
    const token = signToken({ userId: "user-1", role: "ADMIN" });
    const res = await request(app)
      .get("/private")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "user-1" });
  });

  it("authenticateRequired rejects missing token", async () => {
    const res = await request(app).get("/private");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it("requireRole rejects wrong role", async () => {
    const token = signToken({ userId: "user-1", role: "USER" });
    const res = await request(app)
      .get("/admin-only")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ErrorCode.FORBIDDEN);
  });

  it("authenticateOptional ignores invalid token", async () => {
    const res = await request(app)
      .get("/public")
      .set("Authorization", "Bearer not-valid");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: null });
  });

  it("accepts cookie token with Bearer prefix (Swagger cookieAuth)", async () => {
    const token = signToken({ userId: "user-1", role: "ADMIN" });
    const res = await request(app)
      .get("/private")
      .set("Cookie", `token=Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "user-1" });
  });
});
