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

const stubClass =
  "relative w-3.5 shrink-0 bg-[repeating-linear-gradient(180deg,var(--green-900,#14532d)_0,var(--green-900,#14532d)_8px,var(--primary,#15803d)_8px,var(--primary,#15803d)_16px)] after:absolute after:inset-y-0 after:w-1.5 after:content-[''] after:[background:radial-gradient(circle_at_0_12px,#f4f6f8_5px,transparent_5px)] after:[background-size:6px_24px]";

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
      className="flex items-stretch drop-shadow-[0_8px_28px_rgba(26,35,126,0.12)]"
      aria-label={`E-ticket ${ticket.passengerNumber}`}
    >
      <div className={`${stubClass} rounded-l-[10px] after:right-[-3px]`} aria-hidden />
      <div className="min-w-0 flex-1 border-y-4 border-[var(--primary)] bg-white px-[1.15rem] py-4 pb-[1.1rem]">
        <header className="-mx-[1.15rem] -mt-4 mb-4 flex items-start justify-between gap-3 bg-[var(--green-900,#14532d)] px-[1.15rem] py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="inline-flex shrink-0 items-center gap-2 no-underline text-white [&_img]:h-12 [&_img]:w-12 [&_span]:text-white [&_small]:text-white/80" />
            <div>
              <p className="m-0 text-[0.722rem] font-bold tracking-tight text-white">
                {profile.companyName}
              </p>
              <p className="mt-0.5 mb-0 text-[0.611rem] text-white/82">
                Online bus ticket
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-100)] px-2.5 py-1 text-[0.611rem] font-bold whitespace-nowrap text-[var(--green-800)]">
            <CheckCircle2 size={14} aria-hidden />
            Confirmed
          </span>
        </header>

        <div className="mb-4">
          <p className="m-0 text-[0.68rem] font-semibold tracking-widest text-[#90a4ae] uppercase">
            Journey
          </p>
          <h2 className="mt-0.5 mb-0 text-[1.15rem] leading-tight font-extrabold tracking-tight text-[#1a237e] max-[400px]:text-base">
            {routeTitle}
          </h2>
        </div>

        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2.5 max-[400px]:grid-cols-1">
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              PNR
            </dt>
            <dd className="mt-0.5 mb-0 text-[1.05rem] font-bold tracking-wide text-[var(--green-900,#14532d)] tabular-nums">
              {ticket.passengerNumber}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Travel date
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[#263238]">
              {departureDate}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Departure
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[#263238] tabular-nums">
              {departureTime}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Seat(s)
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[#263238]">
              {seats}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Boarding point
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[#263238]">
              {ticket.boardingPoint}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Passenger
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[#263238]">
              {ticket.passengerName}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Mobile
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[#263238]">
              {ticket.passengerPhone}
            </dd>
          </div>
          <div>
            <dt className="m-0 text-[0.65rem] font-semibold tracking-wide text-[#90a4ae] uppercase">
              Fare
            </dt>
            <dd className="mt-0.5 mb-0 text-[0.88rem] font-bold text-[var(--green-900,#14532d)] tabular-nums">
              {formatMoneyBdt(ticket.totalAmount)}
            </dd>
          </div>
        </dl>

        <footer className="mt-4 border-t-2 border-dashed border-[#e0e0e0] pt-3.5">
          <div className="mb-2.5 flex h-9 items-stretch gap-0.5 rounded bg-[#fafafa] px-2 py-1" aria-hidden>
            {bars.split("").map((w, i) => (
              <span
                key={i}
                className="min-w-0.5 rounded-sm bg-[#1a237e]"
                style={{ flex: Number(w) }}
              />
            ))}
          </div>
          <p className="m-0 text-[0.68rem] leading-snug text-[#78909c]">
            Present this ticket (printed or on mobile) with a valid ID at boarding.
            Keep your PNR and phone number for support.
          </p>
        </footer>
      </div>
      <div className={`${stubClass} rounded-r-[10px] after:left-[-3px] after:scale-x-[-1]`} aria-hidden />
    </article>
  );
}
