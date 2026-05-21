import "./load-env.js";

import { prisma } from "@repo/database";
import { createApp } from "./app.js";
import { errorHandler } from "./middleware/error-handler.js";
import { startHoldExpiryJob } from "./jobs/expire-holds.js";
import { startNotificationWorker, stopNotificationWorker } from "./jobs/notification-worker.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.API_PORT ?? 4000);

async function assertNotificationSchema(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM notification_logs LIMIT 1`;
  } catch {
    logger.error(
      "Table notification_logs is missing. Run: pnpm db:migrate — notifications will fail until then.",
    );
  }
}

async function main() {
  const app = await createApp();

  app.use(errorHandler);
  startHoldExpiryJob();

  if (process.env.DISABLE_NOTIFICATION_WORKER !== "true") {
    await assertNotificationSchema();
    startNotificationWorker();
  }

  const server = app.listen(port, () => {
    logger.info(`API listening on http://localhost:${port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down API");
    server.close();
    await stopNotificationWorker();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
