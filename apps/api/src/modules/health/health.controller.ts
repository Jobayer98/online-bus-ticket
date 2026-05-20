import type { RequestHandler } from "express";
import { healthDtoSchema, successResponse } from "@repo/shared";

export const getHealth: RequestHandler = (_req, res) => {
  const health = healthDtoSchema.parse({
    status: "ok",
    version: process.env.npm_package_version ?? "0.0.0",
    timestamp: new Date().toISOString(),
  });
  res.json(successResponse(health));
};
