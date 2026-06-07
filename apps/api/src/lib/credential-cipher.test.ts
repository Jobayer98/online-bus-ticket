import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  decryptCredentials,
  encryptCredentials,
  decryptPlaintext,
  encryptPlaintext,
} from "./credential-cipher.js";

describe("credential-cipher", () => {
  const prev = process.env.PAYMENT_CREDENTIALS_KEY;

  beforeEach(() => {
    process.env.PAYMENT_CREDENTIALS_KEY = Buffer.alloc(32, "test-key-32-bytes-long!!").toString(
      "base64",
    );
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.PAYMENT_CREDENTIALS_KEY;
    else process.env.PAYMENT_CREDENTIALS_KEY = prev;
  });

  it("round-trips JSON credentials", () => {
    const creds = { storeId: "demo", storePassword: "secret" };
    const blob = encryptCredentials(creds);
    expect(decryptCredentials<typeof creds>(blob)).toEqual(creds);
  });

  it("round-trips plaintext wrapper", () => {
    const blob = encryptPlaintext("1234567890");
    expect(decryptPlaintext(blob)).toBe("1234567890");
  });
});
