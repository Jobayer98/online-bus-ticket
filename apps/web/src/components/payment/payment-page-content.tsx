"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearActiveHoldId,
  clearHoldPaymentNavigation,
  releaseActiveHold,
  setActiveHoldId,
} from "@/lib/active-hold";
import {
  bookingAccessQuery,
  resolveBookingAccessToken,
} from "@/lib/booking-access";
import { formatMoneyBdt } from "@/lib/format";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";
import { SeatHoldTimer } from "@/components/search/seat-hold-timer";
import type { BookingDto, PaymentGatewayOptionDto } from "@repo/shared";

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
    const accessToken = resolveBookingAccessToken(
      bookingId,
      accessTokenParam,
    );
    if (!accessToken) {
      setError("Missing booking access. Please start checkout again.");
      return;
    }
    void apiGet<BookingDto>(`/bookings/${bookingId}?${bookingAccessQuery(accessToken)}`)
      .then((r) => {
        setBooking(r.data);
        if (r.data.holdId) {
          setActiveHoldId(r.data.holdId);
        }
      })
      .catch(() => {
        setError("Could not load booking");
      });

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
        const msg =
          e instanceof Error ? e.message : "Payment could not be started";
        setError(msg);
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

  const seatsLabel =
    booking?.seatLabels?.length === 1
      ? `Seat ${booking.seatLabels[0]}`
      : booking?.seatLabels?.length
        ? `Seats ${booking.seatLabels.join(", ")}`
        : "";

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
          <div className="payment-page__gateways">
            <p className="payment-page__gateway-hint">
              Pay securely via {profile.companyName}&apos;s payment partner.
            </p>
            {gateways.length === 0 ? (
              <p className="sp-panel-error" role="alert">
                No payment gateways are configured. Please contact support.
              </p>
            ) : (
              <ul className="payment-page__gateway-list">
                {gateways.map((g) => (
                  <li key={g.code}>
                    <button
                      type="button"
                      className="payment-page__gateway-btn"
                      disabled={holdExpired || paying}
                      onClick={() => void handlePay(g.code)}
                    >
                      Pay with {g.displayName}
                      {g.settlementRoute === "SYSTEM" && (
                        <span className="payment-page__gateway-badge">
                          Platform
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="payment-page__cancel-btn"
              onClick={() => void cancelPayment()}
            >
              Cancel
            </button>
          </div>
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
