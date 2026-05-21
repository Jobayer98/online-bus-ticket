# Notification: Booking confirmed (internal)

**Trigger:** `POST /api/v1/payments/confirm` (and counter sell) after ticket is issued.  
**Delivery:** BullMQ background queue — HTTP response is not blocked.

## Channels

| Channel | When | Provider | Content |
|---------|------|----------|---------|
| SMS | Always (`passengerPhone`) | Twilio | Confirmation text with PNR, route, date, seats, amount |
| Email | Only if `passengerEmail` set | Nodemailer (SMTP) | HTML summary + **ticket PNG** attachment |

## Queue

- Queue name: `booking-notifications`
- Worker concurrency: 5
- Retries: 3 with exponential backoff (2s base)
- Job id: `booking-notify-{bookingId}` (dedupes re-enqueue on idempotent payment confirm)

## Payload (`BookingTicketNotificationDto`)

Defined in `packages/shared/src/dtos/notification/booking-ticket-notification.dto.ts`.

## Environment

| Variable | Purpose |
|----------|---------|
| `REDIS_URL` | BullMQ connection (default `redis://localhost:6379`) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Twilio API credentials |
| `TWILIO_FROM_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID` | SMS sender |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Nodemailer transport |
| `DISABLE_NOTIFICATION_WORKER` | Set `true` to skip worker (e.g. separate worker process) |

## Audit

`NotificationLog` per `bookingId` + `channel`. Skips resend when status is already `SENT`.

## Errors

Failures do not roll back payment/ticket. BullMQ retries the job; final failure is logged on `NotificationLog.error`.
