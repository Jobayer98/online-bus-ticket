"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api-client";
import { BusTicketPreview } from "@/components/ticket/bus-ticket-preview";
import type { TicketDto } from "@repo/shared";

const TICKET_CAPTURE_ID = "bus-ticket-download-lookup";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

export function TicketDownloadForm() {
  const [pnr, setPnr] = useState("");
  const [mobile, setMobile] = useState("");
  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTicket(null);

    const passengerNumber = pnr.trim();
    const phone = mobile.replace(/\s/g, "").trim();

    if (!passengerNumber || !phone) {
      setError("Please enter both PNR number and mobile number.");
      return;
    }
    if (!/^\d{11}$/.test(phone)) {
      setError("Enter the 11-digit mobile number used when booking.");
      return;
    }

    setSearching(true);
    try {
      const q = new URLSearchParams({ passengerNumber, phone });
      const r = await apiGet<TicketDto>(`/tickets/lookup?${q}`);
      setTicket(r.data);
    } catch {
      setError(
        "Ticket not found. Check your PNR and mobile number, then try again.",
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="ticket-download-wrap">
      <form
        className="ticket-download-form"
        onSubmit={(e) => void handleSearch(e)}
        noValidate
      >
        <p className="ticket-download-hint">
          Please provide your Ticket PNR number and Mobile number which you used
          while purchasing the ticket
        </p>

        <div className="ticket-download-fields">
          <div className="ticket-download-field">
            <label htmlFor="ticket-pnr">PNR No</label>
            <input
              id="ticket-pnr"
              name="pnr"
              type="text"
              autoComplete="off"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
            />
          </div>
          <div className="ticket-download-field">
            <label htmlFor="ticket-mobile">Mobile No</label>
            <input
              id="ticket-mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={`ticket-download-search${searching ? " btn-is-busy" : ""}`}
            disabled={searching}
            aria-busy={searching}
          >
            <SearchIcon />
            {searching ? "Searching…" : "SEARCH"}
          </button>
        </div>

        {error ? (
          <p className="ticket-download-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {ticket ? (
        <section className="ticket-download-preview" aria-label="Your e-ticket">
          <BusTicketPreview
            ticket={ticket}
            captureId={TICKET_CAPTURE_ID}
            hint="The downloaded image matches this ticket exactly."
          />
        </section>
      ) : null}
    </div>
  );
}
