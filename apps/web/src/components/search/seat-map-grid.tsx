"use client";

import { m } from "framer-motion";
import { formatMoneyBdt } from "@/lib/format";
import {
  groupSeatsByDeck,
  inferLayoutDimensions,
  normalizeSeatMapSeats,
  splitRowByAisle,
  type SeatCell,
} from "@/lib/seat-layout";

type Props = {
  seats: SeatCell[];
  rows: number;
  cols: number;
  selected: string[];
  onToggle: (label: string, status: string) => void;
};

function seatTierClass(_seatClass: string): string {
  return "";
}

function seatStatusClasses(seat: SeatCell, isSelected: boolean): string {
  const base =
    "relative box-border h-8 w-9 rounded-[var(--radius-sm)] border border-[var(--green-600)] p-0 text-[0.62rem] font-bold font-inherit";
  const tier = seatTierClass(seat.seatClass);
  const isFemale = seat.passengerGender === "Female";

  if (isSelected) {
    return `${base} ${tier} cursor-pointer bg-[var(--primary)] text-on-primary border-[var(--green-800)]`;
  }
  if (seat.status === "HELD" || seat.status === "SOLD") {
    if (isFemale) {
      return `${base} ${tier} inline-flex cursor-not-allowed items-center justify-center border-[#c2185b] bg-[#f06595] text-white`;
    }
    return `${base} ${tier} inline-flex cursor-not-allowed items-center justify-center border-gray-300 bg-gray-100 text-gray-600`;
  }
  return `${base} ${tier} cursor-pointer bg-[var(--green-50)] text-[var(--green-700)]`;
}

function EntryGateIcon() {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ccc] text-[#555] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      style={{
        background: "linear-gradient(180deg, #fafafa 0%, #eee 100%)",
      }}
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect
          x="5"
          y="4"
          width="22"
          height="24"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M16 4v24M5 16h6M21 16h6"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M11 16l3 3 6-6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function SteeringIcon() {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#b8cfb8] text-[var(--primary-hover)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      style={{
        background: "linear-gradient(180deg, #f4faf4 0%, #e2ede2 100%)",
      }}
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle
          cx="16"
          cy="16"
          r="11"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <path
          d="M16 5v4M16 23v4M5 16h4M23 16h4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M8.5 8.5l2.8 2.8M20.7 20.7l2.8 2.8M23.5 8.5l-2.8 2.8M11.3 20.7l-2.8 2.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function SeatButton({
  seat,
  selectedLabels,
  onToggle,
}: {
  seat: SeatCell;
  selectedLabels: string[];
  onToggle: (label: string, status: string) => void;
}) {
  const isSelected = selectedLabels.includes(seat.label);
  const className = seatStatusClasses(seat, isSelected);
  const title = `${seat.label} ${formatMoneyBdt(seat.price)}`;

  if (seat.status !== "AVAILABLE") {
    return (
      <span
        className={className}
        title={title}
        aria-label={`Seat ${seat.label} ${seat.status.toLowerCase()}`}
      >
        {seat.label}
      </span>
    );
  }

  return (
    <m.button
      type="button"
      className={className}
      onClick={() => onToggle(seat.label, seat.status)}
      title={title}
      aria-label={`Seat ${seat.label}`}
      aria-pressed={isSelected}
      whileTap={{ scale: [1, 0.88, 1.08, 1] }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {seat.label}
    </m.button>
  );
}

function SeatRow({
  rowSeats,
  cols,
  selected,
  onToggle,
}: {
  rowSeats: SeatCell[];
  cols: number;
  selected: string[];
  onToggle: (label: string, status: string) => void;
}) {
  const { left, right } = splitRowByAisle(rowSeats, cols);
  const isThreeCol = cols <= 3;

  return (
    <div
      className={`grid items-center gap-1 ${isThreeCol ? "grid-cols-[1fr_28px_2fr]" : "grid-cols-[1fr_28px_1fr]"}`}
    >
      <div className="flex justify-end gap-[0.3rem]">
        {left.map((s) => (
          <SeatButton
            key={s.label}
            seat={s}
            selectedLabels={selected}
            onToggle={onToggle}
          />
        ))}
      </div>
      <span className="block" aria-hidden />
      <div className="flex justify-start gap-[0.3rem]">
        {right.map((s) => (
          <SeatButton
            key={s.label}
            seat={s}
            selectedLabels={selected}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export function SeatMapGrid({ seats, rows, cols, selected, onToggle }: Props) {
  const { rows: layoutRows, cols: layoutCols } = inferLayoutDimensions(
    seats,
    rows || 0,
    cols || 4,
  );
  const normalized = normalizeSeatMapSeats(seats, layoutRows, layoutCols);
  const decks = groupSeatsByDeck(normalized, layoutCols);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="border border-[#ccc] bg-white p-2 px-[0.65rem] pb-3">
        <div className="mb-[0.65rem] flex items-end justify-between gap-2 border-b border-dashed border-[#ddd] px-1 pb-2 pt-[0.35rem]">
          <div
            className="flex min-w-[52px] flex-col items-center gap-[0.2rem]"
            title="Passenger entry"
          >
            <EntryGateIcon />
            <span className="text-[0.58rem] font-bold uppercase leading-none tracking-[0.06em] text-[#777]">
              Entry
            </span>
          </div>
          <div className="min-h-px flex-1" aria-hidden />
          <div
            className="flex min-w-[52px] flex-col items-center gap-[0.2rem]"
            title="Driver"
          >
            <SteeringIcon />
            <span className="text-[0.58rem] font-bold uppercase leading-none tracking-[0.06em] text-[#777]">
              Driver
            </span>
          </div>
        </div>

        {decks.map((deck) => (
          <div key={deck.id}>
            {deck.title && (
              <div className="mb-2 bg-[var(--primary-hover)] px-2 py-[0.3rem] text-center text-[0.72rem] font-bold tracking-[0.06em] text-white">
                {deck.title}
              </div>
            )}
            <div className="flex flex-col gap-[0.35rem]">
              {deck.rows.map((rowSeats) => (
                <SeatRow
                  key={rowSeats.map((s) => s.label).join("-")}
                  rowSeats={rowSeats}
                  cols={layoutCols}
                  selected={selected}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
