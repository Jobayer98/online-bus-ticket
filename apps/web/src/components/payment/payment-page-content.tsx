"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearActiveHoldId,
  clearHoldPaymentNavigation,
  clearPaymentPageEnterLoading,
  isPaymentPageEnterLoading,
  releaseActiveHold,
  setActiveHoldId,
} from "@/lib/active-hold";
import {
  bookingAccessQuery,
  resolveBookingAccessToken,
} from "@/lib/booking-access";
import { formatMoneyBdt } from "@/lib/format";
import { storeTicketLookup } from "@/lib/ticket-lookup-session";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";
import { SeatHoldTimer } from "@/components/search/seat-hold-timer";
import { SslCommerzMockGateway } from "./sslcommerz-mock-gateway";
import type { PaymentMethodId } from "./sslcommerz-payment-strip";
import type { BookingDto } from "@repo/shared";

export function PaymentPageContent() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const accessTokenParam = searchParams.get("accessToken");
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [error, setError] = useState("");
  const [holdExpired, setHoldExpired] = useState(false);
  const [enterLoading, setEnterLoading] = useState(() =>
    isPaymentPageEnterLoading(),
  );

  useEffect(() => {
    clearHoldPaymentNavigation();
    if (!bookingId) {
      setError("Missing booking reference");
      return;
    }
    const accessToken = resolveBookingAccessToken(
      bookingId,
      accessTokenParam,
    );
    if (!accessToken) {
      setError("Missing booking access. Please start checkout again.");
      return;
    }
    apiGet<BookingDto>(`/bookings/${bookingId}?${bookingAccessQuery(accessToken)}`)
      .then((r) => {
        setBooking(r.data);
        if (r.data.holdExpiresAt) {
          /* timer uses booking.holdExpiresAt */
        }
        if (r.data.holdId) {
          setActiveHoldId(r.data.holdId);
        }
      })
      .catch(() => {
        setError("Could not load booking");
      })
      .finally(() => {
        clearPaymentPageEnterLoading();
        setEnterLoading(false);
      });
  }, [bookingId, accessTokenParam]);

  const handleHoldExpired = useCallback(() => {
    setHoldExpired(true);
    setError("Payment time expired. Your seats have been released.");
    void releaseActiveHold();
  }, []);

  const handlePay = useCallback(
    async (_methodId: PaymentMethodId) => {
      if (!bookingId || holdExpired) {
        throw new Error("Booking is no longer valid");
      }
      setError("");
      try {
        const initiated = await apiPost<{ clientSecret: string }>(
          "/payments/initiate",
          { bookingId, method: "ONLINE" },
        );
        const r = await apiPost<{ ticket: { passengerNumber: string } }>(
          "/payments/confirm",
          { bookingId, clientSecret: initiated.data.clientSecret },
          { "Idempotency-Key": bookingId },
        );
        clearActiveHoldId();
        const pn = r.data.ticket?.passengerNumber;
        if (pn && booking?.passengerPhone) {
          storeTicketLookup(bookingId, pn, booking.passengerPhone);
        }
        router.push(
          `/booking/${scheduleId}/confirmation?passengerNumber=${pn}&bookingId=${bookingId}`,
        );
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Payment could not be completed";
        setError(msg);
        await releaseActiveHold();
        throw e;
      }
    },
    [booking, bookingId, holdExpired, router, scheduleId],
  );

  async function cancelPayment() {
    await releaseActiveHold();
    const back =
      typeof window !== "undefined"
        ? sessionStorage.getItem("last-search-url")
        : null;
    router.push(back ?? "/");
  }

  const seatsLabel =
    booking?.seatLabels?.length === 1
      ? `Seat ${booking.seatLabels[0]}`
      : booking?.seatLabels?.length
        ? `Seats ${booking.seatLabels.join(", ")}`
        : "";

  const pageLoading =
    enterLoading || (Boolean(bookingId) && !booking && !error);
  useGlobalLoading(pageLoading);

  return (
    <div className="search-page payment-page">
      <HomeHeader />
      <div className="payment-page__inner">
        {booking?.holdExpiresAt && (
          <SeatHoldTimer
            expiresAt={booking.holdExpiresAt}
            onExpired={handleHoldExpired}
            variant="payment"
          />
        )}

        <div className="payment-page__summary">
          <h1 className="payment-page__heading">Complete payment</h1>
          {booking && (
            <dl className="payment-page__meta">
              <div>
                <dt>Passenger</dt>
                <dd>{booking.passengerName}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{booking.passengerPhone}</dd>
              </div>
              {seatsLabel && (
                <div>
                  <dt>Seats</dt>
                  <dd>{seatsLabel}</dd>
                </div>
              )}
              <div>
                <dt>Amount</dt>
                <dd>{formatMoneyBdt(booking.totalAmount)}</dd>
              </div>
            </dl>
          )}
          {error && !booking && (
            <p className="sp-panel-error payment-page__error">{error}</p>
          )}
        </div>

        {booking ? (
          <SslCommerzMockGateway
            amountMinor={booking.totalAmount}
            orderLabel={`Booking #${booking.id.slice(-8).toUpperCase()}`}
            disabled={holdExpired}
            onPay={handlePay}
            onCancel={() => void cancelPayment()}
          />
        ) : null}

        {error && booking && (
          <p className="sp-panel-error payment-page__error" role="alert">
            {error}
          </p>
        )}

        <p className="payment-page__home">
          <Link href="/" onClick={() => void releaseActiveHold()}>
            ← Back to home
          </Link>
        </p>
      </div>
      <SearchFooter />
    </div>
  );
}
