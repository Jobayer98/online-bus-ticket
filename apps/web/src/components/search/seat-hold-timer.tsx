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
    if (isExpired) return "var(--danger)";
    if (isUrgent) return "var(--danger)";
    if (secondsLeft <= 300) return "var(--warning)";
    return "var(--warning)";
  }, [isExpired, isUrgent, secondsLeft]);

  if (!countdown) return null;

  const baseClass =
    "flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-[0.65rem] text-sm font-semibold";
  const variantMargin =
    variant === "payment" ? "mb-4" : "mx-4 mt-3";
  const stateClass =
    isExpired || isUrgent
      ? " border-red-300 bg-red-50 text-red-900"
      : " border-amber-300 bg-amber-50 text-amber-900";
  const urgentAnim = isUrgent && !isExpired ? " animate-pulse" : "";

  return (
    <div
      className={`${baseClass} ${variantMargin} ${stateClass}${urgentAnim}`}
      role="timer"
      aria-live="polite"
    >
      <div className="shrink-0" aria-hidden>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={RING_R}
            fill="none"
            stroke="var(--border)"
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
      <div className="flex flex-col gap-[0.1rem]">
        <span className="text-xs font-medium">
          {isExpired ? "Seat hold expired" : "Seats reserved for"}
        </span>
        <span className="min-w-[2.75rem] text-lg font-bold tabular-nums">
          {isExpired ? "0:00" : countdown}
        </span>
      </div>
    </div>
  );
}
