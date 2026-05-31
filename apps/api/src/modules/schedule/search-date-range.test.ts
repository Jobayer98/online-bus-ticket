import { describe, expect, it } from "vitest";
import { TimePeriod } from "@repo/shared";
import { getTimePeriod } from "@repo/shared";
import {
  buildScheduleDepartureWhere,
  dhakaTimePeriodDepartureFilter,
  dhakaTripDayBounds,
} from "@repo/shared";

describe("dhakaTripDayBounds", () => {
  it("uses Asia/Dhaka calendar day boundaries", () => {
    const { gte, lte } = dhakaTripDayBounds("2026-05-31");
    expect(gte.toISOString()).toBe("2026-05-30T18:00:00.000Z");
    expect(lte.toISOString()).toBe("2026-05-31T17:59:59.999Z");
  });
});

describe("dhakaTimePeriodDepartureFilter", () => {
  it("aligns MORNING bucket with getTimePeriod", () => {
    const range = dhakaTimePeriodDepartureFilter("2026-05-31", TimePeriod.MORNING);
    expect("OR" in range).toBe(false);
    if ("OR" in range) return;

    const sample = new Date("2026-05-31T04:30:00.000Z");
    expect(sample.getTime()).toBeGreaterThanOrEqual(range.gte.getTime());
    expect(sample.getTime()).toBeLessThanOrEqual(range.lte.getTime());
    expect(getTimePeriod(sample)).toBe(TimePeriod.MORNING);
  });

  it("models NIGHT as evening plus early-morning on the same calendar day", () => {
    const range = dhakaTimePeriodDepartureFilter("2026-05-31", TimePeriod.NIGHT);
    expect("OR" in range).toBe(true);
    if (!("OR" in range)) return;

    const late = new Date("2026-05-31T17:30:00.000Z");
    const early = new Date("2026-05-30T22:30:00.000Z");
    expect(getTimePeriod(late)).toBe(TimePeriod.NIGHT);
    expect(getTimePeriod(early)).toBe(TimePeriod.NIGHT);
  });
});

describe("buildScheduleDepartureWhere", () => {
  it("combines trip day with time period filter", () => {
    const where = buildScheduleDepartureWhere("2026-05-31", TimePeriod.NOON);
    expect(where).toHaveProperty("departureAt");
  });

  it("uses AND for NIGHT within the trip day", () => {
    const where = buildScheduleDepartureWhere("2026-05-31", TimePeriod.NIGHT);
    expect(where).toHaveProperty("AND");
  });
});
