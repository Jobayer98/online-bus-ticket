"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, Lock, ShieldCheck } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearHoldPaymentNavigation,
  releaseActiveHold,
  setActiveHoldId,
} from "@/lib/active-hold";
import {
  bookingAccessQuery,
  resolveBookingAccessToken,
} from "@/lib/booking-access";
import { formatMoneyBdt, formatTime12h } from "@/lib/format";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";
import { SeatHoldTimer } from "@/components/search/seat-hold-timer";
import type { BookingDto, PaymentGatewayOptionDto } from "@repo/shared";

function formatTripDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function shortRef(id: string): string {
  return id.slice(0, 9).toUpperCase();
}

function StepBar() {
  const steps = ["Route Selection", "Seat Selection", "Payment"];
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, i) => {
        const done = i < 2;
        const active = i === 2;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-[0.3rem]">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-[var(--primary)] text-white"
                    : active
                      ? "border-2 border-[var(--primary)] bg-white text-[var(--primary)]"
                      : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`whitespace-nowrap text-[0.68rem] font-semibold ${
                  done || active ? "text-[var(--primary)]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-4 h-[2px] w-12 rounded sm:w-16 ${
                  i < 1 ? "bg-[var(--primary)]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PaymentPageContent() {
  const { profile } = useSiteTheme();
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const accessTokenParam = searchParams.get("accessToken");
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [gateways, setGateways] = useState<PaymentGatewayOptionDto[]>([]);
  const [error, setError] = useState("");
  const [holdExpired, setHoldExpired] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    clearHoldPaymentNavigation();
    if (!bookingId) {
      setError("Missing booking reference");
      return;
    }
    const accessToken = resolveBookingAccessToken(bookingId, accessTokenParam);
    if (!accessToken) {
      setError("Missing booking access. Please start checkout again.");
      return;
    }
    void apiGet<BookingDto>(
      `/bookings/${bookingId}?${bookingAccessQuery(accessToken)}`,
    )
      .then((r) => {
        setBooking(r.data);
        if (r.data.holdId) setActiveHoldId(r.data.holdId);
      })
      .catch(() => setError("Could not load booking"));

    void apiGet<{ gateways: PaymentGatewayOptionDto[] }>("/payments/gateways")
      .then((r) => setGateways(r.data.gateways))
      .catch(() => setGateways([]));
  }, [bookingId, accessTokenParam]);

  const handleHoldExpired = useCallback(() => {
    setHoldExpired(true);
    setError("Payment time expired. Your seats have been released.");
    void releaseActiveHold();
  }, []);

  const handlePay = useCallback(
    async (providerCode: PaymentGatewayOptionDto["code"]) => {
      if (!bookingId || holdExpired || paying) return;
      setError("");
      setPaying(true);
      try {
        const initiated = await apiPost<{
          redirectUrl?: string;
          clientSecret: string;
        }>("/payments/initiate", {
          bookingId,
          method: "ONLINE",
          providerCode,
          scheduleId,
        });
        if (initiated.data.redirectUrl) {
          window.location.href = initiated.data.redirectUrl;
          return;
        }
        throw new Error("Payment gateway did not return a redirect URL");
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Payment could not be started",
        );
        setPaying(false);
      }
    },
    [bookingId, holdExpired, paying, scheduleId],
  );

  async function cancelPayment() {
    await releaseActiveHold();
    const back =
      typeof window !== "undefined"
        ? sessionStorage.getItem("last-search-url")
        : null;
    router.push(back ?? "/");
  }

  const totalPerSeat =
    booking && booking.seatLabels.length > 0
      ? Math.round(booking.totalAmount / booking.seatLabels.length)
      : 0;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <HomeHeader />

      {/* ── Page header ── */}
      <div className="border-b border-gray-200 bg-white py-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="m-0 text-[1.6rem] font-extrabold tracking-tight text-[#1a202c]">
            Complete Your Payment
          </h1>
          <p className="mt-1 text-[0.875rem] text-[#718096]">
            Review your booking details and proceed with secure payment
          </p>
          <div className="mt-4">
            <StepBar />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">

        {/* ── Left: Booking Summary ── */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="m-0 text-[0.95rem] font-bold text-[#1a202c]">
                Booking Summary
              </h2>
            </div>

            {booking ? (
              <>
                {/* Boarding pass style header */}
                <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-[var(--primary-hover)]">
                  <div className="px-5 py-4 text-white">
                    <div className="mb-3 flex items-center gap-2 text-[1.15rem] font-extrabold tracking-wide">
                      <span>{booking.routeFrom?.toUpperCase() ?? "—"}</span>
                      <ChevronRight size={18} className="shrink-0 opacity-70" />
                      <span>{booking.routeTo?.toUpperCase() ?? "—"}</span>
                    </div>
                    <p className="mb-3 text-[0.78rem] font-medium text-green-200">
                      {booking.departureAt
                        ? formatTripDate(booking.departureAt)
                        : "—"}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[0.72rem]">
                      <div>
                        <span className="font-medium text-green-300">
                          Ticket No
                        </span>
                        <p className="m-0 font-bold tracking-widest">
                          {shortRef(booking.id)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-green-300">PNR</span>
                        <p className="m-0 font-bold tracking-widest">
                          {booking.id.slice(9, 16).toUpperCase()}
                        </p>
                      </div>
                      {booking.coachNumber && (
                        <div>
                          <span className="font-medium text-green-300">
                            Coach
                          </span>
                          <p className="m-0 font-bold">{booking.coachNumber}</p>
                        </div>
                      )}
                      {booking.busType && (
                        <div>
                          <span className="font-medium text-green-300">
                            Service
                          </span>
                          <p className="m-0 font-bold">
                            {booking.busType === "AC" ? "AC" : "Non-AC"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Departure strip */}
                  {booking.departureAt && (
                    <div className="border-t border-green-700 bg-[#145214] px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-wider text-green-300">
                            Departure
                          </p>
                          <p className="m-0 text-[1.1rem] font-extrabold text-white">
                            {formatTime12h(booking.departureAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {booking.seatLabels.map((s) => (
                            <span
                              key={s}
                              className="rounded bg-white/20 px-2 py-[0.2rem] text-[0.72rem] font-bold text-white"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Passenger information */}
                <div className="px-4 py-4">
                  <h3 className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-[#718096]">
                    Passenger Information
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    {[
                      { label: "Name", value: booking.passengerName },
                      {
                        label: "Email",
                        value: booking.passengerEmail || "—",
                      },
                      { label: "Phone", value: booking.passengerPhone },
                      {
                        label: "Boarding Point",
                        value: booking.boardingPointName?.toUpperCase() ?? "—",
                      },
                    ].map(({ label, value }, i) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between px-4 py-[0.6rem] text-[0.82rem] ${
                          i % 2 === 0 ? "bg-[#f8fafb]" : "bg-white"
                        }`}
                      >
                        <span className="font-medium text-[#718096]">
                          {label}
                        </span>
                        <span className="font-semibold text-[#1a202c]">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected seats */}
                <div className="px-4 pb-4">
                  <h3 className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-[#718096]">
                    Selected Seats
                  </h3>
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#f8fafb] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {booking.seatLabels.map((s) => (
                          <span
                            key={s}
                            className="rounded-[var(--radius-sm)] bg-[var(--primary)] px-2 py-[0.2rem] text-[0.72rem] font-bold text-white"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <span className="text-[0.78rem] text-[#718096]">
                        Total seats: {booking.seatLabels.length}
                      </span>
                    </div>
                    {totalPerSeat > 0 && (
                      <span className="text-[0.78rem] font-semibold text-[#718096]">
                        @ {formatMoneyBdt(totalPerSeat)} each
                      </span>
                    )}
                  </div>
                </div>

                {/* Total amount */}
                <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-[var(--primary-hover)] px-5 py-4">
                  <span className="text-[0.95rem] font-bold text-white">
                    Total Amount
                  </span>
                  <span className="text-[1.35rem] font-extrabold text-white">
                    {formatMoneyBdt(booking.totalAmount)}
                  </span>
                </div>
              </>
            ) : error ? (
              <p className="px-5 py-6 text-[0.82rem] text-[var(--danger)]">
                {error}
              </p>
            ) : (
              <div className="space-y-3 px-5 py-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-gray-100"
                    style={{ width: `${70 + i * 8}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Payment Method ── */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="m-0 text-[0.95rem] font-bold text-[#1a202c]">
                Choose Payment Method
              </h2>
            </div>

            <div className="p-5">
              {/* Timer */}
              {booking?.holdExpiresAt && (
                <div className="mb-4">
                  <SeatHoldTimer
                    expiresAt={booking.holdExpiresAt}
                    onExpired={handleHoldExpired}
                    variant="payment"
                  />
                </div>
              )}

              {/* Gateway options */}
              {gateways.length === 0 ? (
                <p
                  className="rounded-lg bg-red-50 px-4 py-3 text-[0.78rem] text-[var(--danger)]"
                  role="alert"
                >
                  No payment gateways are configured. Please contact support.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {gateways.map((g) => (
                    <div
                      key={g.code}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      {/* Gateway header */}
                      <div className="flex items-center gap-3 border-b border-gray-100 bg-[#f8fafb] px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] shadow-sm">
                          <ShieldCheck size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="m-0 text-[0.85rem] font-bold text-[#1a202c]">
                            Secure Payment
                          </p>
                          <p className="m-0 text-[0.7rem] text-[#718096]">
                            via {g.displayName} Gateway
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="px-4 py-3">
                        <ul className="m-0 flex list-none flex-col gap-[0.45rem] p-0 text-[0.75rem] text-[#4a5568]">
                          {[
                            "bKash, Nagad, Rocket & Mobile Banking",
                            "Visa, Mastercard & Internet Banking",
                            "SSL encrypted secure transaction",
                          ].map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <Check
                                size={13}
                                className="mt-[1px] shrink-0 text-[var(--primary)]"
                                strokeWidth={2.5}
                              />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pay button */}
                      <div className="px-4 pb-4">
                        <button
                          type="button"
                          className={`w-full cursor-pointer overflow-hidden rounded-xl border-none bg-[var(--primary)] py-[0.9rem] font-inherit transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50${paying ? " cursor-wait opacity-70" : ""}`}
                          disabled={!booking || holdExpired || paying}
                          onClick={() => void handlePay(g.code)}
                        >
                          <p className="m-0 text-[1.05rem] font-extrabold text-white">
                            {paying
                              ? "Redirecting…"
                              : booking
                                ? `Pay ${formatMoneyBdt(booking.totalAmount)}`
                                : "Loading…"}
                          </p>
                          <p className="m-0 text-[0.7rem] font-medium text-green-200">
                            Complete Secure Payment
                          </p>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SSL note */}
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--green-100)] bg-[var(--green-50)] px-4 py-3">
                <Lock
                  size={14}
                  className="mt-[2px] shrink-0 text-[var(--primary)]"
                />
                <div>
                  <p className="m-0 text-[0.75rem] font-bold text-[var(--primary-hover)]">
                    Secure Payment
                  </p>
                  <p className="m-0 text-[0.7rem] leading-[1.5] text-[#4a5568]">
                    Your payment is processed through SSL encrypted servers. We
                    never store your payment information.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && booking && (
                <p
                  className="mt-3 text-[0.75rem] text-[var(--danger)]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* Cancel */}
              <button
                type="button"
                className="mt-3 w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-[0.7rem] text-[0.85rem] font-semibold text-[#4a5568] font-inherit transition-colors hover:bg-gray-50"
                onClick={() => void cancelPayment()}
              >
                ← Cancel &amp; Go Back
              </button>

              {/* Back to home */}
              <p className="mt-3 text-center text-[0.78rem]">
                <Link
                  href="/"
                  className="text-[var(--primary-hover)] hover:underline"
                  onClick={() => void releaseActiveHold()}
                >
                  ← Back to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <SearchFooter />
    </div>
  );
}
