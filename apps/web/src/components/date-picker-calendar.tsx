"use client";

import { useEffect, useState } from "react";
import {
  addDaysIso,
  compareIsoDates,
  getCalendarCells,
  getTodayIso,
  parseIsoDate,
} from "@/lib/trip-date";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M9 3L5 7l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type DatePickerCalendarPanelProps = {
  value: string;
  minDate: string;
  onSelectDate: (iso: string) => void;
  closeOnSelect?: boolean;
  onClose?: () => void;
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
};

export function DatePickerCalendarPanel({
  value,
  minDate,
  onSelectDate,
  closeOnSelect = true,
  onClose,
  viewYear,
  viewMonth,
  onViewChange,
}: DatePickerCalendarPanelProps) {
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );

  const cells = getCalendarCells(viewYear, viewMonth);
  const todayIso = getTodayIso();
  const tomorrowIso = addDaysIso(todayIso, 1);

  function selectDate(iso: string) {
    if (compareIsoDates(iso, minDate) < 0) return;
    onSelectDate(iso);
    if (closeOnSelect) onClose?.();
  }

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    onViewChange(d.getFullYear(), d.getMonth());
  }

  const minYear = Number(minDate.slice(0, 4));
  const minMonth = Number(minDate.slice(5, 7)) - 1;
  const canGoPrev =
    viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);

  return (
    <>
      <div className="home-date-shortcuts">
        <button
          type="button"
          className={value === todayIso ? "is-selected" : ""}
          onClick={() => selectDate(todayIso)}
        >
          Today
        </button>
        <button
          type="button"
          className={value === tomorrowIso ? "is-selected" : ""}
          onClick={() => selectDate(tomorrowIso)}
        >
          Tomorrow
        </button>
      </div>

      <div className="home-date-cal-header">
        <button
          type="button"
          className="home-date-nav"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <span className="home-date-month">{monthLabel}</span>
        <button
          type="button"
          className="home-date-nav"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="home-date-weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="home-date-grid" role="grid">
        {cells.map((cell) => {
          const disabled = compareIsoDates(cell.iso, minDate) < 0;
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === value;
          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              className={[
                "home-date-day",
                !cell.inMonth && "is-outside",
                disabled && "is-disabled",
                isToday && "is-today",
                isSelected && "is-selected",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              onClick={() => selectDate(cell.iso)}
              aria-label={cell.iso}
              aria-selected={isSelected}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </>
  );
}

export type DatePickerCalendarProps = DatePickerCalendarPanelProps & {
  listboxId: string;
  ariaLabel?: string;
};

export function DatePickerCalendar({
  listboxId,
  ariaLabel = "Choose date",
  ...panel
}: DatePickerCalendarProps) {
  return (
    <div
      id={listboxId}
      className="home-date-dropdown"
      role="dialog"
      aria-label={ariaLabel}
    >
      <DatePickerCalendarPanel {...panel} />
    </div>
  );
}

export function useCalendarView(value: string, minDate: string) {
  const viewDate = value ? parseIsoDate(value) : parseIsoDate(minDate);
  const [viewYear, setViewYear] = useState(viewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(viewDate.getMonth());

  useEffect(() => {
    if (!value) return;
    const d = parseIsoDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  return {
    viewYear,
    viewMonth,
    setView: (year: number, month: number) => {
      setViewYear(year);
      setViewMonth(month);
    },
  };
}
