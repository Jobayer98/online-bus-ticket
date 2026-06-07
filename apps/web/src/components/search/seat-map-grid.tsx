"use client";

import { m } from "framer-motion";
import { formatMoneyBdt } from "@/lib/format";
import {
  groupSeatsByDeck,
  normalizeSeatMapSeats,
  seatStatusClass,
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

function EntryGateIcon() {
  return (
    <span className="seat-map-entry-icon" aria-hidden>
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
    <span className="seat-map-driver-icon" aria-hidden>
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
  const className = `seat-cell seat-cell--${seat.seatClass.toLowerCase()} ${seatStatusClass(seat, isSelected)}`;
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
    <div className={`seat-map-row${isThreeCol ? " seat-map-row--3col" : ""}`}>
      <div className="seat-map-row-side seat-map-row-side--left">
        {left.map((s) => (
          <SeatButton
            key={s.label}
            seat={s}
            selectedLabels={selected}
            onToggle={onToggle}
          />
        ))}
      </div>
      <span className="seat-map-aisle" aria-hidden />
      <div className="seat-map-row-side seat-map-row-side--right">
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
  const layoutCols = cols || 4;
  const layoutRows = rows || 0;
  const normalized = normalizeSeatMapSeats(seats, layoutRows, layoutCols);
  const decks = groupSeatsByDeck(normalized, layoutCols);

  return (
    <div className="seat-map-grid">
      <div className="seat-map-cabin">
        <div className="seat-map-cabin-top">
          <div className="seat-map-entry" title="Passenger entry">
            <EntryGateIcon />
            <span className="seat-map-cabin-label">Entry</span>
          </div>
          <div className="seat-map-cabin-top-spacer" aria-hidden />
          <div className="seat-map-driver" title="Driver">
            <SteeringIcon />
            <span className="seat-map-cabin-label">Driver</span>
          </div>
        </div>

        {decks.map((deck) => (
          <div key={deck.id} className="seat-map-deck">
            {deck.title && (
              <div className="seat-map-deck-title">{deck.title}</div>
            )}
            <div className="seat-map-deck-body">
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
