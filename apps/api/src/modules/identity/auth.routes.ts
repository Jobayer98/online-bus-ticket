import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerSchema, loginSchema, successResponse } from "@repo/shared";
import { authCookieOptions } from "../../middleware/auth.js";
import * as authService from "./auth.service.js";

export const authRouter = Router();
const authLimiter = rateLimit({ windowMs: 60_000, max: 20 });

authRouter.use(authLimiter);

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res
      .cookie("token", result.token, authCookieOptions())
      .json(successResponse(result));
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const tenantSlug = req.headers["x-tenant-slug"];
    const result = await authService.login(
      input,
      typeof tenantSlug === "string" ? tenantSlug.trim().toLowerCase() : undefined,
    );
    res
      .cookie("token", result.token, authCookieOptions())
      .json(successResponse(result));
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", authCookieOptions()).json(successResponse({ ok: true }));
});
