"use client";

import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useSiteTheme } from "@/components/site-theme-provider";
import {
  formatDateDdMmYyyy,
  formatMoneyBdt,
  formatTime12h,
  slugToRouteTitle,
} from "@/lib/format";
import type { TicketDto } from "@repo/shared";

type Props = {
  ticket: TicketDto;
  /** Set when embedding for PNG capture (stable id). */
  captureId?: string;
};

function barcodePattern(passengerNumber: string): string {
  let hash = 0;
  for (let i = 0; i < passengerNumber.length; i++) {
    hash = (hash << 5) - hash + passengerNumber.charCodeAt(i);
    hash |= 0;
  }
  const bits: number[] = [];
  for (let i = 0; i < 48; i++) {
    hash = (hash * 1103515245 + 12345) | 0;
    bits.push((hash >>> 16) & 1);
  }
  return bits.map((b) => (b ? "3" : "1")).join("");
}

export function BusTicketCard({ ticket, captureId }: Props) {
  const { profile } = useSiteTheme();
  const departureDate = formatDateDdMmYyyy(ticket.departureAt.slice(0, 10));
  const departureTime = formatTime12h(ticket.departureAt);
  const routeTitle = slugToRouteTitle(ticket.routeSlug);
  const seats =
    ticket.seatLabels.length === 1
      ? ticket.seatLabels[0]
      : ticket.seatLabels.join(", ");
  const bars = barcodePattern(ticket.passengerNumber);

  return (
    <article
      id={captureId}
      className="bus-ticket"
      aria-label={`E-ticket ${ticket.passengerNumber}`}
    >
      <div className="bus-ticket__stub bus-ticket__stub--left" aria-hidden />
      <div className="bus-ticket__body">
        <header className="bus-ticket__head">
          <div className="bus-ticket__brand">
            <BrandLogo className="brand-logo bus-ticket__logo" />
            <div>
              <p className="bus-ticket__brand-name">{profile.companyName}</p>
              <p className="bus-ticket__brand-tag">Online bus ticket</p>
            </div>
          </div>
          <span className="bus-ticket__status">
            <CheckCircle2 size={14} aria-hidden />
            Confirmed
          </span>
        </header>

        <div className="bus-ticket__route-block">
          <p className="bus-ticket__route-label">Journey</p>
          <h2 className="bus-ticket__route">{routeTitle}</h2>
        </div>

        <dl className="bus-ticket__grid">
          <div>
            <dt>PNR</dt>
            <dd className="bus-ticket__pnr pnr">{ticket.passengerNumber}</dd>
          </div>
          <div>
            <dt>Travel date</dt>
            <dd>{departureDate}</dd>
          </div>
          <div>
            <dt>Departure</dt>
            <dd className="time">{departureTime}</dd>
          </div>
          <div>
            <dt>Seat(s)</dt>
            <dd>{seats}</dd>
          </div>
          <div>
            <dt>Boarding point</dt>
            <dd>{ticket.boardingPoint}</dd>
          </div>
          <div>
            <dt>Passenger</dt>
            <dd>{ticket.passengerName}</dd>
          </div>
          <div>
            <dt>Mobile</dt>
            <dd>{ticket.passengerPhone}</dd>
          </div>
          <div>
            <dt>Fare</dt>
            <dd className="bus-ticket__fare fare">{formatMoneyBdt(ticket.totalAmount)}</dd>
          </div>
        </dl>

        <footer className="bus-ticket__foot">
          <div className="bus-ticket__barcode" aria-hidden>
            {bars.split("").map((w, i) => (
              <span
                key={i}
                className="bus-ticket__bar"
                style={{ flex: Number(w) }}
              />
            ))}
          </div>
          <p className="bus-ticket__foot-note">
            Present this ticket (printed or on mobile) with a valid ID at boarding.
            Keep your PNR and phone number for support.
          </p>
        </footer>
      </div>
      <div className="bus-ticket__stub bus-ticket__stub--right" aria-hidden />
    </article>
  );
}
