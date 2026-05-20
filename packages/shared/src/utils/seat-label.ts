const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type SeatDeckPrefix = "L" | "U";

/** Build label: row letter + column number (e.g. A1, B2). Optional L/U for decks (LA1). */
export function buildSeatLabel(
  row: number,
  col: number,
  deck?: SeatDeckPrefix,
): string {
  const letter = ROW_LETTERS[row - 1] ?? String(row);
  const base = `${letter}${col}`;
  return deck ? `${deck}${base}` : base;
}

export type ParsedSeatLabel = {
  row: number;
  col: number;
  deck?: SeatDeckPrefix;
};

/**
 * Parse seat labels:
 * - A1, B2 (row letter + col number)
 * - LA1, UA3 (deck prefix + row letter + col number)
 * - Legacy: 1A, 2B (row number + col letter)
 */
export function parseSeatLabel(label: string): ParsedSeatLabel {
  let deck: SeatDeckPrefix | undefined;
  let body = label.trim();

  if (/^L/i.test(body)) {
    deck = "L";
    body = body.slice(1);
  } else if (/^U/i.test(body)) {
    deck = "U";
    body = body.slice(1);
  }

  const legacy = body.match(/^(\d+)([A-Z])$/i);
  if (legacy) {
    return {
      row: Number.parseInt(legacy[1]!, 10),
      col: legacy[2]!.toUpperCase().charCodeAt(0) - 64,
      deck,
    };
  }

  const modern = body.match(/^([A-Z]+)(\d+)$/i);
  if (modern) {
    const letters = modern[1]!.toUpperCase();
    let row = 0;
    for (let i = 0; i < letters.length; i++) {
      row = row * 26 + (letters.charCodeAt(i) - 64);
    }
    return {
      row,
      col: Number.parseInt(modern[2]!, 10),
      deck,
    };
  }

  return { row: 0, col: 0, deck };
}
