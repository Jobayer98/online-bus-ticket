"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearHoldBookingInProgress,
  markHoldBookingInProgress,
  markHoldPaymentNavigation,
  setActiveHoldId,
} from "@/lib/active-hold";
import {
  formatDateDdMmYyyy,
  formatTime12h,
} from "@/lib/format";
import { SeatHoldTimer } from "./seat-hold-timer";
import type { CreateBookingResponseDto, HoldDto, ScheduleCardDto, SeatMapDto } from "@repo/shared";
import { buildPaymentUrl } from "@/lib/booking-access";
import { getGuestSessionId } from "@/lib/guest-session";

export type SearchCheckoutState = {
  schedule: ScheduleCardDto;
  tripDate: string;
  routeCode: string;
  hold: HoldDto;
  boardingPointId: string;
  boardingPointName: string;
};

type Props = {
  checkout: SearchCheckoutState;
  onBack: () => void;
  onHoldExpired: () => void;
};

function formatAmount(minor: number): string {
  return (minor / 100).toFixed(2);
}

const checkoutTableClass =
  "mx-3 mb-3 w-[calc(100%-1.5rem)] border-collapse text-[0.78rem] [&_td]:border [&_td]:border-[#e0e0e0] [&_td]:px-2 [&_td]:py-[0.35rem] [&_td]:align-top [&_th]:w-[42%] [&_th]:border [&_th]:border-[#e0e0e0] [&_th]:bg-[#fafafa] [&_th]:px-2 [&_th]:py-[0.35rem] [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#444]";

