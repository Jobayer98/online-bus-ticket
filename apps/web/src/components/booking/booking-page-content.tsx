"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { btnBusyClass } from "@/components/brand-loading-overlay";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  releaseActiveHold,
  setActiveHoldId,
} from "@/lib/active-hold";
import { formatMoneyBdt } from "@/lib/format";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { SeatHoldTimer } from "@/components/search/seat-hold-timer";
import { SeatMapGrid } from "@/components/search/seat-map-grid";
import type { CreateBookingResponseDto, SeatMapDto, HoldDto } from "@repo/shared";
import { buildPaymentUrl } from "@/lib/booking-access";
import { getGuestSessionId } from "@/lib/guest-session";

const bookingPageClass =
  "min-h-[calc(100vh-57px)] bg-[var(--bg,#f9fafb)] px-4 py-6 pb-8";
const bookingPageCheckoutClass = "bg-white";
const bookingInnerClass = "mx-auto max-w-[var(--container-public,1100px)]";
const bookingBackClass =
  "mb-4 inline-block text-[0.833rem] font-semibold text-[var(--primary)] no-underline";
const bookingErrorClass = "mb-4 text-[0.833rem] text-[var(--danger)]";
const bookingSummaryClass = "text-[0.833rem] text-[#444]";
const bookingHoldSummaryClass =
  "mb-4 rounded-[var(--radius-sm,6px)] border border-[var(--green-100,#dcfce7)] bg-[var(--green-50,#f0fdf4)] px-4 py-3 text-[0.833rem] [&_p]:my-1";
const bookingFormClass =
  "[&_input]:box-border [&_input]:min-h-12 [&_input]:w-full [&_input]:rounded-[var(--radius-sm,6px)] [&_input]:border [&_input]:border-[var(--border)] [&_input]:px-3 [&_input]:text-base [&_input]:font-[inherit] [&_input]:focus-visible:border-[var(--primary)] [&_input]:focus-visible:shadow-[0_0_0_3px_var(--primary-light)] [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-[var(--primary)] [&_label]:mt-3 [&_label]:block [&_label]:text-[0.833rem] [&_label]:font-medium [&_select]:box-border [&_select]:min-h-12 [&_select]:w-full [&_select]:rounded-[var(--radius-sm,6px)] [&_select]:border [&_select]:border-[var(--border)] [&_select]:px-3 [&_select]:text-base [&_select]:font-[inherit] [&_select]:focus-visible:border-[var(--primary)] [&_select]:focus-visible:shadow-[0_0_0_3px_var(--primary-light)] [&_select]:focus-visible:outline-2 [&_select]:focus-visible:outline-[var(--primary)]";
const bookingBtnClass =
  "mt-5 min-h-12 w-full cursor-pointer rounded-[var(--radius-sm,6px)] border-0 bg-[var(--primary)] px-3 py-2.5 font-[inherit] text-base font-semibold text-on-primary hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60";

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
      const sessionId = getGuestSessionId();
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
      const r = await apiPost<CreateBookingResponseDto>("/bookings", {
        holdId: hold.holdId,
        boardingPointId,
        passenger,
        sessionId: getGuestSessionId(),
      });
      if (r.data.holdId) {
        setActiveHoldId(r.data.holdId);
      }
      sessionStorage.removeItem(`booking-prefill-${scheduleId}`);
      router.push(
        buildPaymentUrl(scheduleId, r.data.id, r.data.bookingAccessToken),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
      setSubmitting(false);
    }
  }

  if (!seatMap) {
    return <div className={bookingPageClass} aria-busy="true" />;
  }

  return (
    <div className={`${bookingPageClass}${fromSearch ? ` ${bookingPageCheckoutClass}` : ""}`}>
      <div className={bookingInnerClass}>
        {fromSearch && (
          <Link
            href={
              typeof window !== "undefined"
                ? sessionStorage.getItem("last-search-url") ?? "/"
                : "/"
            }
            className={bookingBackClass}
            onClick={() => void releaseActiveHold()}
          >
            ← Back to search
          </Link>
        )}
        <h1 className="m-0 mb-4 text-[var(--text-xl,1.111rem)] font-bold tracking-tight">
          {step === "passenger" ? "Passenger details" : "Select seats"}
        </h1>
        {error && <p className={bookingErrorClass}>{error}</p>}

        {step === "seats" && (
          <>
            <SeatMapGrid
              seats={seatMap.seats}
              rows={seatMap.rows}
              cols={seatMap.cols || 4}
              selected={selected}
              onToggle={toggleSeat}
            />
            <p className={bookingSummaryClass}>
              Selected: {selected.join(", ") || "none"} · Total:{" "}
              {formatMoneyBdt(
                seatMap.seats
                  .filter((s) => selected.includes(s.label))
                  .reduce((a, s) => a + s.price, 0),
              )}
            </p>
            <button
              type="button"
              className={`${bookingBtnClass}${submitting ? ` ${btnBusyClass}` : ""}`}
              disabled={submitting}
              aria-busy={submitting}
              onClick={() => void createHold()}
            >
              {submitting ? "Reserving…" : "Continue"}
            </button>
          </>
        )}

        {step === "passenger" && hold && (
          <div className={bookingFormClass}>
            <SeatHoldTimer
              expiresAt={hold.expiresAt}
              onExpired={() => {
                void releaseActiveHold();
                setHold(null);
                setStep("seats");
                setError("Your seat hold expired. Please select seats again.");
              }}
            />
            <div className={bookingHoldSummaryClass}>
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
              className={`${bookingBtnClass}${submitting ? ` ${btnBusyClass}` : ""}`}
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
