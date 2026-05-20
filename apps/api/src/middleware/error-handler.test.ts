import express from "express";
import request from "supertest";
import { ZodError, z } from "zod";
import { AppError, ErrorCode } from "@repo/shared";
import { errorHandler } from "./error-handler.js";

function testApp() {
  const app = express();
  app.get("/app-error", (_req, _res, next) => {
    next(new AppError(ErrorCode.NOT_FOUND, "Missing", 404));
  });
  app.get("/zod-error", (_req, _res, next) => {
    try {
      z.object({ id: z.string().uuid() }).parse({ id: "not-a-uuid" });
    } catch (e) {
      next(e);
    }
  });
  app.get("/unknown-error", () => {
    throw new Error("boom");
  });
  app.use(errorHandler);
  return app;
}

describe("errorHandler", () => {
  it("maps AppError to error envelope", async () => {
    const res = await request(testApp()).get("/app-error");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: ErrorCode.NOT_FOUND, message: "Missing" },
    });
  });

  it("maps ZodError to VALIDATION_ERROR", async () => {
    const res = await request(testApp()).get("/zod-error");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(res.body.error.details).toBeDefined();
  });

  it("maps unknown errors to INTERNAL_ERROR", async () => {
    const res = await request(testApp()).get("/unknown-error");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });
});
