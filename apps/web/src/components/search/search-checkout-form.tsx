"use client";

import { useCallback, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { SslCommerzPaymentStrip } from "@/components/payment/sslcommerz-payment-strip";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearHoldBookingInProgress,
  markHoldBookingInProgress,
  markHoldPaymentNavigation,
  markPaymentPageEnterLoading,
  setActiveHoldId,
} from "@/lib/active-hold";
import {
  formatDateDdMmYyyy,
  formatTime12h,
} from "@/lib/format";
import { SeatHoldTimer } from "./seat-hold-timer";
import type { CreateBookingResponseDto, HoldDto, ScheduleCardDto, SeatMapDto } from "@repo/shared";
import { buildPaymentUrl } from "@/lib/booking-access";

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
  useGlobalLoading(loading);
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
      });
      if (r.data.holdId) {
        setActiveHoldId(r.data.holdId);
      }
      markHoldPaymentNavigation();
      markPaymentPageEnterLoading();
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
    <div className="sp-checkout">
      <SeatHoldTimer
        expiresAt={hold.expiresAt}
        onExpired={handleHoldExpired}
        variant="checkout"
      />

      <h2 className="sp-checkout-title">JOURNEY &amp; PASSENGER DETAILS</h2>

      <div className="sp-checkout-grid">
        <section className="sp-checkout-col sp-checkout-col--journey">
          <h3>Journey Details</h3>
          <p className="sp-checkout-operator">SHAHZADPUR TRAVELS</p>
          <table className="sp-checkout-table">
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

        <section className="sp-checkout-col sp-checkout-col--fare">
          <h3>Fare Details</h3>
          <p className="sp-checkout-operator-spacer" aria-hidden="true">
            &nbsp;
          </p>
          <table className="sp-checkout-table">
            <tbody>
              <tr>
                <th>Total Fare</th>
                <td>{formatAmount(hold.totalAmount)}</td>
              </tr>
              <tr>
                <th>Processing Fee</th>
                <td>{formatAmount(processingFee)}</td>
              </tr>
              <tr className="sp-checkout-total-row">
                <th>Total Amount</th>
                <td>
                  <strong>{formatAmount(totalAmount)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <label className="sp-checkout-terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I Agree With the{" "}
              <a href="/terms-and-conditions">Terms &amp; Conditions</a>,{" "}
              <a href="/privacy-policy">Privacy Policy</a> and{" "}
              <a href="/return-policy">Return-Cancel Policy</a>
            </span>
          </label>
        </section>

        <section className="sp-checkout-col sp-checkout-col--passenger">
          <h3>Passenger Details</h3>
          <p className="sp-checkout-operator-spacer" aria-hidden="true">
            &nbsp;
          </p>
          <div className="sp-checkout-field">
            <label htmlFor="checkout-name">
              Name <span className="sp-req">*</span>
            </label>
            <input
              id="checkout-name"
              type="text"
              placeholder="Enter Your Name"
              value={passenger.name}
              onChange={(e) =>
                setPassenger({ ...passenger, name: e.target.value })
              }
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="checkout-gender">Gender</label>
            <select
              id="checkout-gender"
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
          <div className="sp-checkout-field">
            <label htmlFor="checkout-phone">
              Mobile No <span className="sp-req">*</span>
            </label>
            <input
              id="checkout-phone"
              type="tel"
              placeholder="Enter Your 11 Digit Mobile No"
              maxLength={11}
              value={passenger.phone}
              onChange={(e) =>
                setPassenger({
                  ...passenger,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="checkout-email">Email ID</label>
            <input
              id="checkout-email"
              type="email"
              placeholder="Enter Your Email ID"
              value={passenger.email}
              onChange={(e) =>
                setPassenger({ ...passenger, email: e.target.value })
              }
            />
          </div>
        </section>
      </div>

      <h2 className="sp-checkout-title sp-checkout-title--payment">
        SECURE ONLINE PAYMENT
      </h2>

      <div className="sp-checkout-payment-box">
        <SslCommerzPaymentStrip />
      </div>

      {error && <p className="sp-panel-error sp-checkout-error">{error}</p>}

      <div className="sp-checkout-actions">
        <button
          type="button"
          className="sp-btn-back"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>
        <button
          type="button"
          className={`sp-btn-proceed${loading ? " btn-is-busy" : ""}`}
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
