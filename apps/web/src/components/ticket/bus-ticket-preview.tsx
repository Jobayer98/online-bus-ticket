"use client";

import { useState } from "react";
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
    <div className="ticket-preview-shell">
      <BusTicketCard ticket={ticket} captureId={captureId} />
      <div className="ticket-preview__actions">
        <button
          type="button"
          className={`ticket-preview__btn ticket-preview__btn--primary${downloading ? " btn-is-busy" : ""}`}
          disabled={downloading}
          aria-busy={downloading}
          onClick={() => void handleDownload()}
        >
          {downloading ? "Downloading…" : "↓ Download ticket (PNG)"}
        </button>
        {children}
      </div>
      {hint ? <p className="ticket-preview__hint">{hint}</p> : null}
      {downloadError ? (
        <p className="sp-panel-error ticket-preview__error" role="alert">
          {downloadError}
        </p>
      ) : null}
    </div>
  );
}
