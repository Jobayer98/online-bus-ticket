"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { readTicketLookup, storeTicketLookup } from "@/lib/ticket-lookup-session";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";
import { BusTicketPreview } from "@/components/ticket/bus-ticket-preview";
import type { TicketDto } from "@repo/shared";

const TICKET_CAPTURE_ID = "bus-ticket-download";

const ticketGhostBtnClass =
  "box-border flex w-full cursor-pointer items-center justify-center gap-[0.45rem] rounded-md border-2 border-[var(--primary)] bg-white px-4 py-3 text-[0.95rem] font-bold text-[var(--green-900,#14532d)] no-underline transition-[background,transform] duration-150 hover:bg-[var(--green-50,#f0fdf4)]";

export function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const passengerNumber = searchParams.get("passengerNumber")?.trim() ?? "";
  const bookingId = searchParams.get("bookingId")?.trim() ?? "";

  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);

  const loadTicket = useCallback(
    async (phone: string) => {
      if (!passengerNumber) {
        setError("Missing ticket reference.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const q = new URLSearchParams({ passengerNumber, phone });
        const r = await apiGet<TicketDto>(`/tickets/lookup?${q}`);
        setTicket(r.data);
        if (bookingId) {
          storeTicketLookup(bookingId, passengerNumber, phone);
        }
        setNeedsPhone(false);
      } catch {
        setError(
          "Could not load your ticket. Check your mobile number and try again.",
        );
        setTicket(null);
        setNeedsPhone(true);
      } finally {
        setLoading(false);
      }
    },
    [passengerNumber, bookingId],
  );

  useEffect(() => {
    if (!passengerNumber) {
      setError("Missing ticket reference.");
      setLoading(false);
      return;
    }
    const stored = bookingId ? readTicketLookup(bookingId) : null;
    const phone = stored?.phone ?? "";
    if (phone) {
      void loadTicket(phone);
    } else {
      setNeedsPhone(true);
      setLoading(false);
    }
  }, [passengerNumber, bookingId, loadTicket]);

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = phoneInput.replace(/\s/g, "");
    if (!/^\d{11}$/.test(phone)) {
      setError("Enter the 11-digit mobile number used when booking.");
      return;
    }
    void loadTicket(phone);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f0ea] via-[#f4f6f8] via-40% to-white">
      <HomeHeader />
      <div className="mx-auto max-w-[520px] px-4 pb-10 pt-5">
        <div className="mb-5 text-center">
          <div
            className="mb-[0.65rem] inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--primary)] text-2xl font-bold text-white shadow-[0_4px_14px_rgba(46,125,50,0.35)]"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="m-0 text-[1.35rem] font-extrabold tracking-[-0.02em] text-[#1a237e]">
            Booking confirmed
          </h1>
          <p className="mt-[0.4rem] text-[0.88rem] text-[#546e7a]">
            Your payment was successful. Save or download your e-ticket below.
          </p>
        </div>

        {needsPhone && !ticket && !loading && (
          <form
            className="mt-4 rounded-lg border border-[#cfd8dc] bg-white p-4"
            onSubmit={handlePhoneSubmit}
          >
            <label
              htmlFor="confirm-phone"
              className="mb-[0.35rem] block text-[0.8rem] font-semibold text-[#455a64]"
            >
              Mobile number (used when booking)
            </label>
            <input
              id="confirm-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              className="mb-3 w-full rounded border border-[#b0bec5] px-[0.65rem] py-[0.55rem] text-base"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="01XXXXXXXXX"
            />
            <button
              type="submit"
              className={`box-border flex w-full cursor-pointer items-center justify-center gap-[0.45rem] rounded-md border-none px-4 py-3 text-[0.95rem] font-bold text-white no-underline transition-[background,transform] duration-150 bg-gradient-to-b from-[var(--primary)] to-[var(--green-900)] shadow-[0_3px_12px_rgba(27,94,32,0.3)] hover:brightness-105 disabled:cursor-wait disabled:opacity-65${loading ? " cursor-wait opacity-65" : ""}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Loading…" : "Show ticket"}
            </button>
          </form>
        )}

        {ticket && (
          <BusTicketPreview
            ticket={ticket}
            captureId={TICKET_CAPTURE_ID}
            hint="The downloaded image matches this ticket exactly. You can also retrieve it anytime from Download Ticket using your PNR and phone."
          >
            <Link href="/" className={ticketGhostBtnClass}>
              Book another trip
            </Link>
            <Link href="/ticket" className={ticketGhostBtnClass}>
              Download ticket later
            </Link>
          </BusTicketPreview>
        )}

        {error && (
          <p className="mt-4 text-center text-[0.75rem] text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
      <SearchFooter />
    </div>
  );
}
