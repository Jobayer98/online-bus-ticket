import { Router } from "express";
import {
  createTenantSchema,
  updateTenantSchema,
  registerTenantSchema,
  successResponse,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { platformAuthRouter } from "./platform-auth.routes.js";
import * as platformService from "./platform.service.js";

export const platformRouter = Router();
export const platformRegisterRouter = Router();

export { platformAuthRouter };

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

platformRouter.get("/tenants", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await platformService.listTenants(page, pageSize);
    res.json({ data: data.tenants, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/tenants/:id", async (req, res, next) => {
  try {
    const data = await platformService.getTenant(String(req.params.id));
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/tenants", async (req, res, next) => {
  try {
    const input = createTenantSchema.parse(req.body);
    const data = await platformService.createTenant(input);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.patch("/tenants/:id", async (req, res, next) => {
  try {
    const input = updateTenantSchema.parse(req.body);
    const data = await platformService.updateTenant(
      String(req.params.id),
      input,
    );
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
