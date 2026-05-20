const PREFIX = "ticket-lookup:";

export function storeTicketLookup(
  bookingId: string,
  passengerNumber: string,
  phone: string,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    PREFIX + bookingId,
    JSON.stringify({ passengerNumber, phone }),
  );
}

export function readTicketLookup(bookingId: string): {
  passengerNumber: string;
  phone: string;
} | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PREFIX + bookingId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { passengerNumber: string; phone: string };
  } catch {
    return null;
  }
}
