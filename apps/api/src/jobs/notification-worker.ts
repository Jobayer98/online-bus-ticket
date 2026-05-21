import { Worker } from "bullmq";

import { getRedisConnection, closeRedisConnection } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { sendBookingNotifications } from "../modules/notification/notification.service.js";
import {
  BOOKING_NOTIFICATION_QUEUE,
  closeNotificationQueue,
  type BookingNotificationJobData,
} from "./notification-queue.js";

let worker: Worker<BookingNotificationJobData> | null = null;

export function startNotificationWorker(): Worker<BookingNotificationJobData> {
  if (worker) return worker;

  worker = new Worker<BookingNotificationJobData>(
    BOOKING_NOTIFICATION_QUEUE,
    async (job) => {
      await sendBookingNotifications(job.data.bookingId);
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ bookingId: job.data.bookingId, jobId: job.id }, "Notification job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error(
      { err, bookingId: job?.data.bookingId, jobId: job?.id },
      "Notification job failed",
    );
  });

  logger.info("BullMQ notification worker started");
  return worker;
}

export async function stopNotificationWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  await closeNotificationQueue();
  await closeRedisConnection();
}
