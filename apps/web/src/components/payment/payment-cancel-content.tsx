"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "@/components/search/search-footer";

export function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen bg-[#eceff1]">
      <HomeHeader />
      <div className="mx-auto max-w-[520px] px-4 pb-10 pt-4">
        <h1 className="m-0 mb-3 text-[1.1rem] font-bold text-[#263238]">
          Payment cancelled
        </h1>
        <p>Your payment was not completed. Seats may still be held briefly.</p>
        {bookingId && (
          <p className="grid grid-cols-2 gap-x-4 gap-y-[0.65rem] text-[0.82rem]">
            Reference: {bookingId.slice(-8).toUpperCase()}
          </p>
        )}
        <p className="mt-5 text-center text-[0.85rem]">
          <Link href="/" className="text-[var(--primary-hover)]">
            ← Back to home
          </Link>
        </p>
      </div>
      <SearchFooter />
    </div>
  );
}
