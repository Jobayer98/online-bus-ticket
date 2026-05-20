import "./load-env.js";

import { createApp } from "./app.js";
import { errorHandler } from "./middleware/error-handler.js";
import { startHoldExpiryJob } from "./jobs/expire-holds.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.API_PORT ?? 4000);

async function main() {
  const app = await createApp();

  app.use(errorHandler);
  startHoldExpiryJob();

  app.listen(port, () => {
    logger.info(`API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
