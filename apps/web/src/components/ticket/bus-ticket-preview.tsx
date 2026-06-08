"use client";

import { useState } from "react";
import { btnBusyClass } from "@/components/brand-loading-overlay";
import { downloadElementAsPng } from "@/lib/download-ticket-png";
import { BusTicketCard } from "@/components/ticket/bus-ticket-card";
import type { TicketDto } from "@repo/shared";

type Props = {
  ticket: TicketDto;
  /** DOM id on the ticket card for PNG capture. */
  captureId?: string;
  /** Optional note below the action buttons. */
  hint?: string;
  /** Extra actions (e.g. links) rendered below the download button. */
  children?: React.ReactNode;
};

/**
 * Reusable e-ticket preview + PNG download — same UI after payment and on /ticket lookup.
 */
export function BusTicketPreview({
  ticket,
  captureId = "bus-ticket-preview",
  hint,
  children,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownload() {
    const el = document.getElementById(captureId);
    if (!el) return;
    setDownloadError("");
    setDownloading(true);
    try {
      await downloadElementAsPng(el, `ticket-${ticket.passengerNumber}.png`);
    } catch {
      setDownloadError(
        "Download failed. Please try again or use Print Screen.",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[520px] text-left">
      <BusTicketCard ticket={ticket} captureId={captureId} />
      <div className="mt-5 flex flex-col gap-2.5">
        <button
          type="button"
          className={`box-border flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border-0 bg-gradient-to-b from-[var(--primary)] to-[var(--green-900,#14532d)] px-4 py-3 text-[0.95rem] font-bold text-white shadow-[0_3px_12px_rgba(27,94,32,0.3)] hover:brightness-105 disabled:cursor-wait disabled:opacity-65 ${downloading ? btnBusyClass : ""}`}
          disabled={downloading}
          aria-busy={downloading}
          onClick={() => void handleDownload()}
        >
          {downloading ? "Downloading…" : "↓ Download ticket (PNG)"}
        </button>
        {children}
      </div>
      {hint ? (
        <p className="mt-3 mb-0 text-center text-[0.78rem] leading-snug text-[#78909c]">
          {hint}
        </p>
      ) : null}
      {downloadError ? (
        <p className="mt-3 text-center text-[0.9rem] text-[var(--danger)]" role="alert">
          {downloadError}
        </p>
      ) : null}
    </div>
  );
}
