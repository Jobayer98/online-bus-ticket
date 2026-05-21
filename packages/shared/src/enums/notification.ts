export const NotificationChannel = {
  SMS: "SMS",
  EMAIL: "EMAIL",
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];
