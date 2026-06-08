"use client";

import { useEffect } from "react";
import { cpToast, cpToastClose, cpToastText } from "./counter-tw";

type Props = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function CounterToast({ message, onDismiss, durationMs = 4000 }: Props) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div className={cpToast} role="alert" aria-live="assertive">
      <span className={cpToastText}>{message}</span>
      <button
        type="button"
        className={cpToastClose}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
