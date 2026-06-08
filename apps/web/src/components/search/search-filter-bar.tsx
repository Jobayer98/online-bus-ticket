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

const filterSelectClass =
  "box-border h-[42px] min-w-[7.25rem] max-w-full flex-[1_1_7.25rem] appearance-none rounded-[3px] border border-[var(--border)] bg-white bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%3E%3Cpath%20fill%3D%27%23666%27%20d%3D%27M2%203l3%203%203-3%27%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_0.45rem_center] bg-no-repeat py-0 pr-7 pl-[0.55rem] text-[0.875rem] font-bold uppercase font-inherit lg:min-w-[9rem] lg:flex-[1_1_9rem] max-[560px]:min-w-[calc(50%-0.25rem)] max-[560px]:flex-[1_1_calc(50%-0.25rem)]";

const filterInputWrapClass =
  "box-border flex h-[42px] min-w-[8.75rem] max-w-full flex-[1_1_8.75rem] items-center rounded-[3px] border border-[var(--border)] bg-white max-[560px]:min-w-[calc(50%-0.25rem)] max-[560px]:flex-[1_1_calc(50%-0.25rem)]";

const filterChipClass =
  "inline-flex min-h-8 cursor-pointer items-center gap-[0.3rem] rounded-[var(--radius-pill)] border border-[var(--border)] bg-white px-3 py-[0.3rem] text-sm font-semibold text-[var(--text)] font-inherit transition-[border-color,background] duration-150 hover:border-[var(--primary)]";

