"use client";

import { useEffect, useState } from "react";
import { FloatingPickerPanel } from "@/components/floating-picker-panel";
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

const shortcutBtnClass =
  "flex-1 cursor-pointer rounded border border-[#d5d5d5] bg-[#f8f8f8] px-2 py-1.5 font-[inherit] text-[0.8rem] font-semibold text-[#333] hover:border-[var(--primary)] hover:bg-[#eef5ee]";

const shortcutSelectedClass =
  "flex-1 cursor-pointer rounded border border-[var(--primary)] bg-[var(--primary)] px-2 py-1.5 font-[inherit] text-[0.8rem] font-semibold text-white";

const navBtnClass =
  "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded border border-[#d5d5d5] bg-white p-0 text-[#444] hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-35";

const dayBaseClass =
  "aspect-square min-h-[34px] cursor-pointer rounded border-0 bg-transparent p-0 font-[inherit] text-[0.82rem] text-[#333] hover:bg-[#e8f5e9] disabled:cursor-not-allowed";

function dayCellClass(opts: {
  inMonth: boolean;
  disabled: boolean;
  isToday: boolean;
  isSelected: boolean;
}): string {
  const parts = [dayBaseClass];
  if (!opts.inMonth) parts.push("text-[#bbb]");
  if (opts.disabled) parts.push("text-[#ccc] hover:bg-transparent");
  if (opts.isToday && !opts.isSelected) {
    parts.push("font-bold text-[var(--primary-hover)] shadow-[inset_0_0_0_1px_var(--primary)]");
  }
  if (opts.isSelected) {
    parts.push("bg-[var(--primary)] font-semibold text-white hover:bg-[var(--primary)]");
  }
  return parts.join(" ");
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
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className={value === todayIso ? shortcutSelectedClass : shortcutBtnClass}
          onClick={() => selectDate(todayIso)}
        >
          Today
        </button>
        <button
          type="button"
          className={value === tomorrowIso ? shortcutSelectedClass : shortcutBtnClass}
          onClick={() => selectDate(tomorrowIso)}
        >
          Tomorrow
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className={navBtnClass}
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <span className="text-[0.9rem] font-semibold text-[#222]">{monthLabel}</span>
        <button
          type="button"
          className={navBtnClass}
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="py-0.5 text-center text-[0.7rem] font-semibold text-[#888]"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5" role="grid">
        {cells.map((cell) => {
          const disabled = compareIsoDates(cell.iso, minDate) < 0;
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === value;
          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              className={dayCellClass({
                inMonth: cell.inMonth,
                disabled,
                isToday,
                isSelected,
              })}
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
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  panelRef?: React.RefObject<HTMLDivElement | null>;
};

export function DatePickerCalendar({
  listboxId,
  ariaLabel = "Choose date",
  open,
  anchorRef,
  panelRef,
  ...panel
}: DatePickerCalendarProps) {
  return (
    <FloatingPickerPanel
      open={open}
      anchorRef={anchorRef}
      panelRef={panelRef}
      listboxId={listboxId}
      ariaLabel={ariaLabel}
      width={300}
      estimatedHeight={360}
    >
      <DatePickerCalendarPanel {...panel} />
    </FloatingPickerPanel>
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
