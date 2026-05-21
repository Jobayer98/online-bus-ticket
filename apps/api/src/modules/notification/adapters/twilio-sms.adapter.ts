import twilio from "twilio";

import { toE164Bd } from "../../../lib/phone.js";
import type { SmsMessage, SmsProvider } from "../notification.ports.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export class TwilioSmsAdapter implements SmsProvider {
  private readonly client: ReturnType<typeof twilio>;
  private readonly fromNumber?: string;
  private readonly messagingServiceSid?: string;

  constructor() {
    const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
    const authToken = requireEnv("TWILIO_AUTH_TOKEN");
    this.fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

    if (!this.fromNumber && !this.messagingServiceSid) {
      throw new Error(
        "Set TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID for SMS",
      );
    }

    this.client = twilio(accountSid, authToken);
  }

  async send(message: SmsMessage): Promise<void> {
    await this.client.messages.create({
      to: toE164Bd(message.to),
      body: message.body,
      ...(this.messagingServiceSid
        ? { messagingServiceSid: this.messagingServiceSid }
        : { from: this.fromNumber! }),
    });
  }
}
