import { describe, expect, it } from "vitest";
import { AppError } from "@repo/shared";
import {
  assertCounterRefundEligible,
  counterRefundAmount,
} from "@repo/shared";

describe("assertCounterRefundEligible", () => {
  const future = new Date(Date.now() + 60 * 60 * 1000);
  const past = new Date(Date.now() - 60 * 60 * 1000);

  const base = {
    bookingStatus: "PAID",
    paymentStatus: "COMPLETED",
    paymentAmount: 85000,
    totalAmount: 85000,
    departureAt: future,
  };

  it("returns full refund amount when eligible", () => {
    expect(assertCounterRefundEligible(base)).toBe(85000);
    expect(counterRefundAmount(85000)).toBe(85000);
  });

  it("rejects departed trips", () => {
    expect(() =>
      assertCounterRefundEligible({ ...base, departureAt: past }),
    ).toThrow(AppError);
    try {
      assertCounterRefundEligible({ ...base, departureAt: past });
    } catch (e) {
      expect(e).toMatchObject({
        code: "REFUND_NOT_ALLOWED",
        statusCode: 409,
        message: "Trip has already departed",
      });
    }
  });

  it("rejects non-PAID bookings", () => {
    expect(() =>
      assertCounterRefundEligible({ ...base, bookingStatus: "HELD" }),
    ).toThrow(AppError);
  });

  it("rejects already refunded bookings", () => {
    expect(() =>
      assertCounterRefundEligible({ ...base, bookingStatus: "REFUNDED" }),
    ).toThrow(AppError);
  });

  it("rejects payment amount mismatch", () => {
    expect(() =>
      assertCounterRefundEligible({ ...base, paymentAmount: 80000 }),
    ).toThrow(AppError);
  });
});
