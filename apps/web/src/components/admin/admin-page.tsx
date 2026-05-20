"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { clearAuthSession, getAuthRole, getAuthToken } from "@/lib/auth-session";
import { AdminDashboardPanel } from "./admin-dashboard-panel";
import { AdminStopsPanel } from "./admin-stops-panel";
import { AdminRoutesPanel } from "./admin-routes-panel";
import { AdminLayoutsPanel } from "./admin-layouts-panel";
import { AdminCoachesPanel } from "./admin-coaches-panel";
import { AdminSchedulesPanel } from "./admin-schedules-panel";
import { AdminReportsPanel } from "./admin-reports-panel";
import "../../app/home.css";
import "../../app/search/search.css";
import "../../app/counter/counter.css";
import "../../app/admin/admin.css";

type Tab =
  | "dashboard"
  | "stops"
  | "routes"
  | "layouts"
  | "coaches"
  | "schedules"
  | "reports";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "stops", label: "Stops" },
  { id: "routes", label: "Routes" },
  { id: "layouts", label: "Layouts" },
  { id: "coaches", label: "Coaches" },
  { id: "schedules", label: "Schedules" },
  { id: "reports", label: "Reports" },
];

export function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    const role = getAuthRole();
    if (!token || role !== "ADMIN") {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    function tick() {
      setClock(
        new Date().toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Dhaka",
        }),
      );
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  function logout() {
    clearAuthSession();
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="search-page admin-page">
        <div className="sp-empty">Loading admin…</div>
      </div>
    );
  }

  return (
    <div className="search-page admin-page">
      <header className="home-header">
        <div className="home-header-top">
          <span style={{ fontSize: "0.875rem", color: "#666" }}>Administration</span>
          <div className="home-header-top__right">
            <span>{clock}</span>
            <Link href="/counter">Counter</Link>
            <Link href="/">Public site</Link>
            <button type="button" className="home-header-top__logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <div className="home-header-main">
          <BrandLogo className="brand-logo home-logo" />
          <nav className="adm-nav" aria-label="Admin">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={tab === id ? "is-active" : undefined}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div
        className="adm-hero sp-hero"
        style={{ backgroundImage: "url(/images/home/hero.jpg)" }}
      />

      {tab === "dashboard" && <AdminDashboardPanel />}
      {tab === "stops" && <AdminStopsPanel />}
      {tab === "routes" && <AdminRoutesPanel />}
      {tab === "layouts" && <AdminLayoutsPanel />}
      {tab === "coaches" && <AdminCoachesPanel />}
      {tab === "schedules" && <AdminSchedulesPanel />}
      {tab === "reports" && <AdminReportsPanel />}
    </div>
  );
}
