import type { Express } from "express";
import { createApp } from "../app.js";
import { errorHandler } from "../middleware/error-handler.js";

/** Express app wired like production, without listening or background jobs. */
export async function createTestApp(): Promise<Express> {
  const app = await createApp();
  app.use(errorHandler);
  return app;
}
