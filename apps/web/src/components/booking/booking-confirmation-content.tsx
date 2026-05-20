"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { downloadElementAsPng } from "@/lib/download-ticket-png";
import { readTicketLookup, storeTicketLookup } from "@/lib/ticket-lookup-session";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";
import { BusTicketCard } from "@/components/ticket/bus-ticket-card";
import type { TicketDto } from "@repo/shared";

const TICKET_CAPTURE_ID = "bus-ticket-download";

export function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const passengerNumber = searchParams.get("passengerNumber")?.trim() ?? "";
  const bookingId = searchParams.get("bookingId")?.trim() ?? "";

  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
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

  async function handleDownload() {
    const el = document.getElementById(TICKET_CAPTURE_ID);
    if (!el || !ticket) return;
    setDownloading(true);
    try {
      await downloadElementAsPng(
        el,
        `ticket-${ticket.passengerNumber}.png`,
      );
    } catch {
      setError("Download failed. Please try again or use Print Screen.");
    } finally {
      setDownloading(false);
    }
  }

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
    <div className="search-page confirmation-page">
      <HomeHeader />
      <div className="confirmation-page__inner">
        <div className="confirmation-page__success">
          <div className="confirmation-page__success-icon" aria-hidden>
            ✓
          </div>
          <h1 className="confirmation-page__title">Booking confirmed</h1>
          <p className="confirmation-page__subtitle">
            Your payment was successful. Save or download your e-ticket below.
          </p>
        </div>

        {loading && (
          <p className="confirmation-page__subtitle" aria-live="polite">
            Loading your ticket…
          </p>
        )}

        {needsPhone && !ticket && !loading && (
          <form
            className="confirmation-page__phone-form"
            onSubmit={handlePhoneSubmit}
          >
            <label htmlFor="confirm-phone">
              Mobile number (used when booking)
            </label>
            <input
              id="confirm-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="01XXXXXXXXX"
            />
            <button
              type="submit"
              className="confirmation-page__btn confirmation-page__btn--primary"
            >
              Show ticket
            </button>
          </form>
        )}

        {ticket && (
          <>
            <BusTicketCard ticket={ticket} captureId={TICKET_CAPTURE_ID} />
            <div className="confirmation-page__actions">
              <button
                type="button"
                className="confirmation-page__btn confirmation-page__btn--primary"
                disabled={downloading}
                onClick={() => void handleDownload()}
              >
                {downloading ? "Preparing download…" : "↓ Download ticket (PNG)"}
              </button>
              <Link
                href="/"
                className="confirmation-page__btn confirmation-page__btn--ghost"
              >
                Book another trip
              </Link>
              <Link
                href="/ticket"
                className="confirmation-page__btn confirmation-page__btn--ghost"
              >
                Download ticket later
              </Link>
            </div>
            <p className="confirmation-page__hint">
              The downloaded image matches this ticket exactly. You can also
              retrieve it anytime from Download Ticket using your PNR and phone.
            </p>
          </>
        )}

        {error && (
          <p className="sp-panel-error confirmation-page__error" role="alert">
            {error}
          </p>
        )}
      </div>
      <SearchFooter />
    </div>
  );
}
