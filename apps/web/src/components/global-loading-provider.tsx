"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrandLoadingOverlay } from "@/components/brand-loading-overlay";

type GlobalLoadingContextValue = {
  /** Increment global loading (pair with stop, or use useGlobalLoading). */
  start: () => void;
  /** Decrement global loading. */
  stop: () => void;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(
  null,
);

function useGlobalLoadingContext() {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error("useGlobalLoading must be used within GlobalLoadingProvider");
  }
  return ctx;
}

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const start = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const stop = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const value = useMemo(() => ({ start, stop }), [start, stop]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      <BrandLoadingOverlay active={count > 0} />
    </GlobalLoadingContext.Provider>
  );
}

/** Sync global overlay with a boolean (e.g. local loading state). */
export function useGlobalLoading(active: boolean) {
  const { start, stop } = useGlobalLoadingContext();

  useEffect(() => {
    if (!active) return;
    start();
    return () => stop();
  }, [active, start, stop]);
}
