"use client";

import { HomeDatePicker } from "@/components/home-date-picker";
const TIME_PERIODS = [
  { value: "", label: "ALL", short: "All Time" },
  { value: "MORNING", label: "Morning", short: "Morning" },
  { value: "NOON", label: "Noon", short: "Noon" },
  { value: "AFTERNOON", label: "Afternoon", short: "Afternoon" },
  { value: "NIGHT", label: "Night", short: "Night" },
] as const;

const SEAT_CLASSES = [
  { value: "", label: "ALL" },
  { value: "PREMIUM", label: "PREMIUM ECONO" },
  { value: "STANDARD", label: "STANDARD" },
  { value: "BUSINESS", label: "GREEN CLASS" },
] as const;

type Stop = { id: string; name: string; city: string; code: string };

type Props = {
  stops: Stop[];
  fromStopId: string;
  toStopId: string;
  stopsReady?: boolean;
  date: string;
  minDate: string;
  timePeriod: string;
  seatClass: string;
  acOn: boolean;
  nonAcOn: boolean;
  routeTitle: string;
  routeCode: string;
  tripDateLabel: string;
  clock: string;
  canPrevDay: boolean;
  filtersExpanded: boolean;
  filterError: string;
  timePeriodCounts: Record<string, number>;
  seatClassCounts: Record<string, number>;
  totalCount: number;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
  onDateChange: (iso: string) => void;
  onTimePeriodChange: (value: string) => void;
  onSeatClassChange: (value: string) => void;
  onAcToggle: () => void;
  onNonAcToggle: () => void;
  onSearch: () => void;
  onToggleFilters: () => void;
  onCloseFilters: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
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

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6.5h12M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

function FilterSlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="5" cy="4" r="1.5" fill="currentColor" />
      <circle cx="10" cy="8" r="1.5" fill="currentColor" />
      <circle cx="7" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PeriodIcon({ period }: { period: string }) {
  const sun = period === "MORNING" || period === "NOON";
  const moon = period === "NIGHT";
  if (moon) return <span className="sp-chip-icon" aria-hidden>🌙</span>;
  if (sun) return <span className="sp-chip-icon" aria-hidden>☀</span>;
  if (period === "AFTERNOON") return <span className="sp-chip-icon" aria-hidden>🌤</span>;
  return <span className="sp-chip-icon" aria-hidden>☀</span>;
}

export function SearchFilterBar({
  stops,
  fromStopId,
  toStopId,
  stopsReady = false,
  date,
  minDate,
  timePeriod,
  seatClass,
  acOn,
  nonAcOn,
  routeTitle,
  routeCode,
  tripDateLabel,
  clock,
  canPrevDay,
  filtersExpanded,
  filterError,
  timePeriodCounts,
  seatClassCounts,
  totalCount,
  onFromChange,
  onToChange,
  onDateChange,
  onTimePeriodChange,
  onSeatClassChange,
  onAcToggle,
  onNonAcToggle,
  onSearch,
  onToggleFilters,
  onCloseFilters,
  onPrevDay,
  onNextDay,
}: Props) {
  const timeLabel =
    TIME_PERIODS.find((t) => t.value === timePeriod)?.short ?? "All Time";

  const fromValue =
    stopsReady && stops.some((s) => s.id === fromStopId) ? fromStopId : "";
  const toValue =
    stopsReady && stops.some((s) => s.id === toStopId) ? toStopId : "";

  return (
    <section className="sp-filter-section">
      <div className="sp-filter-card">
        <div className="sp-filter-row">
          <select
            className="sp-filter-select"
            value={fromValue}
            onChange={(e) => onFromChange(e.target.value)}
            aria-label="From"
            disabled={!stopsReady}
          >
            <option value="">FROM</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            className="sp-filter-select"
            value={toValue}
            onChange={(e) => onToChange(e.target.value)}
            aria-label="To"
            disabled={!stopsReady}
          >
            <option value="">TO</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city.toUpperCase()}
              </option>
            ))}
          </select>

          <div className="sp-filter-input-wrap sp-filter-date-wrap">
            <span className="sp-filter-input-icon">
              <CalendarIcon />
            </span>
            <HomeDatePicker
              value={date}
              onChange={onDateChange}
              minDate={minDate}
              compact
            />
          </div>

          <button
            type="button"
            className="sp-filter-input-wrap sp-filter-time-btn"
            onClick={onToggleFilters}
            aria-expanded={filtersExpanded}
          >
            <span className="sp-filter-input-icon">
              <ClockIcon />
            </span>
            <span className="sp-filter-time-label">{timeLabel}</span>
          </button>

          <div className="sp-filter-ac-group">
            <button
              type="button"
              className={`sp-filter-ac${acOn ? " is-on" : ""}`}
              onClick={onAcToggle}
            >
              {acOn && <CheckIcon />} AC
            </button>
            <button
              type="button"
              className={`sp-filter-ac${nonAcOn ? " is-on" : ""}`}
              onClick={onNonAcToggle}
            >
              {nonAcOn && <CheckIcon />} Non AC
            </button>
          </div>

          <button type="button" className="sp-filter-search" onClick={onSearch}>
            <SearchIcon />
            SEARCH
          </button>

          {filtersExpanded ? (
            <button
              type="button"
              className="sp-filter-close"
              onClick={onCloseFilters}
              aria-label="Close filters"
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              className="sp-filter-more"
              onClick={onToggleFilters}
              aria-label="More filters"
              aria-expanded={filtersExpanded}
            >
              <FilterSlidersIcon />
            </button>
          )}
        </div>

        <div
          className={`sp-filter-expand-wrap${filtersExpanded ? " is-open" : ""}`}
          aria-hidden={!filtersExpanded}
        >
          <div className="sp-filter-expanded">
            <div className="sp-filter-chip-row">
              <span className="sp-filter-chip-label">Time Period:</span>
              <div className="sp-filter-chips">
                {TIME_PERIODS.map((tp) => {
                  const count =
                    tp.value === ""
                      ? totalCount
                      : (timePeriodCounts[tp.value] ?? 0);
                  return (
                    <button
                      key={tp.value || "all"}
                      type="button"
                      className={`sp-filter-chip${timePeriod === tp.value ? " is-active" : ""}`}
                      onClick={() => onTimePeriodChange(tp.value)}
                    >
                      <PeriodIcon period={tp.value} />
                      <span>{tp.label}</span>
                      <span className="sp-filter-chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sp-filter-chip-row">
              <span className="sp-filter-chip-label">Seat Type:</span>
              <div className="sp-filter-chips">
                {SEAT_CLASSES.map((sc) => {
                  const count =
                    sc.value === ""
                      ? totalCount
                      : (seatClassCounts[sc.value] ?? 0);
                  return (
                    <button
                      key={sc.value || "all"}
                      type="button"
                      className={`sp-filter-chip${seatClass === sc.value ? " is-active" : ""}`}
                      onClick={() => onSeatClassChange(sc.value)}
                    >
                      <span>{sc.label}</span>
                      <span className="sp-filter-chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sp-route-nav">
        <div className="sp-route-nav-left">
          <strong className="sp-route-nav-title">{routeTitle}</strong>
          <span className="sp-route-nav-code">{routeCode}</span>
        </div>
        <button
          type="button"
          className="sp-route-nav-btn"
          disabled={!canPrevDay}
          onClick={onPrevDay}
        >
          « Previous
        </button>
        <div className="sp-route-nav-datetime">
          {tripDateLabel} | {clock}
        </div>
        <button type="button" className="sp-route-nav-btn" onClick={onNextDay}>
          Next »
        </button>
      </div>

      {filterError && <p className="sp-filter-error">{filterError}</p>}
    </section>
  );
}
