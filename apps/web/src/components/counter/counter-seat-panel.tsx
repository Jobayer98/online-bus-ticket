"use client";

import { SeatMapGrid } from "@/components/search/seat-map-grid";
import {
  spBoardingField,
  spBtnContinue,
  spLegendItem,
  spLegendSwatchAvailable,
  spLegendSwatchSelected,
  spLegendSwatchSold,
  spSeatLegend,
  spSeatPanelMap,
  spSeatPanelSide,
  spSeatPanelV2,
  spSeatRemove,
  spSeatTable,
  spSeatTableEmpty,
  spSeatTableTotal,
  spSeatTableWrap,
  spSeatTripMeta,
} from "@/components/search/search-tw";
import { formatDateDdMmYyyy, formatTime12h } from "@/lib/format";
import type { ScheduleCardDto, SeatMapDto } from "@repo/shared";

type Props = {
  schedule: ScheduleCardDto;
  tripDate: string;
  seatMap: SeatMapDto;
  selected: string[];
  boardingPointId: string;
  onSelectedChange: (labels: string[]) => void;
  onBoardingChange: (id: string) => void;
  onContinue: () => void;
  continueLabel?: string;
  disabled?: boolean;
};

export function CounterSeatPanel({
  schedule,
  tripDate,
  seatMap,
  selected,
  boardingPointId,
  onSelectedChange,
  onBoardingChange,
  onContinue,
  continueLabel = "Continue »",
  disabled = false,
}: Props) {
  const cols = seatMap.cols || 4;

  function toggleSeat(label: string, status: string) {
    if (status !== "AVAILABLE") return;
    onSelectedChange(
      selected.includes(label)
        ? selected.filter((l) => l !== label)
        : [...selected, label],
    );
  }

  function removeSeat(label: string) {
    onSelectedChange(selected.filter((l) => l !== label));
  }

  const lineItems = seatMap.seats.filter((s) => selected.includes(s.label));
  const total = lineItems.reduce((a, s) => a + s.price, 0);
  const farePerSeat = lineItems[0]?.price ?? schedule.fareFrom;
  const journeyDisplay = `${formatDateDdMmYyyy(tripDate)} ${formatTime12h(schedule.departureAt)}`;

  return (
    <div className={spSeatPanelV2}>
      <div className={spSeatPanelMap}>
        <SeatMapGrid
          seats={seatMap.seats}
          rows={seatMap.rows}
          cols={cols}
          selected={selected}
          onToggle={toggleSeat}
        />
      </div>

      <aside className={spSeatPanelSide}>
        <div className={spSeatLegend}>
          <span className={spLegendItem}>
            <span className={spLegendSwatchAvailable} />
            Available Seat
          </span>
          <span className={spLegendItem}>
            <span className={spLegendSwatchSelected} />
            Selected Seat
          </span>
          <span className={spLegendItem}>
            <span className={spLegendSwatchSold} />
            Sold Seat
          </span>
        </div>

        <div className={spBoardingField}>
          <label htmlFor={`cp-bp-${schedule.scheduleId}`}>Boarding Place</label>
          <select
            id={`cp-bp-${schedule.scheduleId}`}
            value={boardingPointId}
            onChange={(e) => onBoardingChange(e.target.value)}
          >
            <option value="">Select Boarding Point</option>
            {seatMap.boardingPoints.map((bp) => (
              <option key={bp.id} value={bp.id}>
                {bp.name}
              </option>
            ))}
          </select>
        </div>

        <div className={spSeatTableWrap}>
          <table className={spSeatTable}>
            <thead>
              <tr>
                <th>Seat</th>
                <th>Fare/Seat</th>
                <th aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className={spSeatTableEmpty}>
                    No seats selected
                  </td>
                </tr>
              ) : (
                lineItems.map((s) => (
                  <tr key={s.label}>
                    <td>{s.label}</td>
                    <td>{(s.price / 100).toFixed(0)}</td>
                    <td>
                      <button
                        type="button"
                        className={spSeatRemove}
                        onClick={() => removeSeat(s.label)}
                        aria-label={`Remove seat ${s.label}`}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {lineItems.length > 0 && (
              <tfoot>
                <tr className={spSeatTableTotal}>
                  <td>Total: {selected.length}</td>
                  <td colSpan={2}>{(total / 100).toFixed(0)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className={spSeatTripMeta}>
          <div>
            <span>Journey Time:</span> {journeyDisplay}
          </div>
          <div>
            <span>Coach No:</span> {schedule.coachNumber}
          </div>
          <div>
            <span>Fare/Seat:</span> {(farePerSeat / 100).toFixed(0)}
          </div>
        </div>

        <button
          type="button"
          className={spBtnContinue}
          disabled={disabled}
          onClick={onContinue}
        >
          {continueLabel}
        </button>
      </aside>
    </div>
  );
}