const filterChipActiveClass =
  "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]";

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
  if (moon) return <span className="text-[0.85rem] leading-none" aria-hidden>🌙</span>;
  if (sun) return <span className="text-[0.85rem] leading-none" aria-hidden>☀</span>;
  if (period === "AFTERNOON") return <span className="text-[0.85rem] leading-none" aria-hidden>🌤</span>;
  return <span className="text-[0.85rem] leading-none" aria-hidden>☀</span>;
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
    <section className="relative z-20 mx-auto max-w-[1200px] px-4 pt-[0.65rem] max-[767px]:px-3">
      <div className="border border-[var(--border)] bg-white p-[0.55rem_0.75rem] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-stretch gap-2 lg:flex-nowrap">
          <select
            className={filterSelectClass}
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
            className={filterSelectClass}
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

          <div className="z-[3] min-w-48 flex-[1_1_12rem] lg:min-w-[12.5rem] lg:flex-[1_1_12.5rem] max-[560px]:min-w-[calc(50%-0.25rem)] max-[560px]:flex-[1_1_calc(50%-0.25rem)]">
            <HomeDatePicker
              value={date}
              onChange={onDateChange}
              minDate={minDate}
            />
          </div>

          <button
            type="button"
            className={`${filterInputWrapClass} min-w-0 cursor-pointer p-0 text-left font-inherit lg:min-w-[7.5rem] lg:flex-[0_1_7.5rem]`}
            onClick={onToggleFilters}
            aria-expanded={filtersExpanded}
          >
            <span className="flex shrink-0 items-center px-[0.35rem_0_0.5rem] text-[#666]">
              <ClockIcon />
            </span>
            <span className="min-w-0 flex-1 truncate text-[0.875rem] text-[#333]">
              {timeLabel}
            </span>
          </button>

          <div className="flex shrink-0 self-stretch max-[560px]:min-w-0 max-[560px]:flex-[1_1_auto]">
            <button
              type="button"
              className={`inline-flex h-[42px] items-center justify-center gap-1 whitespace-nowrap rounded-l-[3px] border-none bg-[var(--primary)] px-[0.65rem] text-[0.8125rem] font-bold text-white font-inherit cursor-pointer${acOn ? "" : " opacity-45"}`}
              onClick={onAcToggle}
            >
              {acOn && <CheckIcon />} AC
            </button>
            <button
              type="button"
              className={`inline-flex h-[42px] items-center justify-center gap-1 whitespace-nowrap rounded-r-[3px] border-none bg-[var(--primary-light)] px-[0.65rem] text-[0.8125rem] font-bold text-white font-inherit cursor-pointer${nonAcOn ? "" : " opacity-45"}`}
              onClick={onNonAcToggle}
            >
              {nonAcOn && <CheckIcon />} Non AC
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-[42px] shrink-0 items-center justify-center gap-[0.35rem] self-stretch whitespace-nowrap rounded-[3px] border-none bg-[var(--primary-hover)] px-[1.1rem] text-[0.875rem] font-bold tracking-[0.04em] text-white font-inherit cursor-pointer hover:bg-[#145214] max-[560px]:min-w-0 max-[560px]:flex-[1_1_auto]"
            onClick={onSearch}
          >
            <SearchIcon />
            SEARCH
          </button>

          {filtersExpanded ? (
            <button
              type="button"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center self-stretch rounded-[3px] border-none bg-[#374151] text-base font-bold text-white font-inherit cursor-pointer transition-[background-color,transform,opacity] duration-[250ms] active:scale-[0.94] motion-reduce:transition-none"
              onClick={onCloseFilters}
              aria-label="Close filters"
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center self-stretch rounded-[3px] border-none bg-[var(--primary)] text-white font-inherit cursor-pointer transition-[background-color,transform,opacity] duration-[250ms] active:scale-[0.94] motion-reduce:transition-none"
              onClick={onToggleFilters}
              aria-label="More filters"
              aria-expanded={filtersExpanded}
            >
              <FilterSlidersIcon />
            </button>
          )}
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none${filtersExpanded ? " grid-rows-[1fr]" : " grid-rows-[0fr]"}`}
          aria-hidden={!filtersExpanded}
        >
          <div
            className={`min-h-0 overflow-hidden border-t border-transparent opacity-0 transition-[opacity,margin-top,padding-top,border-color] duration-[350ms] motion-reduce:transition-none${filtersExpanded ? " mt-[0.65rem] border-[#eee] pt-[0.65rem] opacity-100" : " pointer-events-none mt-0 pt-0"}`}
          >
            <div className="mb-2 flex flex-wrap items-start gap-2 last:mb-0">
              <span className="min-w-[88px] shrink-0 pt-[0.35rem] text-[0.9rem] font-semibold text-[var(--primary)]">
                Time Period:
              </span>
              <div className="flex flex-1 flex-wrap gap-[0.35rem]">
                {TIME_PERIODS.map((tp) => {
                  const count =
                    tp.value === ""
                      ? totalCount
                      : (timePeriodCounts[tp.value] ?? 0);
                  return (
                    <button
                      key={tp.value || "all"}
                      type="button"
                      className={`${filterChipClass}${timePeriod === tp.value ? ` ${filterChipActiveClass}` : ""}`}
                      onClick={() => onTimePeriodChange(tp.value)}
                    >
                      <PeriodIcon period={tp.value} />
                      <span>{tp.label}</span>
                      <span className="font-bold opacity-90">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mb-2 flex flex-wrap items-start gap-2 last:mb-0">
              <span className="min-w-[88px] shrink-0 pt-[0.35rem] text-[0.9rem] font-semibold text-[var(--primary)]">
                Seat Type:
              </span>
              <div className="flex flex-1 flex-wrap gap-[0.35rem]">
                {SEAT_CLASSES.map((sc) => {
                  const count =
                    sc.value === ""
                      ? totalCount
                      : (seatClassCounts[sc.value] ?? 0);
                  return (
                    <button
                      key={sc.value || "all"}
                      type="button"
                      className={`${filterChipClass}${seatClass === sc.value ? ` ${filterChipActiveClass}` : ""}`}
                      onClick={() => onSeatClassChange(sc.value)}
                    >
                      <span>{sc.label}</span>
                      <span className="font-bold opacity-90">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 border border-t-0 border-[var(--border)] bg-white px-[0.65rem] py-[0.45rem] max-[900px]:[&>button:first-of-type]:order-2 max-[900px]:[&>button:last-of-type]:order-3 max-[900px]:[&>button:last-of-type]:ml-auto">
        <div className="min-w-0 flex-[1_1_180px] max-[900px]:order-1 max-[900px]:w-full">
          <strong className="mr-2 text-base font-bold text-[#222]">{routeTitle}</strong>
          <span className="text-[0.875rem] text-[#888]">{routeCode}</span>
        </div>
        <button
          type="button"
          className="cursor-pointer whitespace-nowrap rounded-[3px] border-none bg-[var(--primary-hover)] px-[0.85rem] py-[0.35rem] text-[0.875rem] font-semibold text-white font-inherit hover:bg-[#145214] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canPrevDay}
          onClick={onPrevDay}
        >
          « Previous
        </button>
        <div className="min-w-0 flex-[1_1_200px] whitespace-nowrap text-center text-[0.9rem] text-[#444] max-[900px]:order-4 max-[900px]:mt-1 max-[900px]:w-full max-[900px]:text-left">
          {tripDateLabel} | {clock}
        </div>
        <button
          type="button"
          className="cursor-pointer whitespace-nowrap rounded-[3px] border-none bg-[var(--primary-hover)] px-[0.85rem] py-[0.35rem] text-[0.875rem] font-semibold text-white font-inherit hover:bg-[#145214]"
          onClick={onNextDay}
        >
          Next »
        </button>
      </div>

      {filterError && (
        <p className="mt-[0.35rem] text-[0.85rem] text-[var(--danger)]">{filterError}</p>
      )}
    </section>
  );
}
