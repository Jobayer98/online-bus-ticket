import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorCode } from "@repo/shared";
import { prismaMock } from "../../test/mocks/database.js";
import { errorHandler } from "../../middleware/error-handler.js";
import { signToken } from "../../middleware/auth.js";
import { adminSchedulesRouter } from "./schedules.routes.js";

function requestWithRole(role: string) {
  const token = signToken({ userId: "user-1", role });
  const app = express();
  app.use(express.json());
  app.use("/admin/schedules", adminSchedulesRouter);
  app.use(errorHandler);
  return { app, token };
}

describe("admin schedules RBAC (E14-21)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows COUNTER_SELLER to list schedules", async () => {
    prismaMock.schedule.findMany.mockResolvedValue([]);
    const { app, token } = requestWithRole("COUNTER_SELLER");
    const res = await request(app)
      .get("/admin/schedules")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("forbids COUNTER_SELLER from creating schedules", async () => {
    const { app, token } = requestWithRole("COUNTER_SELLER");
    const res = await request(app)
      .post("/admin/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        routeId: "route-1",
        coachId: "coach-1",
        departureAt: new Date().toISOString(),
        estimatedArrivalAt: new Date().toISOString(),
        baseFare: 85000,
      });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ErrorCode.FORBIDDEN);
    expect(prismaMock.schedule.create).not.toHaveBeenCalled();
  });

  it("forbids COUNTER_SELLER from cancelling schedules", async () => {
    const { app, token } = requestWithRole("COUNTER_SELLER");
    const res = await request(app)
      .patch("/admin/schedules/sched-1/cancel")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ErrorCode.FORBIDDEN);
    expect(prismaMock.schedule.update).not.toHaveBeenCalled();
  });

  it("allows ADMIN to cancel schedules", async () => {
    prismaMock.schedule.update.mockResolvedValue({
      id: "sched-1",
      status: "CANCELLED",
    });
    const { app, token } = requestWithRole("ADMIN");
    const res = await request(app)
      .patch("/admin/schedules/sched-1/cancel")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(prismaMock.schedule.update).toHaveBeenCalled();
  });
});
