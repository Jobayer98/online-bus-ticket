import { describe, expect, it } from "vitest";
import { toE164Bd } from "./phone.js";

describe("toE164Bd", () => {
  it("normalizes local 01… numbers", () => {
    expect(toE164Bd("01712345678")).toBe("+8801712345678");
  });

  it("keeps numbers already in E.164", () => {
    expect(toE164Bd("+8801712345678")).toBe("+8801712345678");
  });

  it("normalizes 880… without plus", () => {
    expect(toE164Bd("8801712345678")).toBe("+8801712345678");
  });
});
