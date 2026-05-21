/** Normalize Bangladesh mobile numbers to E.164 for Twilio (+880…). */
export function toE164Bd(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 10) return `+88${digits}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  return `+${digits}`;
}
