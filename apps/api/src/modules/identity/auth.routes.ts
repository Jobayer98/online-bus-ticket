import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerSchema, loginSchema, successResponse } from "@repo/shared";
import * as authService from "./auth.service.js";

export const authRouter = Router();
const authLimiter = rateLimit({ windowMs: 60_000, max: 20 });

authRouter.use(authLimiter);

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res
      .cookie("token", result.token, { httpOnly: true, sameSite: "lax" })
      .json(successResponse(result));
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res
      .cookie("token", result.token, { httpOnly: true, sameSite: "lax" })
      .json(successResponse(result));
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token").json(successResponse({ ok: true }));
});
