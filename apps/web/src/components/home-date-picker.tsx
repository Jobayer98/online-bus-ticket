"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  addDaysIso,
  compareIsoDates,
  formatTripDateDisplay,
  getCalendarCells,
  getTodayIso,
  parseIsoDate,
} from "@/lib/trip-date";

type HomeDatePickerProps = {
  value: string;
  onChange: (isoDate: string) => void;
  minDate?: string;
  /** Compact display for search bar (dd/mm/yyyy, no trailing icon). */
  compact?: boolean;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5 2v2M11 2v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

export function HomeDatePicker({
  value,
  onChange,
  minDate = getTodayIso(),
  compact = false,
}: HomeDatePickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const viewDate = value ? parseIsoDate(value) : parseIsoDate(minDate);
  const [viewYear, setViewYear] = useState(viewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(viewDate.getMonth());

  useEffect(() => {
    if (!value) return;
    const d = parseIsoDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const { dayName, datePart } = value
    ? formatTripDateDisplay(value)
    : { dayName: "", datePart: "" };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );

  const cells = getCalendarCells(viewYear, viewMonth);
  const todayIso = getTodayIso();
  const tomorrowIso = addDaysIso(todayIso, 1);

  function selectDate(iso: string) {
    if (compareIsoDates(iso, minDate) < 0) return;
    onChange(iso);
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const minYear = Number(minDate.slice(0, 4));
  const minMonth = Number(minDate.slice(5, 7)) - 1;
  const canGoPrev =
    viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);

  return (
    <div
      className={`home-date-picker${compact ? " home-date-picker--compact" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className={`home-date-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={listboxId}
      >
        <span className="home-date-trigger-text">
          {value ? (
            compact ? (
              <span>{datePart}</span>
            ) : (
              <>
                <span className="day-name">{dayName},</span>
                <span>{datePart}</span>
              </>
            )
          ) : (
            <span className="home-date-placeholder">Select date</span>
          )}
        </span>
        {!compact && (
          <span className="home-date-trigger-icon">
            <CalendarIcon />
          </span>
        )}
      </button>

      {open && (
        <div
          id={listboxId}
          className="home-date-dropdown"
          role="dialog"
          aria-label="Choose trip date"
        >
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
        </div>
      )}
    </div>
  );
}
