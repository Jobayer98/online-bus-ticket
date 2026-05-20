import type { SeatMapDto } from "@repo/shared";
import { buildSeatLabel, parseSeatLabel } from "@repo/shared";

export type SeatCell = SeatMapDto["seats"][number];

export type SeatDeckId = "LOWER" | "UPPER" | "MAIN";

export type SeatDeckSection = {
  id: SeatDeckId;
  title: string;
  rows: SeatCell[][];
};

export function seatRow(seat: SeatCell): number {
  if (seat.row > 0) return seat.row;
  const parsed = parseSeatLabel(seat.label).row;
  return parsed > 0 ? parsed : seat.row;
}

export function seatCol(seat: SeatCell): number {
  if (seat.col > 0) return seat.col;
  const parsed = parseSeatLabel(seat.label).col;
  return parsed > 0 ? parsed : seat.col;
}

/** Ensure every layout cell has a seat (missing → SOLD). */
export function normalizeSeatMapSeats(
  seats: SeatCell[],
  rows: number,
  cols: number,
): SeatCell[] {
  if (!rows || !cols || seats.length === 0) {
    return seats.map((s) => ({
      ...s,
      row: seatRow(s) || s.row,
      col: seatCol(s) || s.col,
    }));
  }

  const byPosition = new Map<string, SeatCell>();
  const byLabel = new Map(seats.map((s) => [s.label, s]));

  for (const s of seats) {
    const r = seatRow(s);
    const c = seatCol(s);
    if (r > 0 && c > 0) {
      byPosition.set(`${r}-${c}`, { ...s, row: r, col: c });
    }
  }

  const filled: SeatCell[] = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const label = buildSeatLabel(r, c);
      const existing =
        byPosition.get(`${r}-${c}`) ??
        byLabel.get(label) ??
        seats.find((s) => seatRow(s) === r && seatCol(s) === c);

      if (existing) {
        filled.push({
          ...existing,
          label: existing.label || label,
          row: r,
          col: c,
        });
      } else {
        filled.push({
          label,
          row: r,
          col: c,
          seatClass: "STANDARD",
          status: "SOLD",
          price: seats.find((s) => s.status === "AVAILABLE")?.price ?? seats[0]?.price ?? 0,
        });
      }
    }
  }

  return filled;
}

export function detectDeck(label: string): SeatDeckId {
  const { deck } = parseSeatLabel(label);
  if (deck === "U") return "UPPER";
  if (deck === "L") return "LOWER";
  return "MAIN";
}

export function deckTitle(id: SeatDeckId): string {
  if (id === "UPPER") return "UPPER DECK";
  if (id === "LOWER") return "LOWER DECK";
  return "";
}

export function hasMultiDeck(seats: SeatCell[]): boolean {
  const decks = new Set(seats.map((s) => detectDeck(s.label)));
  return decks.has("LOWER") && decks.has("UPPER");
}

export function groupSeatsByRow(seats: SeatCell[]): SeatCell[][] {
  const rows = new Map<number, SeatCell[]>();
  for (const s of seats) {
    const row = seatRow(s);
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(s);
  }
  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, rowSeats]) => rowSeats.sort((a, b) => seatCol(a) - seatCol(b)));
}

export function groupSeatsByDeck(seats: SeatCell[], cols: number): SeatDeckSection[] {
  if (!hasMultiDeck(seats)) {
    return [{ id: "MAIN", title: "", rows: groupSeatsByRow(seats) }];
  }

  const byDeck = new Map<SeatDeckId, SeatCell[]>();
  for (const s of seats) {
    const deck = detectDeck(s.label);
    const key = deck === "MAIN" ? "LOWER" : deck;
    if (!byDeck.has(key)) byDeck.set(key, []);
    byDeck.get(key)!.push(s);
  }

  const order: SeatDeckId[] = ["LOWER", "UPPER"];
  return order
    .filter((id) => byDeck.has(id))
    .map((id) => ({
      id,
      title: deckTitle(id),
      rows: groupSeatsByRow(byDeck.get(id)!),
    }));
}

/** Split index: seats before aisle | aisle | seats after */
export function aisleSplitIndex(cols: number): number {
  if (cols <= 3) return 1;
  return Math.floor(cols / 2);
}

export function splitRowByAisle(rowSeats: SeatCell[], cols: number) {
  const split = aisleSplitIndex(cols);
  const left: SeatCell[] = [];
  const right: SeatCell[] = [];

  for (const s of rowSeats) {
    const c = seatCol(s);
    if (c <= split) left.push(s);
    else right.push(s);
  }

  return { left, right, split };
}

export function seatStatusClass(
  seat: SeatCell,
  selected: boolean,
): string {
  if (selected) return "is-selected";
  if (seat.status === "SOLD" || seat.status === "HELD") return "is-sold";
  return "is-available";
}
