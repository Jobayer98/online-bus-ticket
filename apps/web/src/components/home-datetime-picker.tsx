"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  DatePickerCalendarPanel,
  useCalendarView,
} from "@/components/date-picker-calendar";
import { FloatingPickerPanel } from "@/components/floating-picker-panel";
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

const triggerClass =
  "m-0 box-border flex h-[42px] w-full cursor-pointer items-center justify-between gap-2 border border-[#d5d5d5] bg-white px-3 text-left text-[0.9rem] text-[#333] hover:border-[#aaa]";

const timeSlotClass =
  "cursor-pointer rounded border border-[#d5d5d5] bg-white px-1.5 py-1.5 text-center font-[inherit] text-[0.78rem] font-semibold text-[#333] hover:border-[var(--primary)] hover:bg-[#eef5ee]";

const timeSlotSelectedClass =
  "cursor-pointer rounded border border-[var(--primary)] bg-[var(--primary)] px-1.5 py-1.5 text-center font-[inherit] text-[0.78rem] font-semibold text-white";

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
  const panelRef = useRef<HTMLDivElement>(null);
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
      const target = e.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
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
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        className={`${triggerClass} ${open ? "border-[var(--primary)] shadow-[0_0_0_2px_rgba(46,125,50,0.15)]" : ""}`}
        onClick={openPicker}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={listboxId}
      >
        <span className="min-w-0 flex-1 truncate">
          {date ? (
            <>
              <span className="mr-1.5 font-bold">{dayName},</span>
              <span>{datePart}</span>
              {displayTime && (
                <>
                  <span className="mx-1 text-[#888]">·</span>
                  <span className="font-semibold text-[#333]">{displayTime}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-[#888]">Select date & time</span>
          )}
        </span>
        <span className="flex shrink-0 text-[#666]">
          <CalendarIcon />
        </span>
      </button>

      <FloatingPickerPanel
        open={open}
        anchorRef={rootRef}
        panelRef={panelRef}
        listboxId={listboxId}
        ariaLabel={step === "date" ? "Select date" : "Select time"}
        width={320}
        estimatedHeight={step === "date" ? 360 : 420}
      >
          <div className="mb-2.5 flex items-center justify-between border-b border-[#eee] pb-2">
            {step === "time" ? (
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent py-0.5 pr-1 pl-0 font-[inherit] text-[0.82rem] font-semibold text-[var(--primary-hover)] hover:text-[var(--primary)]"
                onClick={goBackToDate}
                aria-label="Back to date"
              >
                <ChevronLeft />
                <span>Date</span>
              </button>
            ) : (
              <span className="text-[0.85rem] font-bold text-[var(--primary-hover)]">
                Select date
              </span>
            )}
            <span className="text-[0.72rem] font-semibold tracking-widest text-[#888]">
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
            <div className="flex flex-col gap-2.5">
              {draftDisplay && (
                <p className="m-0 rounded bg-[#e8f5e9] px-2.5 py-2 text-[0.88rem] text-[#222]">
                  <span className="font-bold">{draftDisplay.dayName},</span>{" "}
                  {draftDisplay.datePart}
                </p>
              )}
              <p className="m-0 text-[0.8rem] font-semibold text-[#555]">Select time</p>
              <div
                className="grid max-h-[200px] grid-cols-4 gap-1.5 overflow-y-auto"
                role="listbox"
                aria-label="Hour"
              >
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    role="option"
                    aria-selected={draftTime.slice(0, 2) === h}
                    className={
                      draftTime.slice(0, 2) === h ? timeSlotSelectedClass : timeSlotClass
                    }
                    onClick={() =>
                      setDraftTime(`${h}:${draftTime.slice(3, 5)}`)
                    }
                  >
                    {formatHour12(h)}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.75rem] font-semibold text-[#666]">Minute</span>
                <div className="flex flex-wrap gap-1.5">
                  {MINUTES.filter((m) => Number(m) % 5 === 0).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`min-w-12 ${draftTime.slice(3, 5) === m ? timeSlotSelectedClass : timeSlotClass}`}
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
                className="mt-1 w-full cursor-pointer rounded border-0 bg-[var(--primary-hover)] px-3 py-2 font-[inherit] text-[0.85rem] font-bold text-white hover:bg-[#145214]"
                onClick={confirmTime}
              >
                Confirm {draftTime}
              </button>
            </div>
          )}
      </FloatingPickerPanel>
    </div>
  );
}
