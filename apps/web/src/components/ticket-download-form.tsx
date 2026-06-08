"use client";

import { useState } from "react";
import { btnBusyClass } from "@/components/brand-loading-overlay";
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
    <div className="mx-auto">
      <form
        className="mx-auto"
        onSubmit={(e) => void handleSearch(e)}
        noValidate
      >
        <p className="mx-auto mb-7 max-w-[640px] text-[0.95rem] leading-relaxed text-[#8b1a1a]">
          Please provide your Ticket PNR number and Mobile number which you used
          while purchasing the ticket
        </p>

        <div className="flex flex-wrap items-end justify-center gap-4 max-[640px]:flex-col max-[640px]:items-stretch">
          <div className="min-w-[200px] text-left max-[640px]:w-full max-[640px]:min-w-0">
            <label htmlFor="ticket-pnr" className="mb-1.5 block text-[0.95rem] font-medium text-[#222]">
              PNR No
            </label>
            <input
              id="ticket-pnr"
              name="pnr"
              type="text"
              autoComplete="off"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              className="box-border h-[42px] w-full rounded border border-[#c5c5c5] bg-white px-3 text-base focus:border-[#5b9bd5] focus:shadow-[0_0_0_2px_rgba(91,155,213,0.25)] focus:outline-none"
            />
          </div>
          <div className="min-w-[200px] text-left max-[640px]:w-full max-[640px]:min-w-0">
            <label htmlFor="ticket-mobile" className="mb-1.5 block text-[0.95rem] font-medium text-[#222]">
              Mobile No
            </label>
            <input
              id="ticket-mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="box-border h-[42px] w-full rounded border border-[#c5c5c5] bg-white px-3 text-base focus:border-[#5b9bd5] focus:shadow-[0_0_0_2px_rgba(91,155,213,0.25)] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className={`inline-flex h-[42px] items-center justify-center gap-1.5 rounded border-0 bg-[var(--primary-hover)] px-5 font-[inherit] text-[0.9rem] font-bold tracking-widest whitespace-nowrap text-white hover:bg-[#145214] max-[640px]:w-full ${searching ? btnBusyClass : ""}`}
            disabled={searching}
            aria-busy={searching}
          >
            <SearchIcon />
            {searching ? "Searching…" : "SEARCH"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-[0.9rem] text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {ticket ? (
        <section
          className="mt-8 rounded-lg bg-gradient-to-b from-[#e8f0ea] via-[#f4f6f8] via-40% to-white px-4 py-8"
          aria-label="Your e-ticket"
        >
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
