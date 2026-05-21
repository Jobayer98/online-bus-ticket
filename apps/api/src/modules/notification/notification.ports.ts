export type SmsMessage = {
  to: string;
  body: string;
};

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
};

export interface SmsProvider {
  send(message: SmsMessage): Promise<void>;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}
