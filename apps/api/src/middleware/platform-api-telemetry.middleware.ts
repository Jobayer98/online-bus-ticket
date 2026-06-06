import type { RequestHandler } from "express";
import { prisma } from "@repo/database";
import { logger } from "../lib/logger.js";

const SKIP_PREFIXES = [
  "/api/v1/platform/",
  "/api/v1/health",
  "/api/docs",
];

function shouldSkip(path: string): boolean {
  return SKIP_PREFIXES.some((p) => path.startsWith(p));
}

export const platformApiTelemetryMiddleware: RequestHandler = (
  req,
  res,
  next,
) => {
  if (shouldSkip(req.path)) return next();

  const started = Date.now();

  res.on("finish", () => {
    const responseTimeMs = Date.now() - started;
    const endpoint = req.route?.path
      ? `${req.baseUrl}${req.route.path}`
      : req.path;

    void prisma.platformApiLog
      .create({
        data: {
          tenantId: req.tenant?.id ?? null,
          userId: req.userId ?? null,
          method: req.method,
          endpoint,
          statusCode: res.statusCode,
          responseTimeMs,
        },
      })
      .catch((err) => {
        logger.warn({ err }, "Failed to write platform API log");
      });
  });

  next();
};
