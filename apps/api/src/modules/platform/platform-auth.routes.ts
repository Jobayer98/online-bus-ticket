import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginSchema, successResponse } from "@repo/shared";
import * as platformAuthService from "./platform-auth.service.js";

export const platformAuthRouter = Router();

const limiter = rateLimit({ windowMs: 60_000, max: 20 });
platformAuthRouter.use(limiter);

platformAuthRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const data = await platformAuthService.platformLogin(input);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
