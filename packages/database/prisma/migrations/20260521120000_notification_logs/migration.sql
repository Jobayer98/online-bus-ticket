-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "error" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_logs_status_created_at_idx" ON "notification_logs"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_logs_booking_id_channel_key" ON "notification_logs"("booking_id", "channel");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
