import { Queue } from "bullmq";

import { getRedisConnection } from "../lib/redis.js";

export const BOOKING_NOTIFICATION_QUEUE = "booking-notifications";

export type BookingNotificationJobData = {
  bookingId: string;
};

let queue: Queue<BookingNotificationJobData> | null = null;

export function getNotificationQueue(): Queue<BookingNotificationJobData> {
  if (!queue) {
    queue = new Queue<BookingNotificationJobData>(BOOKING_NOTIFICATION_QUEUE, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    });
  }
  return queue;
}

export async function closeNotificationQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
