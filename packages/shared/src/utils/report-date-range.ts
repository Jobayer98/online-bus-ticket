import { todayInDhaka } from "./date.js";

const TZ = "Asia/Dhaka";

/** Start of calendar day in Asia/Dhaka (UTC instant). */
export function dhakaStartOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+06:00`);
}

/** End of calendar day in Asia/Dhaka (UTC instant, inclusive). */
export function dhakaEndOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999+06:00`);
}

/** Subtract calendar days from a YYYY-MM-DD string (Dhaka calendar). */
export function subtractDaysFromDateStr(dateStr: string, days: number): string {
  const anchor = dhakaStartOfDay(dateStr);
  const shifted = new Date(anchor.getTime() - days * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(shifted);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ReportDateRange = {
  from: Date;
  to: Date;
  fromDate: string;
  toDate: string;
};

/**
 * Parse optional YYYY-MM-DD bounds in Asia/Dhaka.
 * Defaults: `to` = today (Dhaka), `from` = 30 days before `to`.
 * The `to` day is fully inclusive through 23:59:59.999 Dhaka.
 */
export function parseReportDateRange(from?: string, to?: string): ReportDateRange {
  const toDate = to && DATE_RE.test(to) ? to : todayInDhaka();
  const fromDate =
    from && DATE_RE.test(from) ? from : subtractDaysFromDateStr(toDate, 30);

  return {
    from: dhakaStartOfDay(fromDate),
    to: dhakaEndOfDay(toDate),
    fromDate,
    toDate,
  };
}
