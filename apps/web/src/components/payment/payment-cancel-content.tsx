"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";

export function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="search-page payment-page">
      <HomeHeader />
      <div className="payment-page__inner">
        <h1 className="payment-page__heading">Payment cancelled</h1>
        <p>Your payment was not completed. Seats may still be held briefly.</p>
        {bookingId && (
          <p className="payment-page__meta">
            Reference: {bookingId.slice(-8).toUpperCase()}
          </p>
        )}
        <p className="payment-page__home">
          <Link href="/">← Back to home</Link>
        </p>
      </div>
      <SearchFooter />
    </div>
  );
}
