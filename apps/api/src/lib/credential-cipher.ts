import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const DEV_KEY = Buffer.alloc(32, "dev-payment-key-32bytes!!");

function getEncryptionKey(): Buffer {
  const raw = process.env.PAYMENT_CREDENTIALS_KEY;
  if (process.env.NODE_ENV === "production") {
    if (!raw) {
      throw new Error(
        "PAYMENT_CREDENTIALS_KEY is required in production (32-byte base64)",
      );
    }
    const key = Buffer.from(raw, "base64");
    if (key.length !== 32) {
      throw new Error("PAYMENT_CREDENTIALS_KEY must decode to 32 bytes");
    }
    return key;
  }
  if (!raw) return DEV_KEY;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? key : DEV_KEY;
}

/** Encrypt JSON-serializable credentials for DB storage. */
export function encryptCredentials(payload: unknown): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Decrypt credentials blob from DB. */
export function decryptCredentials<T>(blob: string): T {
  const key = getEncryptionKey();
  const data = Buffer.from(blob, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8")) as T;
}

export function encryptPlaintext(plaintext: string): string {
  return encryptCredentials({ value: plaintext });
}

export function decryptPlaintext(blob: string): string {
  const parsed = decryptCredentials<{ value: string }>(blob);
  return parsed.value;
}
