const STORAGE_PREFIX = "booking-access:";

export function storeBookingAccess(bookingId: string, token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${STORAGE_PREFIX}${bookingId}`, token);
}

export function getStoredBookingAccess(bookingId: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${STORAGE_PREFIX}${bookingId}`);
}

export function buildPaymentUrl(
  scheduleId: string,
  bookingId: string,
  accessToken: string,
): string {
  storeBookingAccess(bookingId, accessToken);
  const q = new URLSearchParams({ bookingId, accessToken });
  return `/booking/${scheduleId}/payment?${q.toString()}`;
}

export function resolveBookingAccessToken(
  bookingId: string,
  fromQuery: string | null,
): string | null {
  return fromQuery ?? getStoredBookingAccess(bookingId);
}

export function bookingAccessQuery(accessToken: string): string {
  return `accessToken=${encodeURIComponent(accessToken)}`;
}
