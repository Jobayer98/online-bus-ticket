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

const dashBtnBase =
  "inline-flex h-[38px] cursor-pointer items-center justify-center whitespace-nowrap rounded px-4 font-[inherit] text-[0.85rem] font-semibold no-underline box-border";

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const variant =
    s === "confirmed" || s === "paid"
      ? "bg-[#e8f5e9] text-[var(--primary-hover)]"
      : s === "cancelled"
        ? "bg-[#fdecea] text-[#c62828]"
        : "bg-[#fff8e6] text-[#7a5c00]";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[0.72rem] font-bold tracking-wide uppercase ${variant}`}>
      {statusLabel(status)}
    </span>
  );
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
      <header className="bg-gradient-to-br from-[var(--primary-hover)] to-[var(--primary)] px-4 py-7 pb-8 text-white">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-5 lg:max-w-[1200px]">
          <div>
            <p className="m-0 mb-1 text-[0.8rem] font-semibold tracking-widest uppercase opacity-85">
              My account
            </p>
            <h1 className="m-0 text-[1.65rem] leading-tight font-bold max-md:text-[1.35rem]">
              Hello, {displayName}
            </h1>
            {profile && (
              <p className="mt-1.5 mb-0 text-[0.9rem] opacity-90">
                {profile.phone}
                {profile.role !== "CUSTOMER" && (
                  <span className="font-semibold"> · {profile.role}</span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-md:w-full">
            <Link href="/" className={`${dashBtnBase} border-0 bg-white text-[var(--primary-hover)] hover:bg-[#f0f7f0] max-md:min-w-[calc(50%-0.25rem)] max-md:flex-1`}>
              Book a trip
            </Link>
            <Link href="/ticket" className={`${dashBtnBase} border border-white/75 bg-transparent text-white hover:bg-white/12 max-md:min-w-[calc(50%-0.25rem)] max-md:flex-1`}>
              Download ticket
            </Link>
            <button type="button" className={`${dashBtnBase} border-0 bg-black/15 text-white hover:bg-black/25 max-md:w-full max-md:flex-[1_1_100%]`} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 pb-12 lg:max-w-[1200px]">
        {error && !loading && (
          <div className="rounded border border-[#e5e7eb] bg-white p-5 text-center">
            <p className="m-0 mb-3 text-[#c62828]">{error}</p>
            <button type="button" className={`${dashBtnBase} border border-white/75 bg-transparent text-[var(--primary-hover)]`} onClick={load}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div className="rounded border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                <span className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-[#666] uppercase">
                  Total bookings
                </span>
                <strong className="text-[1.75rem] leading-none font-bold text-[var(--primary-hover)]">
                  {bookings.length}
                </strong>
              </div>
              <div className="rounded border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                <span className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-[#666] uppercase">
                  Upcoming trips
                </span>
                <strong className="text-[1.75rem] leading-none font-bold text-[var(--primary-hover)]">
                  {upcoming.length}
                </strong>
              </div>
            </div>

            <section>
              <h2 className="mb-4 text-[1.1rem] font-bold tracking-wide text-[#222]">
                My bookings
              </h2>
              {bookings.length === 0 ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                  <Bus className="mx-auto mb-3 text-[var(--primary)]" size={48} strokeWidth={1.5} aria-hidden />
                  <h3 className="m-0 mb-1.5 text-[1.111rem] font-bold text-[var(--text)]">
                    No bookings yet
                  </h3>
                  <p className="m-0 mb-4 text-[0.722rem] text-[var(--muted)]">
                    Search routes and book your first trip.
                  </p>
                  <Link href="/" className={`${dashBtnBase} border-0 bg-white text-[var(--primary-hover)] hover:bg-[#f0f7f0]`}>
                    Search routes
                  </Link>
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {bookings.map((b) => (
                    <li key={b.id} className="rounded border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-base text-[#222]">{slugToRouteTitle(b.routeSlug)}</strong>
                        <StatusBadge status={b.status} />
                      </div>
                      <dl className="m-0 grid grid-cols-3 gap-x-4 gap-y-3 max-md:grid-cols-1 max-md:gap-y-2">
                        <div>
                          <dt className="mb-0.5 text-[0.72rem] font-semibold tracking-wide text-[#888] uppercase">
                            Departure
                          </dt>
                          <dd className="m-0 text-[0.9rem] text-[#333]">
                            {formatDateDdMmYyyy(b.departureAt.slice(0, 10))} ·{" "}
                            {formatTime12h(b.departureAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-0.5 text-[0.72rem] font-semibold tracking-wide text-[#888] uppercase">
                            Seats
                          </dt>
                          <dd className="m-0 text-[0.9rem] text-[#333]">
                            {b.seatLabels.join(", ") || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-0.5 text-[0.72rem] font-semibold tracking-wide text-[#888] uppercase">
                            Total
                          </dt>
                          <dd className="m-0 text-[0.9rem] font-bold text-[#c62828]">
                            {formatMoneyBdt(b.totalAmount)}
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-2.5 mb-0 border-t border-[#f0f0f0] pt-2.5 text-[0.78rem] text-[#888]">
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
