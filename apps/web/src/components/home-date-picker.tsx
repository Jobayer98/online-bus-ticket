"use client";

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

const triggerClass =
  "m-0 box-border flex h-[42px] w-full cursor-pointer items-center justify-between gap-2 border border-[#d5d5d5] bg-white px-3 text-left text-[0.9rem] text-[#333] hover:border-[#aaa]";

export function HomeDatePicker({
  value,
  onChange,
  minDate = getTodayIso(),
}: HomeDatePickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { viewYear, viewMonth, setView } = useCalendarView(value, minDate);

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

  const { dayName, datePart } = value
    ? formatTripDateDisplay(value)
    : { dayName: "", datePart: "" };

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        className={`${triggerClass} ${open ? "border-[var(--primary)] shadow-[0_0_0_2px_rgba(46,125,50,0.15)]" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={listboxId}
      >
        <span className="min-w-0 flex-1 truncate">
          {value ? (
            <>
              <span className="mr-1.5 font-bold">{dayName},</span>
              <span>{datePart}</span>
            </>
          ) : (
            <span className="text-[#888]">Select date</span>
          )}
        </span>
        <span className="flex shrink-0 text-[#666]">
          <CalendarIcon />
        </span>
      </button>

      <DatePickerCalendar
        open={open}
        anchorRef={rootRef}
        panelRef={panelRef}
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
    </div>
  );
}
