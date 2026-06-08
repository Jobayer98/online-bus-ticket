"use client";

import { useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { getGuestSessionId } from "@/lib/guest-session";
import { apiPost } from "@/lib/api-client";
import { formatDateDdMmYyyy, formatTime12h } from "@/lib/format";
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
  useGlobalLoading(loading);

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
      const sessionId = getGuestSessionId();
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
    <div className="grid border-x border-b border-[var(--border)] border-t-2 border-t-[var(--primary)] bg-[#f8f8f8] max-[900px]:grid-cols-1 grid-cols-[1fr_minmax(260px,300px)]">
      <div className="overflow-x-auto border-r border-[var(--border)] bg-white p-4 max-[900px]:border-b max-[900px]:border-r-0">
        <SeatMapGrid
          seats={seatMap.seats}
          rows={seatMap.rows}
          cols={cols}
          selected={selected}
          onToggle={toggleSeat}
        />
      </div>

      <aside className="flex flex-col gap-[0.65rem] bg-[#fafafa] p-[0.85rem]">
        <div className="mb-0 flex flex-wrap gap-x-3 gap-y-2 text-[0.68rem]">
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[2px] border border-[#bbb] bg-white" />
            Available Seat
          </span>
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[2px] border border-[var(--primary)] bg-[var(--primary)]" />
            Selected Seat
          </span>
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[2px] border border-gray-300 bg-gray-100" />
            Sold Seat
          </span>
        </div>

        <div>
          <label
            htmlFor={`bp-${schedule.scheduleId}`}
            className="mb-1 block text-xs font-semibold text-[#444]"
          >
            Boarding Place
          </label>
          <select
            id={`bp-${schedule.scheduleId}`}
            className="h-[34px] w-full border border-[var(--border)] px-2 text-[0.8rem]"
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

        <div className="border border-[var(--border)] bg-white">
          <table className="w-full border-collapse text-[0.78rem]">
            <thead>
              <tr>
                <th className="border-b border-[#ddd] bg-[#f0f0f0] px-2 py-[0.35rem] text-left font-semibold">
                  Seat
                </th>
                <th className="border-b border-[#ddd] bg-[#f0f0f0] px-2 py-[0.35rem] text-left font-semibold">
                  Fare/Seat
                </th>
                <th className="border-b border-[#ddd] bg-[#f0f0f0] px-2 py-[0.35rem] text-left font-semibold" aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-[0.35rem] text-center text-[#999]">
                    No seats selected
                  </td>
                </tr>
              ) : (
                lineItems.map((s) => (
                  <tr key={s.label}>
                    <td className="border-b border-[#eee] px-2 py-[0.35rem]">{s.label}</td>
                    <td className="border-b border-[#eee] px-2 py-[0.35rem]">
                      {(s.price / 100).toFixed(0)}
                    </td>
                    <td className="border-b border-[#eee] px-2 py-[0.35rem]">
                      <button
                        type="button"
                        className="h-[22px] w-[22px] cursor-pointer rounded-[3px] border-none bg-gray-100 p-0 text-base leading-none text-white font-inherit"
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
                <tr className="bg-[var(--primary-hover)] font-bold text-white">
                  <td className="px-2 py-[0.35rem]">Total: {selected.length}</td>
                  <td colSpan={2} className="border-b-0 px-2 py-[0.35rem]">
                    {(total / 100).toFixed(0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="text-[0.75rem] leading-[1.55] text-[#444]">
          <div>
            <span className="font-semibold">Journey Time:</span> {journeyDisplay}
          </div>
          <div>
            <span className="font-semibold">Coach No:</span> {schedule.coachNumber}
          </div>
          <div>
            <span className="font-semibold">Fare/Seat:</span>{" "}
            {(farePerSeat / 100).toFixed(0)}
          </div>
        </div>

        {error && (
          <p className="mb-2 text-[0.75rem] text-[var(--danger)]">{error}</p>
        )}

        <button
          type="button"
          className={`mt-auto w-full cursor-pointer rounded-[3px] border-none bg-[var(--primary-hover)] py-[0.6rem] text-[0.9rem] font-bold text-white font-inherit hover:bg-[#145214] disabled:cursor-not-allowed disabled:opacity-65${loading ? " cursor-wait opacity-65" : ""}`}
          disabled={loading}
          aria-busy={loading}
          onClick={() => void handleContinue()}
        >
          {loading ? "Reserving…" : "Continue »"}
        </button>
      </aside>
    </div>
  );
}
