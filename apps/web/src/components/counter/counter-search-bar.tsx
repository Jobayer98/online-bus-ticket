"use client";

import { HomeDatePicker } from "@/components/home-date-picker";
import {
  spFilterAc,
  spFilterAcGroup,
  spFilterAcOn,
  spFilterCard,
  spFilterDateField,
  spFilterError,
  spFilterRow,
  spFilterSearch,
  spFilterSection,
  spFilterSelect,
} from "@/components/search/search-tw";

type Stop = { id: string; name: string; city: string; code: string };

type Props = {
  stops: Stop[];
  fromStopId: string;
  toStopId: string;
  date: string;
  minDate: string;
  acOn: boolean;
  nonAcOn: boolean;
  filterError: string;
  loading: boolean;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
  onDateChange: (iso: string) => void;
  onAcToggle: () => void;
  onNonAcToggle: () => void;
  onSearch: () => void;
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CounterSearchBar({
  stops,
  fromStopId,
  toStopId,
  date,
  minDate,
  acOn,
  nonAcOn,
  filterError,
  loading,
  onFromChange,
  onToChange,
  onDateChange,
  onAcToggle,
  onNonAcToggle,
  onSearch,
}: Props) {
  return (
    <section className={spFilterSection}>
      <div className={spFilterCard}>
        <div className={spFilterRow}>
          <select
            className={spFilterSelect}
            value={fromStopId}
            onChange={(e) => onFromChange(e.target.value)}
            aria-label="From"
          >
            <option value="">FROM</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            className={spFilterSelect}
            value={toStopId}
            onChange={(e) => onToChange(e.target.value)}
            aria-label="To"
          >
            <option value="">TO</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city.toUpperCase()}
              </option>
            ))}
          </select>

          <div className={spFilterDateField}>
            <HomeDatePicker value={date} onChange={onDateChange} minDate={minDate} />
          </div>

          <div className={spFilterAcGroup}>
            <button
              type="button"
              className={`${spFilterAc}${acOn ? ` ${spFilterAcOn}` : ""}`}
              onClick={onAcToggle}
            >
              {acOn && <CheckIcon />} AC
            </button>
            <button
              type="button"
              className={`${spFilterAc}${nonAcOn ? ` ${spFilterAcOn}` : ""}`}
              onClick={onNonAcToggle}
            >
              {nonAcOn && <CheckIcon />} Non AC
            </button>
          </div>

          <button
            type="button"
            className={spFilterSearch}
            onClick={onSearch}
            disabled={loading}
          >
            <SearchIcon />
            SEARCH
          </button>
        </div>
        {filterError && <p className={spFilterError}>{filterError}</p>}
      </div>
    </section>
  );
}
