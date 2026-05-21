"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { getTodayIso } from "@/lib/trip-date";
import { CounterSearchBar } from "./counter-search-bar";
import { CounterScheduleCard } from "./counter-schedule-card";
import {
  formatDateDdMmYyyy,
  formatMoneyBdt,
  formatTime12h,
} from "@/lib/format";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { CounterToast } from "./counter-toast";
import type { CounterSellInput, ScheduleCardDto, SeatMapDto } from "@repo/shared";

const PHONE_11 = /^\d{11}$/;

function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

type Stop = { id: string; name: string; city: string; code: string };

type SellResult = {
  bookingId: string;
  ticket: { passengerNumber: string; id: string };
};

type CheckoutDraft = {
  schedule: ScheduleCardDto;
  seatLabels: string[];
  boardingPointId: string;
  boardingPointName: string;
  totalAmount: number;
};

type Props = {
  onSold?: () => void;
};

export function CounterSellFlow({ onSold }: Props) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [fromStopId, setFromStopId] = useState("");
  const [toStopId, setToStopId] = useState("");
  const [date, setDate] = useState("");
  const [acOn, setAcOn] = useState(true);
  const [nonAcOn, setNonAcOn] = useState(true);

  const [schedules, setSchedules] = useState<ScheduleCardDto[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPointId, setBoardingPointId] = useState("");
  const [checkout, setCheckout] = useState<CheckoutDraft | null>(null);

  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [method, setMethod] = useState<CounterSellInput["method"]>("CASH");

  const [sellError, setSellError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selling, setSelling] = useState(false);
  useGlobalLoading(loadingSearch || selling);
  const [sellResult, setSellResult] = useState<SellResult | null>(null);

  function showToast(message: string) {
    setToast(message);
  }

  function clearSellDraft() {
    setCheckout(null);
    setPassengerName("");
    setPassengerPhone("");
    setSelectedSeats([]);
    setBoardingPointId("");
    setExpandedId(null);
    setSellError("");
  }

  useEffect(() => {
    setDate(getTodayIso());
    apiGet<Stop[]>("/schedules/stops")
      .then((r) => setStops(r.data))
      .catch(() => setStops([]));
  }, []);

  const routeLabel = useMemo(() => {
    const from = stops.find((s) => s.id === fromStopId);
    const to = stops.find((s) => s.id === toStopId);
    if (from && to) return `${from.city} — ${to.city}`;
    return "";
  }, [stops, fromStopId, toStopId]);

  const runSearch = useCallback(() => {
    setSearchError("");
    setSellResult(null);
    setCheckout(null);
    setExpandedId(null);
    setSelectedSeats([]);
    setBoardingPointId("");

    if (!fromStopId || !toStopId || !date) {
      setSearchError("Select from, to, and date");
      return;
    }
    if (fromStopId === toStopId) {
      setSearchError("From and to must differ");
      return;
    }
    if (!acOn && !nonAcOn) {
      setSearchError("Select at least AC or Non AC");
      return;
    }

    setLoadingSearch(true);
    const q = new URLSearchParams({ fromStopId, toStopId, date });
    if (acOn && !nonAcOn) q.set("busType", "AC");
    if (!acOn && nonAcOn) q.set("busType", "NON_AC");

    apiGet<ScheduleCardDto[]>(`/schedules/search?${q}`)
      .then((r) => setSchedules(r.data))
      .catch((e) => {
        setSchedules([]);
        setSearchError(e instanceof Error ? e.message : "Search failed");
      })
      .finally(() => setLoadingSearch(false));
  }, [fromStopId, toStopId, date, acOn, nonAcOn]);

  async function handleSeatContinue() {
    setSellError("");
    if (!expandedId) return;
    const schedule = schedules.find((s) => s.scheduleId === expandedId);
    if (!schedule) return;
    if (!selectedSeats.length) {
      showToast("Please select at least one seat");
      return;
    }
    if (!boardingPointId) {
      showToast("Please select a boarding point");
      return;
    }

    try {
      const r = await apiGet<SeatMapDto>(`/schedules/${schedule.scheduleId}/seat-map`);
      const bp = r.data.boardingPoints.find((b) => b.id === boardingPointId);
      const lineItems = r.data.seats.filter((s) => selectedSeats.includes(s.label));
      const total = lineItems.reduce((a, s) => a + s.price, 0);

      setCheckout({
        schedule,
        seatLabels: selectedSeats,
        boardingPointId,
        boardingPointName: bp?.name ?? "",
        totalAmount: total,
      });
      setExpandedId(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSellError(e instanceof Error ? e.message : "Could not verify seats");
    }
  }

  async function handleSell() {
    if (!checkout) return;
    setSellError("");
    if (!passengerName.trim()) {
      setSellError("Passenger name is required");
      return;
    }
    const phone = digitsOnlyPhone(passengerPhone);
    if (!PHONE_11.test(phone)) {
      setSellError("Enter an 11-digit mobile number (e.g. 01700000000)");
      return;
    }

    setSelling(true);
    try {
      const r = await apiPost<SellResult>("/counter/sell", {
        scheduleId: checkout.schedule.scheduleId,
        seatLabels: checkout.seatLabels,
        boardingPointId: checkout.boardingPointId,
        passenger: {
          name: passengerName.trim(),
          phone,
        },
        method,
      } satisfies CounterSellInput);
      setSellResult(r.data);
      clearSellDraft();
      onSold?.();
    } catch (e) {
      setSellError(e instanceof Error ? e.message : "Sale failed");
    } finally {
      setSelling(false);
    }
  }

  function resetSale() {
    setSellResult(null);
    clearSellDraft();
    runSearch();
  }

  function handleSuccessBack() {
    setSellResult(null);
    clearSellDraft();
  }

  if (sellResult) {
    return (
      <>
        <CounterToast message={toast} onDismiss={() => setToast(null)} />
        <div className="cp-success">
          <div className="cp-success-card">
            <h2>TICKET SOLD — SHAHZADPUR TRAVELS</h2>
            <p className="cp-success-number">{sellResult.ticket.passengerNumber}</p>
            <p className="cp-success-hint">
              Give this passenger number and phone to the customer for ticket download.
            </p>
            <div className="cp-success-actions">
              <button type="button" className="sp-filter-search" onClick={resetSale}>
                New sale
              </button>
              <button type="button" className="sp-btn-back" onClick={handleSuccessBack}>
                Back to search
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (checkout) {
    const { schedule, seatLabels, boardingPointName, totalAmount } = checkout;
    const departureDisplay = `${formatDateDdMmYyyy(date)} ${formatTime12h(schedule.departureAt)}`;

    return (
      <>
        <CounterToast message={toast} onDismiss={() => setToast(null)} />
        <div className="sp-checkout">
        <h2 className="sp-checkout-title">COUNTER SALE — PASSENGER DETAILS</h2>

        <div className="sp-checkout-grid">
          <section className="sp-checkout-col sp-checkout-col--journey">
            <h3>Journey Details</h3>
            <p className="sp-checkout-operator">SHAHZADPUR TRAVELS</p>
            <table className="sp-checkout-table">
              <tbody>
                <tr>
                  <th>Route</th>
                  <td>{routeLabel.toUpperCase()}</td>
                </tr>
                <tr>
                  <th>Coach No</th>
                  <td>
                    <strong>{schedule.coachNumber}</strong>
                  </td>
                </tr>
                <tr>
                  <th>Departure</th>
                  <td>{departureDisplay}</td>
                </tr>
                <tr>
                  <th>Seat No</th>
                  <td>{seatLabels.join(", ")}</td>
                </tr>
                <tr>
                  <th>Boarding</th>
                  <td>{boardingPointName.toUpperCase()}</td>
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
                  <td>{formatMoneyBdt(totalAmount)}</td>
                </tr>
                <tr>
                  <th>Payment</th>
                  <td>{method === "CASH" ? "Cash" : "Online"}</td>
                </tr>
                <tr className="sp-checkout-total-row">
                  <th>Amount Due</th>
                  <td>
                    <strong>{formatMoneyBdt(totalAmount)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="sp-checkout-col sp-checkout-col--passenger">
            <h3>Passenger Details</h3>
            <p className="sp-checkout-operator-spacer" aria-hidden="true">
              &nbsp;
            </p>
            <div className="sp-checkout-field">
              <label htmlFor="cp-name">
                Name <span className="sp-req">*</span>
              </label>
              <input
                id="cp-name"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="sp-checkout-field">
              <label htmlFor="cp-phone">
                Mobile (11 digits) <span className="sp-req">*</span>
              </label>
              <input
                id="cp-phone"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(digitsOnlyPhone(e.target.value))}
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                pattern="\d{11}"
                title="11-digit mobile number"
              />
            </div>
            <div className="sp-checkout-field">
              <label htmlFor="cp-method">Payment method</label>
              <select
                id="cp-method"
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as CounterSellInput["method"])
                }
              >
                <option value="CASH">Cash</option>
                <option value="ONLINE">Online / card</option>
              </select>
            </div>
          </section>
        </div>

        {sellError && (
          <p className="sp-checkout-error sp-panel-error">{sellError}</p>
        )}

        <div className="sp-checkout-actions">
          <button
            type="button"
            className="sp-btn-back"
            onClick={() => {
              setExpandedId(checkout.schedule.scheduleId);
              setSelectedSeats(checkout.seatLabels);
              setBoardingPointId(checkout.boardingPointId);
              setCheckout(null);
              setSellError("");
            }}
          >
            « Back to seats
          </button>
          <button
            type="button"
            className="sp-filter-search"
            disabled={selling}
            onClick={handleSell}
          >
            {selling ? "Processing…" : "Confirm sale"}
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <CounterSearchBar
        stops={stops}
        fromStopId={fromStopId}
        toStopId={toStopId}
        date={date}
        minDate={getTodayIso()}
        acOn={acOn}
        nonAcOn={nonAcOn}
        filterError={searchError}
        loading={loadingSearch}
        onFromChange={setFromStopId}
        onToChange={setToStopId}
        onDateChange={setDate}
        onAcToggle={() => setAcOn((v) => !v)}
        onNonAcToggle={() => setNonAcOn((v) => !v)}
        onSearch={runSearch}
      />

      {sellError && !checkout && (
        <p className="sp-checkout-error sp-panel-error">{sellError}</p>
      )}

      <div className="sp-results-list">
        {!loadingSearch && schedules.length === 0 && !searchError && (
          <div className="sp-empty">No buses found for this date.</div>
        )}
        {!loadingSearch &&
          schedules.map((s) => (
            <CounterScheduleCard
              key={s.scheduleId}
              schedule={s}
              tripDate={date}
              routeLabel={routeLabel}
              expanded={expandedId === s.scheduleId}
              selectedSeats={expandedId === s.scheduleId ? selectedSeats : []}
              boardingPointId={expandedId === s.scheduleId ? boardingPointId : ""}
              onToggle={() => {
                setSellError("");
                setExpandedId((id) => (id === s.scheduleId ? null : s.scheduleId));
                if (expandedId !== s.scheduleId) {
                  setSelectedSeats([]);
                  setBoardingPointId("");
                }
              }}
              onSelectedChange={setSelectedSeats}
              onBoardingChange={setBoardingPointId}
              onSeatContinue={handleSeatContinue}
            />
          ))}
      </div>
    </>
  );
}
