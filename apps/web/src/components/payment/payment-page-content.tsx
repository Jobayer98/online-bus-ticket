"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
    <div className="min-h-screen bg-[#eceff1]">
      <HomeHeader />
      <div className="mx-auto max-w-[520px] px-4 pb-10 pt-4">
        {booking?.holdExpiresAt && (
          <SeatHoldTimer
            expiresAt={booking.holdExpiresAt}
            onExpired={handleHoldExpired}
            variant="payment"
          />
        )}

        <div className="mb-4 rounded-md border border-[#cfd8dc] bg-white p-4 px-[1.15rem] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h1 className="m-0 mb-3 text-[1.1rem] font-bold text-[#263238]">
            Complete payment
          </h1>
          {booking && (
            <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-[0.65rem] text-[0.82rem]">
              <div>
                <dt className="m-0 font-semibold text-[#607d8b]">Passenger</dt>
                <dd className="m-0 mt-[0.1rem] font-semibold text-[#263238]">
                  {booking.passengerName}
                </dd>
              </div>
              <div>
                <dt className="m-0 font-semibold text-[#607d8b]">Phone</dt>
                <dd className="m-0 mt-[0.1rem] font-semibold text-[#263238]">
                  {booking.passengerPhone}
                </dd>
              </div>
              {seatsLabel && (
                <div>
                  <dt className="m-0 font-semibold text-[#607d8b]">Seats</dt>
                  <dd className="m-0 mt-[0.1rem] font-semibold text-[#263238]">
                    {seatsLabel}
                  </dd>
                </div>
              )}
              <div>
                <dt className="m-0 font-semibold text-[#607d8b]">Amount</dt>
                <dd className="m-0 mt-[0.1rem] font-semibold text-[#263238]">
                  {formatMoneyBdt(booking.totalAmount)}
                </dd>
              </div>
            </dl>
          )}
          {error && !booking && (
            <p className="mt-3 text-[0.75rem] text-[var(--danger)]">{error}</p>
          )}
        </div>

        {booking ? (
          <div className="rounded-md border border-[#cfd8dc] bg-white p-4">
            <p className="m-0 mb-4 text-[0.85rem] text-[#607d8b]">
              Pay securely via {profile.companyName}&apos;s payment partner.
            </p>
            {gateways.length === 0 ? (
              <p className="text-[0.75rem] text-[var(--danger)]" role="alert">
                No payment gateways are configured. Please contact support.
              </p>
            ) : (
              <ul className="m-0 mb-4 flex list-none flex-col gap-3 p-0">
                {gateways.map((g) => (
                  <li key={g.code}>
                    <button
                      type="button"
                      className="w-full cursor-pointer rounded-md border-2 border-[#662d91] bg-white px-4 py-[0.85rem] font-bold text-[#263238] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={holdExpired || paying}
                      onClick={() => void handlePay(g.code)}
                    >
                      Pay with {g.displayName}
                      {g.settlementRoute === "SYSTEM" && (
                        <span className="ml-2 inline-block text-[0.7rem] font-semibold text-[#607d8b]">
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
              className="w-full cursor-pointer rounded-md border border-[#cfd8dc] bg-transparent px-4 py-[0.65rem]"
              onClick={() => void cancelPayment()}
            >
              Cancel
            </button>
          </div>
        ) : null}

        {error && booking && (
          <p className="mt-3 text-[0.75rem] text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}

        <p className="mt-5 text-center text-[0.85rem]">
          <Link
            href="/"
            className="text-[var(--primary-hover)]"
            onClick={() => void releaseActiveHold()}
          >
            ← Back to home
          </Link>
        </p>
      </div>
      <SearchFooter />
    </div>
  );
}
