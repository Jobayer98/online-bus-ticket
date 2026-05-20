"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api-client";
import { formatDateDdMmYyyy, formatMoneyBdt, formatTime12h } from "@/lib/format";
import { SeatMapGrid } from "./seat-map-grid";
import type { HoldDto, ScheduleCardDto, SeatMapDto } from "@repo/shared";

type Props = {
  schedule: ScheduleCardDto;
  tripDate: string;
  seatMap: SeatMapDto;
  onContinue: (payload: {
    hold: HoldDto;
    boardingPointId: string;
    boardingPointName: string;
  }) => void;
};

export function ScheduleSeatPanel({
  schedule,
  tripDate,
  seatMap,
  onContinue,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [boardingPointId, setBoardingPointId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cols = seatMap.cols || 4;

  function toggleSeat(label: string, status: string) {
    if (status !== "AVAILABLE") return;
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  function removeSeat(label: string) {
    setSelected((prev) => prev.filter((l) => l !== label));
  }

  const lineItems = seatMap.seats.filter((s) => selected.includes(s.label));
  const total = lineItems.reduce((a, s) => a + s.price, 0);
  const farePerSeat = lineItems[0]?.price ?? schedule.fareFrom;

  const journeyDisplay = `${formatDateDdMmYyyy(tripDate)} ${formatTime12h(schedule.departureAt)}`;

  async function handleContinue() {
    setError("");
    if (!selected.length) {
      setError("Select at least one seat");
      return;
    }
    if (!boardingPointId) {
      setError("Select boarding point");
      return;
    }
    setLoading(true);
    try {
      const sessionId =
        localStorage.getItem("sessionId") ??
        (() => {
          const id = crypto.randomUUID();
          localStorage.setItem("sessionId", id);
          return id;
        })();
      const r = await apiPost<HoldDto>("/bookings/hold", {
        scheduleId: schedule.scheduleId,
        seatLabels: selected,
        sessionId,
      });
      const bp = seatMap.boardingPoints.find((b) => b.id === boardingPointId);
      onContinue({
        hold: r.data,
        boardingPointId,
        boardingPointName: bp?.name ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not hold seats");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sp-seat-panel-v2">
      <div className="sp-seat-panel-v2__map">
        <SeatMapGrid
          seats={seatMap.seats}
          rows={seatMap.rows}
          cols={cols}
          selected={selected}
          onToggle={toggleSeat}
        />
      </div>

      <aside className="sp-seat-panel-v2__side">
        <div className="sp-seat-legend sp-seat-legend--side">
          <span className="sp-legend-item">
            <span className="sp-legend-swatch sp-legend-swatch--available" />
            Available Seat
          </span>
          <span className="sp-legend-item">
            <span className="sp-legend-swatch sp-legend-swatch--selected" />
            Selected Seat
          </span>
          <span className="sp-legend-item">
            <span className="sp-legend-swatch sp-legend-swatch--sold" />
            Sold Seat
          </span>
        </div>

        <div className="sp-boarding-field">
          <label htmlFor={`bp-${schedule.scheduleId}`}>Boarding Place</label>
          <select
            id={`bp-${schedule.scheduleId}`}
            value={boardingPointId}
            onChange={(e) => setBoardingPointId(e.target.value)}
          >
            <option value="">Select Boarding Point</option>
            {seatMap.boardingPoints.map((bp) => (
              <option key={bp.id} value={bp.id}>
                {bp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sp-seat-table-wrap">
          <table className="sp-seat-table">
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
                  <td colSpan={3} className="sp-seat-table-empty">
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
                        className="sp-seat-remove"
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
                <tr className="sp-seat-table-total">
                  <td>Total: {selected.length}</td>
                  <td colSpan={2}>{(total / 100).toFixed(0)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="sp-seat-trip-meta">
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

        {error && <p className="sp-panel-error">{error}</p>}

        <button
          type="button"
          className="sp-btn-continue-v2"
          disabled={loading}
          onClick={handleContinue}
        >
          {loading ? "Please wait…" : "Continue »"}
        </button>
      </aside>
    </div>
  );
}
