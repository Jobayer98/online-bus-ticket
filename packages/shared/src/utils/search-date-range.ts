import { TimePeriod, type TimePeriod as TimePeriodType } from "../enums/index.js";
import { dhakaEndOfDay, dhakaStartOfDay } from "./report-date-range.js";

type DateRange = { gte: Date; lte: Date };

/** Inclusive Dhaka calendar-day bounds for a trip date (YYYY-MM-DD). */
export function dhakaTripDayBounds(dateStr: string): DateRange {
  return { gte: dhakaStartOfDay(dateStr), lte: dhakaEndOfDay(dateStr) };
}

function dhakaTimeOnDate(
  dateStr: string,
  hour: number,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  const s = String(second).padStart(2, "0");
  const ms =
    millisecond > 0 ? `.${String(millisecond).padStart(3, "0")}` : "";
  return new Date(`${dateStr}T${h}:${m}:${s}${ms}+06:00`);
}

/**
 * Departure window for a time period on a Dhaka calendar day.
 * Matches `getTimePeriod` hour buckets in Asia/Dhaka.
 */
export function dhakaTimePeriodDepartureFilter(
  dateStr: string,
  period: TimePeriodType,
): DateRange | { OR: DateRange[] } {
  switch (period) {
    case TimePeriod.MORNING:
      return {
        gte: dhakaTimeOnDate(dateStr, 5),
        lte: dhakaTimeOnDate(dateStr, 10, 59, 59, 999),
      };
    case TimePeriod.NOON:
      return {
        gte: dhakaTimeOnDate(dateStr, 11),
        lte: dhakaTimeOnDate(dateStr, 13, 59, 59, 999),
      };
    case TimePeriod.AFTERNOON:
      return {
        gte: dhakaTimeOnDate(dateStr, 14),
        lte: dhakaTimeOnDate(dateStr, 17, 59, 59, 999),
      };
    case TimePeriod.NIGHT:
      return {
        OR: [
          {
            gte: dhakaTimeOnDate(dateStr, 18),
            lte: dhakaEndOfDay(dateStr),
          },
          {
            gte: dhakaStartOfDay(dateStr),
            lte: dhakaTimeOnDate(dateStr, 4, 59, 59, 999),
          },
        ],
      };
  }
}

type DepartureWhere =
  | { departureAt: DateRange }
  | { AND: [{ departureAt: DateRange }, { OR: Array<{ departureAt: DateRange }> }] };

/** Merge trip-day bounds with an optional time-period filter for Prisma `where`. */
export function buildScheduleDepartureWhere(
  dateStr: string,
  timePeriod?: TimePeriodType,
): DepartureWhere {
  const day = dhakaTripDayBounds(dateStr);
  if (!timePeriod) {
    return { departureAt: day };
  }

  const period = dhakaTimePeriodDepartureFilter(dateStr, timePeriod);
  if ("OR" in period) {
    return {
      AND: [
        { departureAt: day },
        { OR: period.OR.map((range) => ({ departureAt: range })) },
      ],
    };
  }

  return {
    departureAt: {
      gte: new Date(Math.max(day.gte.getTime(), period.gte.getTime())),
      lte: new Date(Math.min(day.lte.getTime(), period.lte.getTime())),
    },
  };
}
