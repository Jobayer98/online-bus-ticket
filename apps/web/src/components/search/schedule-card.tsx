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

function availabilityClass(count: number): string {
  if (count <= 3) return "sp-avail--low";
  if (count <= 10) return "sp-avail--medium";
  return "sp-avail--high";
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
    <article className={`sp-card${expanded ? " sp-card--expanded" : ""}`}>
      <div className="sp-card-main">
        <div className="sp-card-head">
          <div className="sp-card-head-left">
            <span className={`sp-badge ${isAc ? "sp-badge--ac" : "sp-badge--non-ac"}`}>
              {isAc ? "AC" : "Non AC"}
            </span>
            <span className="sp-card-coach">{schedule.coachNumber}</span>
          </div>
          <div className="sp-card-fare-block">
            <span className="sp-card-fare-label">from</span>
            <span className="sp-card-fare fare">{formatMoneyBdt(schedule.fareFrom)}</span>
          </div>
        </div>

        <div className="sp-card-route-row">
          <div className="sp-card-stop">
            <strong className="sp-card-stop-name">{schedule.startPoint}</strong>
            <span className="sp-card-stop-time time">
              {formatTime12h(schedule.departureAt)}
            </span>
          </div>

          <div className="sp-card-route-line" aria-hidden>
            <span className="sp-card-route-duration">{duration}</span>
            <div className="sp-card-route-track">
              <Bus className="sp-card-bus-icon" size={18} />
            </div>
          </div>

          <div className="sp-card-stop sp-card-stop--end">
            <strong className="sp-card-stop-name">{schedule.endPoint}</strong>
            <span className="sp-card-stop-time time">
              {formatTime12h(schedule.estimatedArrivalAt)}
            </span>
          </div>
        </div>

        <div className="sp-card-footer-row">
          <div className="sp-card-meta">
            <div className="sp-card-classes">
              {schedule.seatClasses.map((cls) => (
                <span key={cls} className="sp-class-pill">
                  {SEAT_CLASS_LABELS[cls] ?? cls}
                </span>
              ))}
            </div>
            <span className={`sp-card-avail ${availabilityClass(schedule.availableSeats)}`}>
              <span className="sp-avail-dot" aria-hidden />
              {schedule.availableSeats} seats left
            </span>
          </div>
          <button
            type="button"
            className={`sp-btn-select${expanded ? " is-cancel" : ""}`}
            onClick={handleToggle}
          >
            {expanded ? "Cancel" : "Select seat"}
            {!expanded && <ArrowRight size={16} aria-hidden />}
          </button>
        </div>
      </div>

      <div className="sp-card-route">
        <strong>Route:</strong> {routeLabel}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            className="sp-seat-expand-wrap is-open"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="sp-seat-expand-inner">
              {mapError && (
                <div className="sp-seat-panel-v2 sp-panel-error">{mapError}</div>
              )}
              {loadingMap && (
                <div className="sp-seat-loading">Loading seat map…</div>
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
