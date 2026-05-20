"use client";

import { useSeatHoldTimer } from "@/hooks/use-seat-hold-timer";

type Props = {
  expiresAt: string;
  onExpired: () => void;
  variant?: "checkout" | "payment";
};

export function SeatHoldTimer({
  expiresAt,
  onExpired,
  variant = "checkout",
}: Props) {
  const { countdown, isExpired } = useSeatHoldTimer({
    expiresAt,
    onExpired,
  });

  if (!countdown) return null;

  return (
    <div
      className={`sp-hold-timer sp-hold-timer--${variant}${isExpired ? " is-expired" : ""}`}
      role="timer"
      aria-live="polite"
    >
      <span className="sp-hold-timer__label">
        {isExpired ? "Seat hold expired" : "Seats reserved for"}
      </span>
      <span className="sp-hold-timer__value">{isExpired ? "0:00" : countdown}</span>
    </div>
  );
}
