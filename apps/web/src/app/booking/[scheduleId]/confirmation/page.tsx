"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const passengerNumber = searchParams.get("passengerNumber");

  return (
    <section className="container">
      <h1>Booking confirmed</h1>
      <article className="card">
        <p>Your passenger number:</p>
        <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{passengerNumber}</p>
        <p>Download your ticket anytime with passenger number + phone.</p>
        <Link href="/ticket" className="btn">
          Download ticket
        </Link>
      </article>
    </section>
  );
}
