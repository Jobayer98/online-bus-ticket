"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  releaseActiveHold,
  setActiveHoldId,
} from "@/lib/active-hold";
import { formatMoneyBdt } from "@/lib/format";
import { groupSeatsByRow, seatRow } from "@/lib/seat-layout";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { SeatHoldTimer } from "@/components/search/seat-hold-timer";
import type { BookingDto, SeatMapDto, HoldDto } from "@repo/shared";

export function BookingPageContent() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSearch = searchParams.get("prefill") === "1";

  const [seatMap, setSeatMap] = useState<SeatMapDto | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [boardingPointId, setBoardingPointId] = useState("");
  const [hold, setHold] = useState<HoldDto | null>(null);
  const [passenger, setPassenger] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState<"seats" | "passenger">("seats");
  const [submitting, setSubmitting] = useState(false);
  useGlobalLoading(!seatMap || submitting);

  useEffect(() => {
    if (fromSearch) {
      const raw = sessionStorage.getItem(`booking-prefill-${scheduleId}`);
      if (raw) {
        try {
          const { hold: h, boardingPointId: bp } = JSON.parse(raw) as {
            hold: HoldDto;
            boardingPointId: string;
          };
          setHold(h);
          setActiveHoldId(h.holdId);
          setSelected(h.seatLabels);
          setBoardingPointId(bp);
          setStep("passenger");
        } catch {
          /* ignore */
        }
      }
    }
    apiGet<SeatMapDto>(`/schedules/${scheduleId}/seat-map`)
      .then((r) => setSeatMap(r.data))
      .catch((e) => setError(e.message));
  }, [scheduleId, fromSearch]);

  function toggleSeat(label: string, status: string) {
    if (status !== "AVAILABLE") return;
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  async function createHold() {
    setError("");
    if (!selected.length) {
      setError("Select at least one seat");
      return;
    }
    setSubmitting(true);
    try {
      const sessionId =
        localStorage.getItem("sessionId") ??
        (() => {
          const id = crypto.randomUUID();
          localStorage.setItem("sessionId", id);
          return id;
        })();
      const r = await apiPost<HoldDto>("/bookings/hold", {
        scheduleId,
        seatLabels: selected,
        sessionId,
      });
      setHold(r.data);
      setActiveHoldId(r.data.holdId);
      setStep("passenger");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hold failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitBooking() {
    if (!hold || !boardingPointId) {
      setError("Boarding point required");
      return;
    }
    if (!passenger.name.trim() || !passenger.phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    setSubmitting(true);
    try {
      const r = await apiPost<BookingDto>("/bookings", {
        holdId: hold.holdId,
        boardingPointId,
        passenger,
      });
      if (r.data.holdId) {
        setActiveHoldId(r.data.holdId);
      }
      sessionStorage.removeItem(`booking-prefill-${scheduleId}`);
      router.push(`/booking/${scheduleId}/payment?bookingId=${r.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
      setSubmitting(false);
    }
  }

  if (!seatMap) {
    return <div className="booking-page" aria-busy="true" />;
  }

  const cols = seatMap.cols || 4;
  const mid = Math.ceil(cols / 2);
  const rows = groupSeatsByRow(seatMap.seats);

  return (
    <div className={`booking-page${fromSearch ? " booking-page--checkout" : ""}`}>
      <div className="booking-inner">
        {fromSearch && (
          <Link
            href={
              typeof window !== "undefined"
                ? sessionStorage.getItem("last-search-url") ?? "/"
                : "/"
            }
            className="booking-back"
            onClick={() => void releaseActiveHold()}
          >
            ← Back to search
          </Link>
        )}
        <h1>{step === "passenger" ? "Passenger details" : "Select seats"}</h1>
        {error && <p className="booking-error">{error}</p>}

        {step === "seats" && (
          <>
            <div className="booking-seat-map">
              {rows.map((rowSeats) => (
                <div
                  key={rowSeats.map((s) => s.label).join("-")}
                  className="booking-seat-row"
                >
                  {rowSeats.map((s, idx) => (
                    <span key={s.label} style={{ display: "contents" }}>
                      {idx === mid && <span className="booking-aisle" />}
                      <button
                        type="button"
                        className={`booking-seat ${selected.includes(s.label) ? "selected" : s.status.toLowerCase()}`}
                        disabled={s.status !== "AVAILABLE"}
                        onClick={() => toggleSeat(s.label, s.status)}
                      >
                        {s.label}
                      </button>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <p className="booking-summary-line">
              Selected: {selected.join(", ") || "none"} · Total:{" "}
              {formatMoneyBdt(
                seatMap.seats
                  .filter((s) => selected.includes(s.label))
                  .reduce((a, s) => a + s.price, 0),
              )}
            </p>
            <button
              type="button"
              className={`booking-btn${submitting ? " btn-is-busy" : ""}`}
              disabled={submitting}
              aria-busy={submitting}
              onClick={() => void createHold()}
            >
              {submitting ? "Reserving…" : "Continue"}
            </button>
          </>
        )}

        {step === "passenger" && hold && (
          <div className="booking-form">
            <SeatHoldTimer
              expiresAt={hold.expiresAt}
              onExpired={() => {
                void releaseActiveHold();
                setHold(null);
                setStep("seats");
                setError("Your seat hold expired. Please select seats again.");
              }}
            />
            <div className="booking-hold-summary">
              <p>
                <strong>Seats:</strong> {hold.seatLabels.join(", ")}
              </p>
              <p>
                <strong>Total:</strong> {formatMoneyBdt(hold.totalAmount)}
              </p>
            </div>
            <label>Boarding point</label>
            <select
              value={boardingPointId}
              onChange={(e) => setBoardingPointId(e.target.value)}
            >
              <option value="">Select</option>
              {seatMap.boardingPoints.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name}
                </option>
              ))}
            </select>
            <label>Name</label>
            <input
              value={passenger.name}
              onChange={(e) =>
                setPassenger({ ...passenger, name: e.target.value })
              }
              required
            />
            <label>Phone</label>
            <input
              value={passenger.phone}
              onChange={(e) =>
                setPassenger({ ...passenger, phone: e.target.value })
              }
              required
            />
            <label>Email (optional)</label>
            <input
              type="email"
              value={passenger.email}
              onChange={(e) =>
                setPassenger({ ...passenger, email: e.target.value })
              }
            />
            <button
              type="button"
              className={`booking-btn${submitting ? " btn-is-busy" : ""}`}
              disabled={submitting}
              aria-busy={submitting}
              onClick={() => void submitBooking()}
            >
              {submitting ? "Processing…" : "Go to payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
