"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

type BookingRow = {
  id: string;
  status: string;
  routeSlug: string;
  departureAt: string;
  seatLabels: string[];
  totalAmount: number;
};

export default function DashboardPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<BookingRow[]>("/users/me/bookings")
      .then((r) => setBookings(r.data))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="container">
      <h1>My bookings</h1>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 && <p>No bookings yet.</p>}
      {bookings.map((b) => (
        <article className="card" key={b.id}>
          <p>
            <strong>{b.routeSlug}</strong> — {b.status}
          </p>
          <p>{new Date(b.departureAt).toLocaleString()}</p>
          <p>Seats: {b.seatLabels.join(", ")}</p>
          <p>৳{(b.totalAmount / 100).toFixed(2)}</p>
        </article>
      ))}
    </section>
  );
}
