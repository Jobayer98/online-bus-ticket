"use client";

import "./home-date-picker.css";
import { useEffect, useId, useRef, useState } from "react";
import {
  DatePickerCalendarPanel,
  useCalendarView,
} from "@/components/date-picker-calendar";
import { formatTripDateDisplay, getTodayIso } from "@/lib/trip-date";

type HomeDateTimePickerProps = {
  /** `YYYY-MM-DDTHH:mm` (datetime-local format) */
  value: string;
  onChange: (datetimeLocal: string) => void;
  minDate?: string;
};

type Step = "date" | "time";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

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

function splitDatetimeLocal(value: string): { date: string; time: string } {
  if (!value || value.length < 10) {
    return { date: "", time: "06:00" };
  }
  const date = value.slice(0, 10);
  const time = value.length >= 16 ? value.slice(11, 16) : "06:00";
  return { date, time };
}

function joinDatetimeLocal(date: string, time: string): string {
  return `${date}T${time}`;
}

function formatHour12(hour: string): string {
  const h = Number(hour);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export function HomeDateTimePicker({
  value,
  onChange,
  minDate = getTodayIso(),
}: HomeDateTimePickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("date");
  const [draftDate, setDraftDate] = useState("");
  const [draftTime, setDraftTime] = useState("06:00");

  const { date, time } = splitDatetimeLocal(value);
  const activeDate = step === "time" ? draftDate : date || draftDate;
  const { viewYear, viewMonth, setView } = useCalendarView(activeDate, minDate);

  useEffect(() => {
    if (!open) return;
    const { date: d, time: t } = splitDatetimeLocal(value);
    setDraftDate(d);
    setDraftTime(t);
    setStep("date");
  }, [open, value]);

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

  const { dayName, datePart } = date
    ? formatTripDateDisplay(date)
    : { dayName: "", datePart: "" };

  const draftDisplay = draftDate ? formatTripDateDisplay(draftDate) : null;

  function openPicker() {
    setOpen((o) => !o);
  }

  function selectDate(iso: string) {
    setDraftDate(iso);
    setStep("time");
  }

  function confirmTime() {
    if (!draftDate) return;
    onChange(joinDatetimeLocal(draftDate, draftTime));
    setOpen(false);
  }

  function goBackToDate() {
    setStep("date");
  }

  const displayTime = value && date ? time : "";

  return (
    <div className="home-date-picker home-datetime-picker" ref={rootRef}>
      <button
        type="button"
        className={`home-date-trigger${open ? " is-open" : ""}`}
        onClick={openPicker}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={listboxId}
      >
        <span className="home-date-trigger-text">
          {date ? (
            <>
              <span className="day-name">{dayName},</span>
              <span>{datePart}</span>
              {displayTime && (
                <>
                  <span className="home-datetime-sep">·</span>
                  <span className="home-datetime-time-part">{displayTime}</span>
                </>
              )}
            </>
          ) : (
            <span className="home-date-placeholder">Select date & time</span>
          )}
        </span>
        <span className="home-date-trigger-icon">
          <CalendarIcon />
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          className="home-date-dropdown home-datetime-dropdown"
          role="dialog"
          aria-label={step === "date" ? "Select date" : "Select time"}
        >
          <div className="home-datetime-step-header">
            {step === "time" ? (
              <button
                type="button"
                className="home-datetime-back"
                onClick={goBackToDate}
                aria-label="Back to date"
              >
                <ChevronLeft />
                <span>Date</span>
              </button>
            ) : (
              <span className="home-datetime-step-title">Select date</span>
            )}
            <span className="home-datetime-step-badge">
              {step === "date" ? "1 / 2" : "2 / 2"}
            </span>
          </div>

          {step === "date" ? (
            <DatePickerCalendarPanel
              value={draftDate || date}
              minDate={minDate}
              onSelectDate={selectDate}
              closeOnSelect={false}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onViewChange={setView}
            />
          ) : (
            <div className="home-datetime-time-step">
              {draftDisplay && (
                <p className="home-datetime-selected-date">
                  <span className="day-name">{draftDisplay.dayName},</span>{" "}
                  {draftDisplay.datePart}
                </p>
              )}
              <p className="home-datetime-time-heading">Select time</p>
              <div className="home-datetime-hour-grid" role="listbox" aria-label="Hour">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    role="option"
                    aria-selected={draftTime.slice(0, 2) === h}
                    className={`home-datetime-hour${draftTime.slice(0, 2) === h ? " is-selected" : ""}`}
                    onClick={() =>
                      setDraftTime(`${h}:${draftTime.slice(3, 5)}`)
                    }
                  >
                    {formatHour12(h)}
                  </button>
                ))}
              </div>
              <div className="home-datetime-minute-row">
                <span className="home-datetime-minute-label">Minute</span>
                <div className="home-datetime-minute-grid">
                  {MINUTES.filter((m) => Number(m) % 5 === 0).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`home-datetime-minute${draftTime.slice(3, 5) === m ? " is-selected" : ""}`}
                      onClick={() =>
                        setDraftTime(`${draftTime.slice(0, 2)}:${m}`)
                      }
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="home-datetime-done"
                onClick={confirmTime}
              >
                Confirm {draftTime}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
