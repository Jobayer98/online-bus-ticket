/** Parse a simple CSV string into rows of string cells. Handles quoted fields. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);

  return rows;
}

export function parseCsvToObjects<T extends string>(
  text: string,
  requiredHeaders: readonly T[],
): { headers: string[]; rows: Record<T, string>[] } {
  const table = parseCsv(text.trim());
  if (table.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const headers = table[0]!.map((h) => h.trim());
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required column: ${required}`);
    }
  }

  const rows = table.slice(1).map((cells) => {
    const obj = {} as Record<T, string>;
    for (const header of headers) {
      const idx = headers.indexOf(header);
      obj[header as T] = cells[idx] ?? "";
    }
    return obj;
  });

  return { headers, rows };
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
