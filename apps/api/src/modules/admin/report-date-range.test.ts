import { describe, expect, it } from "vitest";
import {
  dhakaEndOfDay,
  dhakaStartOfDay,
  parseReportDateRange,
} from "@repo/shared";

describe("parseReportDateRange", () => {
  it("parses Dhaka calendar bounds with end-of-day inclusive", () => {
    const { from, to } = parseReportDateRange("2026-05-01", "2026-05-02");
    expect(from.toISOString()).toBe("2026-04-30T18:00:00.000Z");
    expect(to.toISOString()).toBe("2026-05-02T17:59:59.999Z");
  });

  it("includes late-evening Dhaka sales on the last day", () => {
    const { to } = parseReportDateRange("2026-05-01", "2026-05-31");
    const lateDhaka = new Date("2026-05-31T22:30:00+06:00");
    expect(lateDhaka.getTime()).toBeLessThanOrEqual(to.getTime());
  });

  it("defaults to 30-day window ending today in Dhaka", () => {
    const range = parseReportDateRange();
    expect(range.from.getTime()).toBeLessThan(range.to.getTime());
    expect(range.toDate >= range.fromDate).toBe(true);
  });
});

describe("dhakaStartOfDay / dhakaEndOfDay", () => {
  it("uses UTC+6 offset", () => {
    expect(dhakaStartOfDay("2026-05-20").toISOString()).toBe(
      "2026-05-19T18:00:00.000Z",
    );
    expect(dhakaEndOfDay("2026-05-20").toISOString()).toBe(
      "2026-05-20T17:59:59.999Z",
    );
  });
});
