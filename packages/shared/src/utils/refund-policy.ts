import { AppError } from "../errors/app-error.js";
import { ErrorCode } from "../errors/error-codes.js";

export type CounterRefundEligibilityInput = {
  bookingStatus: string;
  paymentStatus: string | null | undefined;
  paymentAmount: number | null | undefined;
  totalAmount: number;
  departureAt: Date;
  now?: Date;
};

/** Full refund amount in minor units (poisa). MVP: always booking total. */
export function counterRefundAmount(totalAmount: number): number {
  return totalAmount;
}

export function assertCounterRefundEligible(
  input: CounterRefundEligibilityInput,
): number {
  if (input.bookingStatus === "REFUNDED") {
    throw new AppError(
      ErrorCode.REFUND_NOT_ALLOWED,
      "Booking already refunded",
      409,
    );
  }
  if (input.bookingStatus !== "PAID") {
    throw new AppError(
      ErrorCode.REFUND_NOT_ALLOWED,
      "Only paid bookings can be refunded",
      409,
    );
  }
  if (input.paymentStatus !== "COMPLETED") {
    throw new AppError(
      ErrorCode.REFUND_NOT_ALLOWED,
      "Payment not completed",
      409,
    );
  }
  if (
    input.paymentAmount == null ||
    input.paymentAmount !== input.totalAmount
  ) {
    throw new AppError(
      ErrorCode.REFUND_NOT_ALLOWED,
      "Payment amount does not match booking total",
      409,
    );
  }

  const now = input.now ?? new Date();
  if (input.departureAt.getTime() <= now.getTime()) {
    throw new AppError(
      ErrorCode.REFUND_NOT_ALLOWED,
      "Trip has already departed",
      409,
    );
  }

  return counterRefundAmount(input.totalAmount);
}
