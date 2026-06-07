"use client";

import { useMemo } from "react";
import { m, useSpring } from "framer-motion";
import { useSeatHoldTimer } from "@/hooks/use-seat-hold-timer";

type Props = {
  expiresAt: string;
  onExpired: () => void;
  variant?: "checkout" | "payment";
  /** Total hold duration in seconds (default 12 min). */
  totalSeconds?: number;
};

const RING_R = 18;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

export function SeatHoldTimer({
  expiresAt,
  onExpired,
  variant = "checkout",
  totalSeconds = 12 * 60,
}: Props) {
  const { countdown, isExpired, remainingMs } = useSeatHoldTimer({
    expiresAt,
    onExpired,
  });

  const secondsLeft = remainingMs == null ? totalSeconds : Math.ceil(remainingMs / 1000);
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const targetOffset = CIRCUMFERENCE * (1 - progress);

  const strokeOffset = useSpring(targetOffset, {
    stiffness: 80,
    damping: 20,
  });

  const isUrgent = secondsLeft <= 120 && !isExpired;

  const ringColor = useMemo(() => {
    if (isExpired) return "var(--color-danger)";
    if (isUrgent) return "var(--color-danger)";
    if (secondsLeft <= 300) return "var(--color-warning)";
    return "var(--color-warning)";
  }, [isExpired, isUrgent, secondsLeft]);

  if (!countdown) return null;

  return (
    <div
      className={`sp-hold-timer sp-hold-timer--${variant}${isExpired ? " is-expired" : ""}${isUrgent ? " is-urgent" : ""}`}
      role="timer"
      aria-live="polite"
    >
      <div className="sp-hold-timer__ring-wrap" aria-hidden>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={RING_R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
          />
          <m.circle
            cx="22"
            cy="22"
            r={RING_R}
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{
              strokeDashoffset: strokeOffset,
              rotate: -90,
              transformOrigin: "center",
            }}
          />
        </svg>
      </div>
      <div className="sp-hold-timer__text">
        <span className="sp-hold-timer__label">
          {isExpired ? "Seat hold expired" : "Seats reserved for"}
        </span>
        <span className="sp-hold-timer__value">{isExpired ? "0:00" : countdown}</span>
      </div>
    </div>
  );
}
