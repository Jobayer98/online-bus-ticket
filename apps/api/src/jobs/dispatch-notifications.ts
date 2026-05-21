import { logger } from "../lib/logger.js";
import { sendBookingNotifications } from "../modules/notification/notification.service.js";
import { getNotificationQueue } from "./notification-queue.js";

/**
 * Enqueue booking notifications (SMS + optional email). Non-blocking for HTTP handlers.
 * In tests, runs inline via setImmediate (no Redis).
 */
export function enqueueBookingNotifications(bookingId: string): void {
  if (process.env.NODE_ENV === "test") {
    setImmediate(() => {
      sendBookingNotifications(bookingId).catch((err) => {
        logger.error({ err, bookingId }, "Background booking notifications failed");
      });
    });
    return;
  }

  const jobId = `booking-notify-${bookingId}`;
  const queue = getNotificationQueue();
  void queue
    .remove(jobId)
    .catch(() => {})
    .then(() =>
      queue.add("send", { bookingId }, { jobId }),
    )
    .catch((err) => {
      logger.error({ err, bookingId }, "Failed to enqueue booking notifications");
    });
}
