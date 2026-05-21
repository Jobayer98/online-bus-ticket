import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import type { EmailMessage, EmailProvider } from "../notification.ports.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export class NodemailerEmailAdapter implements EmailProvider {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    const host = requireEnv("SMTP_HOST");
    const port = Number(process.env.SMTP_PORT ?? "587");
    const user = requireEnv("SMTP_USER");
    const pass = requireEnv("SMTP_PASS");
    this.from = requireEnv("SMTP_FROM");

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      attachments: message.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  }
}
