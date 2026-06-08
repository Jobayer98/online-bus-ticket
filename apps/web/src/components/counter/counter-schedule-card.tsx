"use client";

import { apiGet } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  formatMoneyBdt,
  formatScheduleClassLine,
  formatTime12h,
} from "@/lib/format";
import {
  spBtnSelect,
  spBtnSelectCancel,
  spCard,
  spCardAvail,
  spCardClass,
  spCardCol,
  spCardColPrice,
  spCardExpanded,
  spCardFare,
  spCardRow,
  spCardRoute,
  spPanelError,
  spSeatExpandInner,
  spSeatExpandInnerOpen,
  spSeatExpandWrap,
  spSeatExpandWrapOpen,
  spSeatLoading,
  spTime,
} from "@/components/search/search-tw";
import { CounterSeatPanel } from "./counter-seat-panel";
import type { ScheduleCardDto, SeatMapDto } from "@repo/shared";
import { useState } from "react";

type Props = {
  schedule: ScheduleCardDto;
  tripDate: string;
  routeLabel: string;
  expanded: boolean;
  selectedSeats: string[];
  boardingPointId: string;
  onToggle: () => void;
  onSelectedChange: (labels: string[]) => void;
  onBoardingChange: (id: string) => void;
  onSeatContinue: () => void;
};

export function CounterScheduleCard({
  schedule,
  tripDate,
  routeLabel,
  expanded,
  selectedSeats,
  boardingPointId,
  onToggle,
  onSelectedChange,
  onBoardingChange,
  onSeatContinue,
}: Props) {
  const [seatMap, setSeatMap] = useState<SeatMapDto | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState("");
  useGlobalLoading(loadingMap);

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

  const busClass = formatScheduleClassLine(
    schedule.busType,
    schedule.seatClasses,
  );

  return (
    <article className={`${spCard}${expanded ? ` ${spCardExpanded}` : ""}`}>
      <div className={spCardRow}>
        <div className={spCardCol}>
          <label>Coach#</label>
          <strong>{schedule.coachNumber}</strong>
          <label className="mt-[0.35rem]">Start Point</label>
          <strong>{schedule.startPoint.toUpperCase()}</strong>
          <div className={spTime}>{formatTime12h(schedule.departureAt)}</div>
        </div>
        <div className={spCardCol}>
          <label>End Point</label>
          <strong>{schedule.endPoint.toUpperCase()}</strong>
          <label className="mt-[0.35rem]">Est. End Time</label>
          <strong>{formatTime12h(schedule.estimatedArrivalAt)}</strong>
        </div>
        <div className={`${spCardCol} ${spCardColPrice}`}>
          <div className={spCardClass}>{busClass}</div>
          <div className={spCardFare}>{formatMoneyBdt(schedule.fareFrom)}</div>
          <div className={spCardAvail}>
            AVAILABLE: {schedule.availableSeats}
          </div>
        </div>
        <div className={spCardCol}>
          <button
            type="button"
            className={`${spBtnSelect}${expanded ? ` ${spBtnSelectCancel}` : ""}`}
            onClick={handleToggle}
          >
            {expanded ? "CANCEL" : "SELECT SEAT"}
          </button>
        </div>
      </div>

      <div className={spCardRoute}>
        <strong>ROUTE:</strong> {routeLabel}
      </div>

      <div
        className={`${spSeatExpandWrap}${expanded ? ` ${spSeatExpandWrapOpen}` : ""}`}
      >
        <div
          className={`${spSeatExpandInner}${expanded ? ` ${spSeatExpandInnerOpen}` : ""}`}
        >
          {mapError && (
            <div className={`${spSeatLoading} ${spPanelError}`}>{mapError}</div>
          )}
          {seatMap && !loadingMap && (
            <CounterSeatPanel
              schedule={schedule}
              tripDate={tripDate}
              seatMap={seatMap}
              selected={selectedSeats}
              boardingPointId={boardingPointId}
              onSelectedChange={onSelectedChange}
              onBoardingChange={onBoardingChange}
              onContinue={onSeatContinue}
            />
          )}
        </div>
      </div>
    </article>
  );
}
