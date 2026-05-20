"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api-client";
import {
  formatBusTypeLabel,
  formatMoneyBdt,
  formatTime12h,
} from "@/lib/format";
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

  const busClass = `${formatBusTypeLabel(schedule.busType)} | ECONOMY`;

  return (
    <article className={`sp-card${expanded ? " sp-card--expanded" : ""}`}>
      <div className="sp-card-row">
        <div className="sp-card-col">
          <label>Coach#</label>
          <strong>{schedule.coachNumber}</strong>
          <label style={{ marginTop: "0.35rem" }}>Start Point</label>
          <strong>{schedule.startPoint.toUpperCase()}</strong>
          <div className="sp-time">{formatTime12h(schedule.departureAt)}</div>
        </div>
        <div className="sp-card-col">
          <label>End Point</label>
          <strong>{schedule.endPoint.toUpperCase()}</strong>
          <label style={{ marginTop: "0.35rem" }}>Est. End Time</label>
          <strong>{formatTime12h(schedule.estimatedArrivalAt)}</strong>
        </div>
        <div className="sp-card-col sp-card-price">
          <div className="sp-card-class">{busClass}</div>
          <div className="sp-card-fare">{formatMoneyBdt(schedule.fareFrom)}</div>
          <div className="sp-card-avail">
            AVAILABLE: {schedule.availableSeats}
          </div>
        </div>
        <div className="sp-card-col">
          <button
            type="button"
            className={`sp-btn-select${expanded ? " is-cancel" : ""}`}
            onClick={handleToggle}
          >
            {expanded ? "CANCEL" : "SELECT SEAT"}
          </button>
        </div>
      </div>

      <div className="sp-card-route">
        <strong>ROUTE:</strong> {routeLabel}
      </div>

      <div
        className={`sp-seat-expand-wrap${expanded ? " is-open" : ""}`}
        aria-hidden={!expanded}
      >
        <div className="sp-seat-expand-inner">
          {loadingMap && (
            <div className="sp-seat-loading">Loading seat map…</div>
          )}
          {mapError && (
            <div className="sp-seat-panel-v2 sp-panel-error">{mapError}</div>
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
      </div>
    </article>
  );
}
