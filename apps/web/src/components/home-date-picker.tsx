"use client";

import "./home-date-picker.css";
import { useEffect, useId, useRef, useState } from "react";
import { DatePickerCalendar, useCalendarView } from "@/components/date-picker-calendar";
import { formatTripDateDisplay, getTodayIso } from "@/lib/trip-date";

type HomeDatePickerProps = {
  value: string;
  onChange: (isoDate: string) => void;
  minDate?: string;
};

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

export function HomeDatePicker({
  value,
  onChange,
  minDate = getTodayIso(),
}: HomeDatePickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { viewYear, viewMonth, setView } = useCalendarView(value, minDate);

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

  return (
    <div className="home-date-picker" ref={rootRef}>
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
            <>
              <span className="day-name">{dayName},</span>
              <span>{datePart}</span>
            </>
          ) : (
            <span className="home-date-placeholder">Select date</span>
          )}
        </span>
        <span className="home-date-trigger-icon">
          <CalendarIcon />
        </span>
      </button>

      {open && (
        <DatePickerCalendar
          listboxId={listboxId}
          value={value}
          minDate={minDate}
          onSelectDate={onChange}
          closeOnSelect
          onClose={() => setOpen(false)}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onViewChange={setView}
        />
      )}
    </div>
  );
}
