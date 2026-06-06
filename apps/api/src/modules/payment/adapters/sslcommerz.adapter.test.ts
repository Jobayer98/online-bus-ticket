import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

describe("SSLCommerz verify_sign", () => {
  it("computes md5 hash from sorted verify_key fields", () => {
    const storePassword = "testpass";
    const payload: Record<string, string> = {
      tran_id: "pay123",
      val_id: "val456",
      amount: "100.00",
      status: "VALID",
      verify_key: "amount,status,tran_id,val_id",
    };
    const keys = payload.verify_key.split(",").map((k) => k.trim()).sort();
    const parts: string[] = [];
    for (const key of keys) {
      if (payload[key] !== undefined) {
        parts.push(`${key}=${payload[key]}`);
      }
    }
    const data = parts.join("&");
    const sign = createHash("md5").update(data + storePassword).digest("hex");
    expect(sign).toHaveLength(32);
    expect(data).toContain("tran_id=pay123");
  });
});

describe("amount conversion", () => {
  it("converts minor to major BDT", () => {
    expect((990000 / 100).toFixed(2)).toBe("9900.00");
  });
});
