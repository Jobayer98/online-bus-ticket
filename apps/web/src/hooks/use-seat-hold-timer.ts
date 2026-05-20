"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

type Options = {
  expiresAt: string | null | undefined;
  onExpired?: () => void;
};

export function useSeatHoldTimer({ expiresAt, onExpired }: Options) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);

  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  const checkExpiry = useCallback(() => {
    if (!expiresAt) {
      setRemainingMs(null);
      return;
    }
    const left = new Date(expiresAt).getTime() - Date.now();
    if (left <= 0) {
      setRemainingMs(0);
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpiredRef.current?.();
      }
      return;
    }
    setRemainingMs(left);
    expiredRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    expiredRef.current = false;
    checkExpiry();
    const id = setInterval(checkExpiry, 1000);
    return () => clearInterval(id);
  }, [checkExpiry]);

  return {
    countdown: remainingMs == null ? null : formatCountdown(remainingMs),
    isExpired: remainingMs === 0,
    remainingMs,
  };
}
