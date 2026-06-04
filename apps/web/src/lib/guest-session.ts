import { randomId } from "@/lib/random-id";

/** Stable browser session id for guest seat holds (localStorage). */
export function getGuestSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = randomId();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

export function holdReleaseQuery(): string {
  const sessionId = getGuestSessionId();
  return sessionId
    ? `?sessionId=${encodeURIComponent(sessionId)}`
    : "";
}