export function SearchCheckoutForm({
  checkout,
  onBack,
  onHoldExpired,
}: Props) {
  const router = useRouter();
  const { schedule, tripDate, routeCode, hold, boardingPointId, boardingPointName } =
    checkout;

  const [passenger, setPassenger] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "Male",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [holdExpired, setHoldExpired] = useState(false);

  const processingFee = 0;
  const totalAmount = hold.totalAmount + processingFee;
  const departureDisplay = `${formatDateDdMmYyyy(tripDate)} ${formatTime12h(schedule.departureAt)}`;
  const boardingDisplay = `${boardingPointName.toUpperCase()} (${formatTime12h(schedule.departureAt)})`;

  const handleHoldExpired = useCallback(() => {
    setHoldExpired(true);
    setError("Your seat hold expired. Please select seats again.");
    onHoldExpired();
  }, [onHoldExpired]);

  async function handleProceed() {
    setError("");
    if (holdExpired) {
      setError("Your seat hold expired. Please go back and select seats again.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms and policies");
      return;
    }
    if (!passenger.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!/^\d{11}$/.test(passenger.phone.replace(/\s/g, ""))) {
      setError("Enter a valid 11-digit mobile number");
      return;
    }
    setLoading(true);
    markHoldBookingInProgress();
    let navigating = false;
    try {
      const seatMap = await apiGet<SeatMapDto>(
        `/schedules/${schedule.scheduleId}/seat-map`,
      );
      const validBoarding = seatMap.data.boardingPoints.find(
        (b) => b.id === boardingPointId,
      );
      if (!validBoarding) {
        setError(
          "Boarding point is no longer valid. Please go back and select boarding again.",
        );
        return;
      }

      const seatsStillHeld = hold.seatLabels.every((label) => {
        const seat = seatMap.data.seats.find((s) => s.label === label);
        return seat?.status === "HELD";
      });
      if (!seatsStillHeld) {
        setError(
          "Your seat hold is no longer valid. Please go back and select seats again.",
        );
        return;
      }

      const r = await apiPost<CreateBookingResponseDto>("/bookings", {
        holdId: hold.holdId,
        boardingPointId: validBoarding.id,
        passenger: {
          name: passenger.name.trim(),
          phone: passenger.phone.replace(/\s/g, ""),
          email: passenger.email.trim() || undefined,
        },
        sessionId: getGuestSessionId(),
      });
      if (r.data.holdId) {
        setActiveHoldId(r.data.holdId);
      }
      markHoldPaymentNavigation();
      navigating = true;
      router.push(
        buildPaymentUrl(
          schedule.scheduleId,
          r.data.id,
          r.data.bookingAccessToken,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create booking");
    } finally {
      clearHoldBookingInProgress();
      if (!navigating) {
        setLoading(false);
      }
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-8 max-[767px]:px-3">
      <SeatHoldTimer
        expiresAt={hold.expiresAt}
        onExpired={handleHoldExpired}
        variant="checkout"
      />

      <h2 className="m-0 mb-2 mt-3 border border-[var(--border)] bg-[#e8e8e8] px-3 py-[0.45rem] text-[0.95rem] font-bold tracking-[0.04em] text-[#222]">
        JOURNEY &amp; PASSENGER DETAILS
      </h2>

      <div className="grid grid-cols-1 border border-[var(--border)] bg-white max-[900px]:grid-cols-1 min-[901px]:grid-cols-3">
        <section className="flex min-w-0 flex-col border-b border-[var(--border)] min-[901px]:border-b-0 min-[901px]:border-r">
          <h3 className="m-0 bg-[var(--primary-hover)] px-[0.65rem] py-[0.4rem] text-[0.88rem] font-bold tracking-[0.03em] text-white">
            Journey Details
          </h3>
          <p className="mx-3 mb-2 mt-[0.65rem] min-h-[1.62rem] text-[1.35rem] font-extrabold leading-tight tracking-[0.02em] text-[#111]">
            SHAHZADPUR TRAVELS
          </p>
          <table className={checkoutTableClass}>
            <tbody>
              <tr>
                <th>Route</th>
                <td>{routeCode}</td>
              </tr>
              <tr>
                <th>Coach No</th>
                <td>
                  <strong>{schedule.coachNumber}</strong>
                </td>
              </tr>
              <tr>
                <th>Departure Place</th>
                <td>{schedule.startPoint.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Departure Time</th>
                <td>{departureDisplay}</td>
              </tr>
              <tr>
                <th>Seat No</th>
                <td>{hold.seatLabels.join(", ")}</td>
              </tr>
              <tr>
                <th>Boarding</th>
                <td>{boardingDisplay}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="flex min-w-0 flex-col border-b border-[var(--border)] min-[901px]:border-b-0 min-[901px]:border-r">
          <h3 className="m-0 bg-[var(--primary-hover)] px-[0.65rem] py-[0.4rem] text-[0.88rem] font-bold tracking-[0.03em] text-white">
            Fare Details
          </h3>
          <p
            className="mx-3 mb-2 mt-[0.65rem] hidden min-h-[1.62rem] text-[1.35rem] font-extrabold leading-tight tracking-[0.02em] min-[901px]:block min-[901px]:invisible"
            aria-hidden="true"
          >
            &nbsp;
          </p>
          <table className={checkoutTableClass}>
            <tbody>
              <tr>
                <th>Total Fare</th>
                <td>{formatAmount(hold.totalAmount)}</td>
              </tr>
              <tr>
                <th>Processing Fee</th>
                <td>{formatAmount(processingFee)}</td>
              </tr>
              <tr className="[&_td]:bg-[#f5f5f5] [&_th]:bg-[#f5f5f5]">
                <th>Total Amount</th>
                <td>
                  <strong>{formatAmount(totalAmount)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <label className="mx-3 mb-[0.85rem] flex cursor-pointer flex-row items-start gap-2 text-[0.72rem] font-normal leading-[1.45] text-[#333]">
            <input
              type="checkbox"
              className="mt-[0.15rem] h-3.5 min-w-3.5 shrink-0 cursor-pointer p-0"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="min-w-0 flex-1">
              I Agree With the{" "}
              <a href="/terms-and-conditions" className="text-[#1565c0]">
                Terms &amp; Conditions
              </a>
              ,{" "}
              <a href="/privacy-policy" className="text-[#1565c0]">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/return-policy" className="text-[#1565c0]">
                Return-Cancel Policy
              </a>
            </span>
          </label>
        </section>

        <section className="flex min-w-0 flex-col">
          <h3 className="m-0 bg-[var(--primary-hover)] px-[0.65rem] py-[0.4rem] text-[0.88rem] font-bold tracking-[0.03em] text-white">
            Passenger Details
          </h3>
          <p
            className="mx-3 mb-2 mt-[0.65rem] hidden min-h-[1.62rem] text-[1.35rem] font-extrabold leading-tight tracking-[0.02em] min-[901px]:block min-[901px]:invisible"
            aria-hidden="true"
          >
            &nbsp;
          </p>
          <div className="px-3 pt-2">
            <label htmlFor="checkout-name" className="mb-1 block text-xs font-semibold text-[#444]">
              Name <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id="checkout-name"
              type="text"
              placeholder="Enter Your Name"
              className="mb-2 h-[34px] w-full rounded-[2px] border border-[var(--border)] px-2 text-[0.82rem] font-inherit"
              value={passenger.name}
              onChange={(e) =>
                setPassenger({ ...passenger, name: e.target.value })
              }
            />
          </div>
          <div className="px-3">
            <label htmlFor="checkout-gender" className="mb-1 block text-xs font-semibold text-[#444]">
              Gender
            </label>
            <select
              id="checkout-gender"
              className="mb-2 h-[34px] w-full rounded-[2px] border border-[var(--border)] px-2 text-[0.82rem] font-inherit"
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
          <div className="px-3">
            <label htmlFor="checkout-phone" className="mb-1 block text-xs font-semibold text-[#444]">
              Mobile No <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id="checkout-phone"
              type="tel"
              placeholder="Enter Your 11 Digit Mobile No"
              maxLength={11}
              className="mb-2 h-[34px] w-full rounded-[2px] border border-[var(--border)] px-2 text-[0.82rem] font-inherit"
              value={passenger.phone}
              onChange={(e) =>
                setPassenger({
                  ...passenger,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>
          <div className="px-3">
            <label htmlFor="checkout-email" className="mb-1 block text-xs font-semibold text-[#444]">
              Email ID
            </label>
            <input
              id="checkout-email"
              type="email"
              placeholder="Enter Your Email ID"
              className="mb-2 h-[34px] w-full rounded-[2px] border border-[var(--border)] px-2 text-[0.82rem] font-inherit"
              value={passenger.email}
              onChange={(e) =>
                setPassenger({ ...passenger, email: e.target.value })
              }
            />
          </div>
        </section>
      </div>

      <h2 className="m-0 mb-2 mt-5 border border-[var(--border)] bg-[#e8e8e8] px-3 py-[0.45rem] text-[0.95rem] font-bold tracking-[0.04em] text-[#222]">
        SECURE ONLINE PAYMENT
      </h2>

      <div className="mx-auto max-w-[1200px] px-4 max-[767px]:px-3">
        <p className="m-0 rounded border-2 border-[#662d91] bg-[#faf8fc] px-4 py-[0.85rem] text-[0.88rem] text-[#455a64]">
          On the next step you can pay securely with bKash or SSLCommerz.
        </p>
      </div>

      {error && (
        <p className="mx-auto mt-3 max-w-[1200px] px-4 text-[0.75rem] text-[var(--danger)] max-[767px]:px-3">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          className="min-h-10 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 font-inherit hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>
        <button
          type="button"
          className={`cursor-pointer rounded-[3px] border-none bg-[var(--primary-hover)] px-6 py-2 text-[0.85rem] font-bold text-white font-inherit hover:bg-[#145214] disabled:cursor-not-allowed disabled:opacity-60${loading ? " cursor-wait" : ""}`}
          disabled={loading || holdExpired}
          aria-busy={loading}
          onClick={() => void handleProceed()}
        >
          {loading ? "Processing…" : "✓ Proceed to Pay"}
        </button>
      </div>
    </div>
  );
}
