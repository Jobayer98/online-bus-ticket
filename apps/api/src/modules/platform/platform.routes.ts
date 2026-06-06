import { Router } from "express";
import {
  createTenantSchema,
  updateTenantSchema,
  registerTenantSchema,
  listPlatformTenantsQuerySchema,
  listPlatformAuditLogsQuerySchema,
  platformDashboardQuerySchema,
  successResponse,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { platformAuthRouter } from "./platform-auth.routes.js";
import * as platformService from "./platform.service.js";
import { getDashboardOverview } from "./platform-dashboard.service.js";
import { listPlatformAuditLogs } from "./platform-audit.service.js";

export const platformRouter = Router();
export const platformRegisterRouter = Router();

export { platformAuthRouter };

function clientIp(req: { ip?: string; headers: Record<string, unknown> }): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return req.ip ?? null;
}

platformRegisterRouter.post("/", async (req, res, next) => {
  try {
    const input = registerTenantSchema.parse(req.body);
    const data = await platformService.registerTenant(input);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.use(authenticateRequired, requireRole("SUPER_ADMIN"));

platformRouter.get("/dashboard/overview", async (req, res, next) => {
  try {
    const query = platformDashboardQuerySchema.parse(req.query);
    const data = await getDashboardOverview(query.periodDays);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/tenants", async (req, res, next) => {
  try {
    const query = listPlatformTenantsQuerySchema.parse(req.query);
    const data = await platformService.listTenants(query);
    res.json({ data: data.tenants, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/tenants/:id", async (req, res, next) => {
  try {
    const data = await platformService.getTenantDetail(String(req.params.id));
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/tenants", async (req, res, next) => {
  try {
    const input = createTenantSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await platformService.createTenant(input, {
      actor,
      ipAddress: clientIp(req),
    });
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.patch("/tenants/:id", async (req, res, next) => {
  try {
    const input = updateTenantSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await platformService.updateTenant(String(req.params.id), input, {
      actor,
      ipAddress: clientIp(req),
    });
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/audit-logs", async (req, res, next) => {
  try {
    const query = listPlatformAuditLogsQuerySchema.parse(req.query);
    const data = await listPlatformAuditLogs(query);
    res.json({ data: data.logs, meta: data.meta });
  } catch (e) {
    next(e);
  }
});
