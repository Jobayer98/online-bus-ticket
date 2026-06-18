"use client";

import { useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { getGuestSessionId } from "@/lib/guest-session";
import { apiPost } from "@/lib/api-client";
import {
  clearHoldBookingInProgress,
  markHoldBookingInProgress,
  markHoldPaymentNavigation,
  setActiveHoldId,
} from "@/lib/active-hold";
import { SeatMapGrid } from "./seat-map-grid";
import type {
  CreateBookingResponseDto,
  HoldDto,
  ScheduleCardDto,
  SeatMapDto,
} from "@repo/shared";

type Props = {
  schedule: ScheduleCardDto;
  tripDate: string;
  seatMap: SeatMapDto;
  onComplete: (scheduleId: string, bookingId: string, token: string) => void;
};

const inputClass =
  "h-[36px] w-full rounded-[var(--radius-sm)] border border-[var(--border)] px-2 text-[0.82rem] font-inherit outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--green-100)]";

export function ScheduleSeatPanel({
  schedule,
  seatMap,
  onComplete,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [boardingPointId, setBoardingPointId] = useState("");
  const [passenger, setPassenger] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "Male",
  });
  const [discountCode, setDiscountCode] = useState("");
  const [discountMsg, setDiscountMsg] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useGlobalLoading(loading);

  const cols = seatMap.cols || 4;
  const deckLabel =
    (seatMap.seats[0]?.seatClass as string | undefined) ??
    schedule.seatClasses[0] ??
    "STANDARD";

  const availableCount = seatMap.seats.filter(
    (s) => s.status === "AVAILABLE",
  ).length;
  const soldCount = seatMap.seats.filter(
    (s) => s.status === "SOLD" || s.status === "HELD",
  ).length;
  const totalCount = seatMap.seats.length;

  const selectedSeats = seatMap.seats.filter((s) =>
    selected.includes(s.label),
  );
  const totalFare = selectedSeats.reduce((a, s) => a + s.price, 0);

  const hasSeats = selected.length > 0;
  const hasBoarding = boardingPointId !== "";
  const hasName = passenger.name.trim() !== "";
  const hasValidPhone = /^\d{11}$/.test(passenger.phone.replace(/\s/g, ""));
  const canProceed =
    availableCount > 0 &&
    hasSeats &&
    hasBoarding &&
    hasName &&
    hasValidPhone &&
    agreed;

  const buttonLabel =
    availableCount === 0
      ? "No Seats Available"
      : !hasSeats
        ? "Select Seats First"
        : !hasBoarding
          ? "Select a Boarding Point"
          : !hasName
            ? "Enter Your Name"
            : !hasValidPhone
              ? "Enter a Valid Phone Number"
              : !agreed
                ? "Agree to Terms & Conditions"
                : "Proceed to Pay »";

  function toggleSeat(label: string, status: string) {
    if (status !== "AVAILABLE") return;
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  function handleApplyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountMsg("Discount codes coming soon.");
    setTimeout(() => setDiscountMsg(""), 3000);
  }

  async function handleProceed() {
    setError("");
    if (!selected.length) {
      setError("Please select at least one seat.");
      return;
    }
    if (!boardingPointId) {
      setError("Please select a boarding point.");
      return;
    }
    if (!passenger.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!/^\d{11}$/.test(passenger.phone.replace(/\s/g, ""))) {
      setError("Enter a valid 11-digit mobile number.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms and policies.");
      return;
    }

    setLoading(true);
    markHoldBookingInProgress();
    let navigating = false;
    try {
      const holdRes = await apiPost<HoldDto>("/bookings/hold", {
        scheduleId: schedule.scheduleId,
        seatLabels: selected,
        sessionId: getGuestSessionId(),
      });
      const hold = holdRes.data;
      setActiveHoldId(hold.holdId);

      const bp = seatMap.boardingPoints.find((b) => b.id === boardingPointId);
      const bookingRes = await apiPost<CreateBookingResponseDto>("/bookings", {
        holdId: hold.holdId,
        boardingPointId: bp!.id,
        passenger: {
          name: passenger.name.trim(),
          phone: passenger.phone.replace(/\s/g, ""),
          email: passenger.email.trim() || undefined,
          gender: passenger.gender || undefined,
        },
        sessionId: getGuestSessionId(),
      });
      if (bookingRes.data.holdId) {
        setActiveHoldId(bookingRes.data.holdId);
      }
      markHoldPaymentNavigation();
      navigating = true;
      onComplete(
        schedule.scheduleId,
        bookingRes.data.id,
        bookingRes.data.bookingAccessToken,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not complete booking. Please try again.",
      );
    } finally {
      clearHoldBookingInProgress();
      if (!navigating) setLoading(false);
    }
  }

  return (
    <div className="grid border-x border-b border-[var(--border)] border-t-2 border-t-[var(--primary)] bg-[var(--green-50)] max-[900px]:grid-cols-1 min-[901px]:grid-cols-[1fr_minmax(300px,360px)]">
      {/* ── Left: Seat Map ── */}
      <div className="flex flex-col items-center gap-3 border-r border-[var(--border)] bg-[var(--green-50)] p-5 max-[900px]:border-b max-[900px]:border-r-0">
        <div className="flex flex-col items-center gap-[0.3rem]">
          <span className="rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-4 py-[0.25rem] text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white">
            {deckLabel}
          </span>
          <span className="rounded bg-[#374151] px-3 py-[0.18rem] text-[0.62rem] font-semibold uppercase tracking-[0.07em] text-white">
            FRONT
          </span>
        </div>

        {availableCount === 0 && (
          <p className="m-0 rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[0.75rem] font-medium text-amber-900">
            All seats are booked. You can still view the seat map below.
          </p>
        )}

        <SeatMapGrid
          seats={seatMap.seats}
          rows={seatMap.rows}
          cols={cols}
          selected={selected}
          onToggle={toggleSeat}
        />

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.72rem] text-[#555]">
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[3px] border border-[var(--green-600)] bg-white" />
            Available
          </span>
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[3px] border border-gray-300 bg-gray-100" />
            Sold
          </span>
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[3px] border border-[#c2185b] bg-[#f06595]" />
            Female
          </span>
          <span className="flex items-center gap-[0.35rem]">
            <span className="h-4 w-4 rounded-[3px] border border-[var(--green-800)] bg-[var(--primary)]" />
            Selected
          </span>
        </div>

        <div className="flex gap-5 text-[0.75rem] font-semibold">
          <span className="text-[var(--success)]">{availableCount} Available</span>
          <span className="text-[var(--danger)]">{soldCount} Sold</span>
          <span className="text-[var(--muted)]">{totalCount} Total</span>
        </div>
      </div>

      {/* ── Right: Booking Summary + Form ── */}
      <div className="flex flex-col bg-white p-5">
        <h3 className="m-0 mb-1 text-[1rem] font-bold text-[var(--text)]">
          Booking Summary
        </h3>
        <hr className="mb-3 border-[var(--border)]" />

        {selectedSeats.length === 0 ? (
          <p className="mb-3 rounded bg-[var(--green-50)] py-3 text-center text-[0.8rem] text-[var(--muted)]">
            No seats selected
          </p>
        ) : (
          <div className="mb-3 rounded-[var(--radius-sm)] border border-[var(--green-100)] bg-[var(--green-50)] px-3 py-2">
            <div className="mb-1 flex flex-wrap gap-1">
              {selectedSeats.map((s) => (
                <span
                  key={s.label}
                  className="rounded bg-[var(--primary)] px-2 py-[0.15rem] text-[0.7rem] font-bold text-white"
                >
                  {s.label}
                </span>
              ))}
            </div>
            <p className="m-0 text-[0.78rem] font-semibold text-[var(--text)]">
              Total: ৳{(totalFare / 100).toFixed(0)}
            </p>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-[0.6rem]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-[0.25rem] block text-xs font-semibold text-[#444]">
                Full Name <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className={inputClass}
                value={passenger.name}
                onChange={(e) =>
                  setPassenger({ ...passenger, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-[0.25rem] block text-xs font-semibold text-[#444]">
                Phone <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="tel"
                placeholder="+880XXXXXXXXXX"
                maxLength={11}
                className={inputClass}
                value={passenger.phone}
                onChange={(e) =>
                  setPassenger({
                    ...passenger,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-[0.25rem] block text-xs font-semibold text-[#444]">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className={inputClass}
                value={passenger.email}
                onChange={(e) =>
                  setPassenger({ ...passenger, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-[0.25rem] block text-xs font-semibold text-[#444]">
                Gender <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                className={inputClass}
                value={passenger.gender}
                onChange={(e) =>
                  setPassenger({ ...passenger, gender: e.target.value })
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-[0.25rem] block text-xs font-semibold text-[#444]">
              Boarding Point <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              className={inputClass}
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

          <div>
            <label className="mb-[0.25rem] block text-xs font-semibold text-[#444]">
              Discount Code (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                className={`${inputClass} flex-1`}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button
                type="button"
                className="h-[36px] cursor-pointer rounded-[var(--radius-sm)] border-none bg-[var(--primary-hover)] px-4 text-[0.82rem] font-semibold text-white font-inherit hover:bg-[#145214] active:scale-95"
                onClick={handleApplyDiscount}
              >
                Apply
              </button>
            </div>
            {discountMsg && (
              <p className="mt-1 text-[0.7rem] text-[var(--muted)]">
                {discountMsg}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--green-100)] bg-[var(--green-50)] px-3 py-2 text-[0.72rem] leading-[1.5] text-[#333]">
            <input
              type="checkbox"
              className="mt-[0.15rem] h-3.5 min-w-3.5 shrink-0 cursor-pointer"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              আমি{" "}
              <a
                href="/terms-and-conditions"
                className="text-[var(--primary)] underline"
              >
                নিয়ম ও শর্তাবলী
              </a>{" "}
              এর সাথে সম্মত আছি এবং টিকিট বুকিং সংক্রান্ত সকল নীতিমালা মেনে
              চলতে রাজি আছি।
            </span>
          </label>
        </div>

        {error && (
          <p className="mt-2 text-[0.75rem] text-[var(--danger)]">{error}</p>
        )}

        <button
          type="button"
          className={`mt-3 w-full rounded-[var(--radius-sm)] border-none py-[0.65rem] text-[0.9rem] font-bold font-inherit transition-colors${
            canProceed
              ? " cursor-pointer bg-[var(--primary-hover)] text-white hover:bg-[#145214]"
              : " cursor-not-allowed bg-gray-300 text-gray-500"
          }${loading ? " cursor-wait opacity-70" : ""}`}
          disabled={!canProceed || loading}
          aria-busy={loading}
          onClick={() => void handleProceed()}
        >
          {loading ? "Processing…" : buttonLabel}
        </button>
      </div>
    </div>
  );
}
