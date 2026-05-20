"use client";

import { useEffect } from "react";

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
    <div className="cp-toast" role="alert" aria-live="assertive">
      <span className="cp-toast__text">{message}</span>
      <button
        type="button"
        className="cp-toast__close"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
