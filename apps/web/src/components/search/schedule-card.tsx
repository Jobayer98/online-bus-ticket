"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Bus } from "lucide-react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet } from "@/lib/api-client";
import { formatMoneyBdt, formatTime12h } from "@/lib/format";
import type { HoldDto, ScheduleCardDto, SeatMapDto } from "@repo/shared";
import { ScheduleSeatPanel } from "./schedule-seat-panel";

type Props = {
  schedule: ScheduleCardDto;
  tripDate: string;
  routeLabel: string;
  expanded: boolean;
  onToggle: () => void;
  onSeatContinue: (payload: {
    schedule: ScheduleCardDto;
    hold: HoldDto;
    boardingPointId: string;
    boardingPointName: string;
  }) => void;
};

function formatTripDuration(departureAt: string, arrivalAt: string): string {
  const ms = new Date(arrivalAt).getTime() - new Date(departureAt).getTime();
  if (ms <= 0) return "—";
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${mins}m`;
}

function availabilityDotClass(count: number): string {
  if (count <= 3) return "bg-[var(--danger)]";
  if (count <= 10) return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
}

const SEAT_CLASS_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  PREMIUM: "Premium",
  BUSINESS: "Business",
};

export function ScheduleCard({
  schedule,
  tripDate,
  routeLabel,
  expanded,
  onToggle,
  onSeatContinue,
}: Props) {
  const [seatMap, setSeatMap] = useState<SeatMapDto | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  useGlobalLoading(loadingMap);
  const [mapError, setMapError] = useState("");

  async function handleToggle() {
    if (expanded) {
      onToggle();
      return;
    }
    onToggle();
    if (seatMap) return;
    setLoadingMap(true);
    setMapError("");
    try {
      const r = await apiGet<SeatMapDto>(
        `/schedules/${schedule.scheduleId}/seat-map`,
      );
      setSeatMap(r.data);
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Failed to load seats");
    } finally {
      setLoadingMap(false);
    }
  }

  const duration = formatTripDuration(
    schedule.departureAt,
    schedule.estimatedArrivalAt,
  );
  const isAc = schedule.busType === "AC";

  return (
    <article
      className={`group rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[var(--shadow-xs)] transition-[box-shadow,border-color] duration-150 hover:border-[var(--border)] hover:shadow-[var(--shadow-md)]${expanded ? " border-[#b8d4ba]" : ""}`}
    >
      <div className="p-4 px-[1.1rem]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-[0.65rem]">
            <span
              className={`inline-flex rounded-[var(--radius-pill)] px-[0.55rem] py-[0.2rem] text-xs font-bold${isAc ? " bg-[var(--green-100)] text-[var(--green-800)]" : " bg-amber-100 text-amber-900"}`}
            >
              {isAc ? "AC" : "Non AC"}
            </span>
            <span className="text-base font-semibold text-[var(--text)]">
              {schedule.coachNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-xs text-[var(--muted)]">from</span>
            <span className="text-xl font-bold tracking-[-0.02em] text-[var(--primary)]">
              {formatMoneyBdt(schedule.fareFrom)}
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-[1fr_minmax(100px,1.4fr)_1fr] items-center gap-3">
          <div className="flex flex-col gap-[0.2rem]">
            <strong className="text-base font-semibold text-[var(--text)]">
              {schedule.startPoint}
            </strong>
            <span className="text-lg font-bold text-[var(--text)]">
              {formatTime12h(schedule.departureAt)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-[0.35rem]" aria-hidden>
            <span className="text-xs text-[var(--muted)]">{duration}</span>
            <div className="relative flex h-px w-full items-center justify-center bg-[var(--border)]">
              <Bus
                className="bg-white px-1 text-[var(--primary)] transition-transform duration-200 group-hover:translate-x-2"
                size={18}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[0.2rem] text-right">
            <strong className="text-base font-semibold text-[var(--text)]">
              {schedule.endPoint}
            </strong>
            <span className="text-lg font-bold text-[var(--text)]">
              {formatTime12h(schedule.estimatedArrivalAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-[0.45rem]">
            <div className="flex flex-wrap gap-[0.35rem]">
              {schedule.seatClasses.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex rounded-[var(--radius-pill)] bg-[var(--green-100)] px-2 py-[0.15rem] text-xs font-semibold text-[var(--green-800)]"
                >
                  {SEAT_CLASS_LABELS[cls] ?? cls}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-[0.35rem] text-sm text-[var(--muted)]">
              <span
                className={`h-2 w-2 rounded-full ${availabilityDotClass(schedule.availableSeats)}`}
                aria-hidden
              />
              {schedule.availableSeats} seats left
            </span>
          </div>
          <button
            type="button"
            className={`inline-flex min-h-10 min-w-[120px] cursor-pointer items-center justify-center gap-[0.35rem] rounded-[var(--radius-sm)] border-none px-4 py-[0.45rem] text-sm font-semibold font-inherit transition-colors duration-150${expanded ? " border border-[var(--border)] bg-gray-100 text-gray-700 hover:bg-gray-200" : " bg-[var(--primary)] text-on-primary hover:bg-[var(--primary-hover)]"}`}
            onClick={handleToggle}
          >
            {expanded ? "Cancel" : "Select seat"}
            {!expanded && <ArrowRight size={16} aria-hidden />}
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--green-100)] bg-[var(--green-50)] px-[1.1rem] py-2 text-sm text-[var(--green-900)]">
        <strong className="mr-[0.35rem] font-semibold">Route:</strong> {routeLabel}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            className="grid grid-rows-[1fr] motion-reduce:transition-none"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="min-h-0 overflow-hidden opacity-100">
              {mapError && (
                <div className="border-x border-b border-[var(--border)] border-t-2 border-t-[var(--primary)] bg-[#f8f8f8] p-4 text-[0.75rem] text-[var(--danger)]">
                  {mapError}
                </div>
              )}
              {loadingMap && (
                <div className="border-t-2 border-[var(--primary)] bg-[#f5f5f5] p-8 text-center text-[#666]">
                  Loading seat map…
                </div>
              )}
              {seatMap && !loadingMap && (
                <ScheduleSeatPanel
                  schedule={schedule}
                  tripDate={tripDate}
                  seatMap={seatMap}
                  onContinue={({ hold, boardingPointId, boardingPointName }) =>
                    onSeatContinue({
                      schedule,
                      hold,
                      boardingPointId,
                      boardingPointName,
                    })
                  }
                />
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </article>
  );
}
