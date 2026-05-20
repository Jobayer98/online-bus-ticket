/** Trip dates use Asia/Dhaka calendar day per AGENTS.md default. */
export const TRIP_TIMEZONE = "Asia/Dhaka";

export function formatIsoDateInTimezone(
  date: Date,
  timeZone = TRIP_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getTodayIso(timeZone = TRIP_TIMEZONE): string {
  return formatIsoDateInTimezone(new Date(), timeZone);
}

export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return formatIsoDateInTimezone(d);
}

export function formatTripDateDisplay(isoDate: string) {
  const d = parseIsoDate(isoDate);
  const dayName = d.toLocaleDateString("en-GB", { weekday: "long" });
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return { dayName, datePart };
}

export function compareIsoDates(a: string, b: string): number {
  return a.localeCompare(b);
}

export function getCalendarCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, -startOffset + i + 1);
    cells.push({
      iso: toIso(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: toIso(year, month, day), day, inMonth: true });
  }

  let trailing = 1;
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, trailing);
    cells.push({
      iso: toIso(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: false,
    });
    trailing++;
  }

  return cells;
}

function toIso(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
