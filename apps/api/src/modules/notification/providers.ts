import type { EmailProvider, SmsProvider } from "./notification.ports.js";
import { NodemailerEmailAdapter } from "./adapters/nodemailer-email.adapter.js";
import { TwilioSmsAdapter } from "./adapters/twilio-sms.adapter.js";

let smsProvider: SmsProvider | null = null;
let emailProvider: EmailProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (!smsProvider) {
    smsProvider = new TwilioSmsAdapter();
  }
  return smsProvider;
}

export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    emailProvider = new NodemailerEmailAdapter();
  }
  return emailProvider;
}
