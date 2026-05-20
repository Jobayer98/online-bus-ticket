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
import { SeatHoldTimer } from "@/components/search/seat-hold-timer";
import type { BookingDto } from "@repo/shared";
import "../../booking.css";
import "../../../search/search.css";

export default function PaymentPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const router = useRouter();
  const [method, setMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);

  useEffect(() => {
    clearHoldPaymentNavigation();
    if (!bookingId) return;
    apiGet<BookingDto>(`/bookings/${bookingId}`)
      .then((r) => {
        if (r.data.holdExpiresAt) {
          setHoldExpiresAt(r.data.holdExpiresAt);
        }
        if (r.data.holdId) {
          setActiveHoldId(r.data.holdId);
        }
      })
      .catch(() => {
        setError("Could not load booking");
      });
  }, [bookingId]);

  const handleHoldExpired = useCallback(() => {
    setHoldExpired(true);
    setError("Payment time expired. Your seats have been released.");
    void releaseActiveHold();
  }, []);

  async function pay() {
    if (!bookingId || holdExpired) return;
    setLoading(true);
    setError("");
    try {
      await apiPost("/payments/initiate", { bookingId, method });
      const r = await apiPost<{ ticket: { passengerNumber: string } }>(
        "/payments/confirm",
        { bookingId },
        { "Idempotency-Key": bookingId },
      );
      clearActiveHoldId();
      const pn = r.data.ticket?.passengerNumber;
      router.push(
        `/booking/${scheduleId}/confirmation?passengerNumber=${pn}&bookingId=${bookingId}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      await releaseActiveHold();
      setHoldExpired(true);
    } finally {
      setLoading(false);
    }
  }

  async function cancelPayment() {
    await releaseActiveHold();
    const back =
      typeof window !== "undefined"
        ? sessionStorage.getItem("last-search-url")
        : null;
    router.push(back ?? "/");
  }

  return (
    <section className="container booking-payment-page">
      <h1>Payment</h1>
      {holdExpiresAt && (
        <SeatHoldTimer
          expiresAt={holdExpiresAt}
          onExpired={handleHoldExpired}
          variant="payment"
        />
      )}
      <article className="card">
        <label htmlFor="payment-method">Method</label>
        <select
          id="payment-method"
          value={method}
          onChange={(e) => setMethod(e.target.value as "ONLINE" | "CASH")}
        >
          <option value="ONLINE">Online (mock)</option>
          <option value="CASH">Cash</option>
        </select>
        {error && <p className="error">{error}</p>}
        <div className="booking-payment-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => void cancelPayment()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            disabled={loading || holdExpired}
            onClick={pay}
          >
            {loading ? "Processing..." : "Pay now"}
          </button>
        </div>
        <p className="booking-payment-home">
          <Link href="/" onClick={() => void releaseActiveHold()}>
            ← Back to home
          </Link>
        </p>
      </article>
    </section>
  );
}
