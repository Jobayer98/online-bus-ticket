"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthRole,
  getAuthToken,
} from "@/lib/auth-session";
import {
  formatDateDdMmYyyy,
  formatMoneyBdt,
  formatTime12h,
  slugToRouteTitle,
} from "@/lib/format";

type UserProfile = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
};

type BookingRow = {
  id: string;
  status: string;
  routeSlug: string;
  departureAt: string;
  seatLabels: string[];
  totalAmount: number;
  createdAt: string;
};

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const variant =
    s === "confirmed" || s === "paid"
      ? "dash-badge--ok"
      : s === "cancelled"
        ? "dash-badge--cancel"
        : "dash-badge--pending";
  return <span className={`dash-badge ${variant}`}>{statusLabel(status)}</span>;
}

export function CustomerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      apiGet<UserProfile>("/users/me"),
      apiGet<BookingRow[]>("/users/me/bookings?pageSize=20"),
    ])
      .then(([userRes, bookingsRes]) => {
        setProfile(userRes.data);
        setBookings(bookingsRes.data);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    const role = getAuthRole();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (role === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (role === "COUNTER_SELLER") {
      router.replace("/counter");
      return;
    }
    load();
  }, [router, load]);

  function logout() {
    clearAuthSession();
    router.push("/login");
  }

  const displayName = profile?.name?.trim() || "Traveler";
  const upcoming = bookings.filter(
    (b) =>
      b.status !== "CANCELLED" &&
      new Date(b.departureAt).getTime() >= Date.now() - 3600_000,
  );

  return (
    <>
      <header className="dash-hero">
        <div className="dash-hero__inner">
          <div>
            <p className="dash-hero__eyebrow">My account</p>
            <h1>Hello, {displayName}</h1>
            {profile && (
              <p className="dash-hero__meta">
                {profile.phone}
                {profile.role !== "CUSTOMER" && (
                  <span className="dash-hero__role"> · {profile.role}</span>
                )}
              </p>
            )}
          </div>
          <div className="dash-hero__actions">
            <Link href="/" className="dash-btn dash-btn--primary">
              Book a trip
            </Link>
            <Link href="/ticket" className="dash-btn dash-btn--outline">
              Download ticket
            </Link>
            <button type="button" className="dash-btn dash-btn--ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dash-content">
        {error && !loading && (
          <div className="dash-alert dash-alert--error">
            <p>{error}</p>
            <button type="button" className="dash-btn dash-btn--outline" onClick={load}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="dash-stats">
              <div className="dash-stat-card">
                <span className="dash-stat-card__label">Total bookings</span>
                <strong className="dash-stat-card__value">{bookings.length}</strong>
              </div>
              <div className="dash-stat-card">
                <span className="dash-stat-card__label">Upcoming trips</span>
                <strong className="dash-stat-card__value">{upcoming.length}</strong>
              </div>
            </div>

            <section className="dash-section">
              <h2 className="dash-section__title">My bookings</h2>
              {bookings.length === 0 ? (
                <div className="dash-empty">
                  <Bus className="dash-empty__icon" size={48} strokeWidth={1.5} aria-hidden />
                  <h3 className="dash-empty__title">No bookings yet</h3>
                  <p className="dash-empty__text">Search routes and book your first trip.</p>
                  <Link href="/" className="dash-btn dash-btn--primary">
                    Search routes
                  </Link>
                </div>
              ) : (
                <ul className="dash-booking-list">
                  {bookings.map((b) => (
                    <li key={b.id} className="dash-booking-card">
                      <div className="dash-booking-card__head">
                        <strong>{slugToRouteTitle(b.routeSlug)}</strong>
                        <StatusBadge status={b.status} />
                      </div>
                      <dl className="dash-booking-card__meta">
                        <div>
                          <dt>Departure</dt>
                          <dd>
                            {formatDateDdMmYyyy(b.departureAt.slice(0, 10))} ·{" "}
                            {formatTime12h(b.departureAt)}
                          </dd>
                        </div>
                        <div>
                          <dt>Seats</dt>
                          <dd>{b.seatLabels.join(", ") || "—"}</dd>
                        </div>
                        <div>
                          <dt>Total</dt>
                          <dd className="dash-booking-card__fare">
                            {formatMoneyBdt(b.totalAmount)}
                          </dd>
                        </div>
                      </dl>
                      <p className="dash-booking-card__booked">
                        Booked {formatDateDdMmYyyy(b.createdAt.slice(0, 10))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
