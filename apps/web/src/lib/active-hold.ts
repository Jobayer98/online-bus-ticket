import { apiDelete } from "@/lib/api-client";
import { holdReleaseQuery } from "@/lib/guest-session";
import { randomId } from "@/lib/random-id";

const HOLD_ID_KEY = "activeSeatHoldId";
const SEARCH_PAGE_LOAD_TOKEN_KEY = "searchPageLoadToken";
const HOLD_CREATED_ON_LOAD_KEY = "holdCreatedOnLoadToken";
/** Set while POST /bookings is in flight — do not release hold. */
export const HOLD_BOOKING_IN_PROGRESS_KEY = "holdBookingInProgress";
/** Set before client navigation to payment — do not release hold. */
export const HOLD_PAYMENT_NAV_KEY = "holdPaymentNavigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function shouldSkipHoldRelease(): boolean {
  return (
    sessionStorage.getItem(HOLD_BOOKING_IN_PROGRESS_KEY) === "1" ||
    sessionStorage.getItem(HOLD_PAYMENT_NAV_KEY) === "1"
  );
}

function getOrCreateSearchPageLoadToken(): string {
  let token = sessionStorage.getItem(SEARCH_PAGE_LOAD_TOKEN_KEY);
  if (!token) {
    token = randomId();
    sessionStorage.setItem(SEARCH_PAGE_LOAD_TOKEN_KEY, token);
  }
  return token;
}

export function setActiveHoldId(holdId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOLD_ID_KEY, holdId);
  sessionStorage.setItem(
    HOLD_CREATED_ON_LOAD_KEY,
    getOrCreateSearchPageLoadToken(),
  );
}

export function getActiveHoldId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(HOLD_ID_KEY);
}

export function clearActiveHoldId() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HOLD_ID_KEY);
}

export function isSeatHoldRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/search") ||
    /^\/booking\/[^/]+\/payment$/.test(pathname)
  );
}

export function markHoldBookingInProgress() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOLD_BOOKING_IN_PROGRESS_KEY, "1");
}

export function clearHoldBookingInProgress() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HOLD_BOOKING_IN_PROGRESS_KEY);
}

export function markHoldPaymentNavigation() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOLD_PAYMENT_NAV_KEY, "1");
}

export function clearHoldPaymentNavigation() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HOLD_PAYMENT_NAV_KEY);
}

/** Best-effort release during page unload (reload, close tab). */
export function releaseActiveHoldKeepalive(): void {
  if (shouldSkipHoldRelease()) return;
  const holdId = getActiveHoldId();
  if (!holdId) return;
  clearActiveHoldId();
  fetch(`${API_URL}/api/v1/bookings/hold/${holdId}${holdReleaseQuery()}`, {
    method: "DELETE",
    credentials: "include",
    keepalive: true,
  }).catch(() => {
    /* hold may already be released or expired */
  });
}

export async function releaseActiveHold(): Promise<void> {
  if (typeof window !== "undefined" && shouldSkipHoldRelease()) return;
  const holdId = getActiveHoldId();
  if (!holdId) return;
  clearActiveHoldId();
  try {
    await apiDelete(`/bookings/hold/${holdId}${holdReleaseQuery()}`);
  } catch {
    /* hold may already be released or expired */
  }
}
