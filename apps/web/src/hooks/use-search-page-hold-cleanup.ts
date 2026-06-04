"use client";

import { useEffect } from "react";
import {
  getActiveHoldId,
  HOLD_BOOKING_IN_PROGRESS_KEY,
  releaseActiveHold,
  releaseActiveHoldKeepalive,
} from "@/lib/active-hold";
import { randomId } from "@/lib/random-id";

function isPageReload(): boolean {
  const nav = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === "reload";
}

/**
 * Search page only. Releases stale holds after reload.
 * Does not release on unmount (SPA → payment keeps the hold).
 */
export function useSearchPageHoldCleanup() {
  useEffect(() => {
    const reload = isPageReload();

    if (reload) {
      sessionStorage.removeItem("searchPageLoadToken");
      sessionStorage.removeItem("holdCreatedOnLoadToken");
      void releaseActiveHold();
    } else {
      const bookingInFlight =
        sessionStorage.getItem(HOLD_BOOKING_IN_PROGRESS_KEY) === "1";
      if (!bookingInFlight) {
        const loadToken = sessionStorage.getItem("searchPageLoadToken");
        const holdId = getActiveHoldId();
        const holdToken = sessionStorage.getItem("holdCreatedOnLoadToken");
        if (holdId && holdToken && loadToken && holdToken !== loadToken) {
          void releaseActiveHold();
        }
      }
    }

    if (!sessionStorage.getItem("searchPageLoadToken")) {
      sessionStorage.setItem("searchPageLoadToken", randomId());
    }

    const onPageHide = (event: PageTransitionEvent) => {
      // Soft navigation (e.g. to payment) must not release the hold.
      if (!event.persisted && isPageReload()) {
        releaseActiveHoldKeepalive();
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);
}
