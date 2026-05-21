/**
 * Retry SMS/email for a paid booking (e.g. after fixing migration or provider config).
 * Usage: pnpm notifications:retry <bookingId>
 */
import "../apps/api/src/load-env.js";
import { prisma } from "@repo/database";
import { NotificationStatus } from "@repo/shared";
import { sendBookingNotifications } from "../apps/api/src/modules/notification/notification.service.js";
import { stopNotificationWorker } from "../apps/api/src/jobs/notification-worker.js";

const bookingId = process.argv[2];
if (!bookingId) {
  console.error("Usage: pnpm notifications:retry <bookingId>");
  process.exit(1);
}

sendBookingNotifications(bookingId)
  .then(async () => {
    const logs = await prisma.notificationLog.findMany({
      where: { bookingId },
      orderBy: { channel: "asc" },
    });
    for (const log of logs) {
      const line = `${log.channel}: ${log.status}${log.error ? ` — ${log.error}` : ""}`;
      console.log(line);
      if (log.status === NotificationStatus.FAILED) {
        process.exitCode = 1;
      }
    }
    if (process.exitCode === 1) {
      console.error("\nOne or more channels failed. Fix provider config and retry.");
    } else {
      console.log(`\nAll notifications OK for booking ${bookingId}`);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => stopNotificationWorker());
