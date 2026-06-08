"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { clearAuthSession, getAuthRole, getAuthToken } from "@/lib/auth-session";
import { AdminDashboardPanel } from "./admin-dashboard-panel";
import { AdminStopsPanel } from "./admin-stops-panel";
import { AdminRoutesPanel } from "./admin-routes-panel";
import { AdminLayoutsPanel } from "./admin-layouts-panel";
import { AdminCoachesPanel } from "./admin-coaches-panel";
import { AdminSchedulesPanel } from "./admin-schedules-panel";
import { AdminReportsPanel } from "./admin-reports-panel";
import { AdminCmsPanel } from "./cms/admin-cms-panel";
import { AdminTenantSettingsPanel } from "./admin-tenant-settings-panel";
import { AdminPaymentsPanel } from "./admin-payments-panel";
import {
  admHero,
  admNav,
  admNavBtn,
  admNavBtnActive,
  opsHeader,
  opsHeaderLink,
  opsHeaderLogo,
  opsHeaderMain,
  opsHeaderTop,
  opsHeaderTopRight,
  opsPage,
} from "./admin-tw";

type Tab =
  | "dashboard"
  | "stops"
  | "routes"
  | "layouts"
  | "coaches"
  | "schedules"
  | "reports"
  | "content"
  | "payments"
  | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "stops", label: "Stops" },
  { id: "routes", label: "Routes" },
  { id: "layouts", label: "Layouts" },
  { id: "coaches", label: "Coaches" },
  { id: "schedules", label: "Schedules" },
  { id: "reports", label: "Reports" },
  { id: "content", label: "Content" },
  { id: "payments", label: "Payments" },
  { id: "settings", label: "Settings" },
];

export function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState("");
  useGlobalLoading(!ready);

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
    return <div className={opsPage} aria-busy="true" />;
  }

  return (
    <div className={opsPage}>
      <header className={opsHeader}>
        <div className={opsHeaderTop}>
          <span className="text-[0.875rem] text-[#666]">Administration</span>
          <div className={opsHeaderTopRight}>
            <span>{clock}</span>
            <Link href="/counter" className={opsHeaderLink}>
              Counter
            </Link>
            <Link href="/" className={opsHeaderLink}>
              Public site
            </Link>
            <button type="button" className={opsHeaderLink} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <div className={opsHeaderMain}>
          <BrandLogo className={opsHeaderLogo} />
          <MobileNavMenu
            menuLabel="Admin navigation"
            items={TABS.map(({ id, label }) => ({
              type: "button" as const,
              label,
              active: tab === id,
              onClick: () => setTab(id),
            }))}
          />
          <nav className={admNav} aria-label="Admin">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`${admNavBtn} ${tab === id ? admNavBtnActive : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div
        className={admHero}
        style={{ backgroundImage: "url(/images/home/hero.jpg)" }}
      />

      {tab === "dashboard" && <AdminDashboardPanel />}
      {tab === "stops" && <AdminStopsPanel />}
      {tab === "routes" && <AdminRoutesPanel />}
      {tab === "layouts" && <AdminLayoutsPanel />}
      {tab === "coaches" && <AdminCoachesPanel />}
      {tab === "schedules" && <AdminSchedulesPanel />}
      {tab === "reports" && <AdminReportsPanel />}
      {tab === "content" && <AdminCmsPanel />}
      {tab === "payments" && <AdminPaymentsPanel />}
      {tab === "settings" && <AdminTenantSettingsPanel />}
    </div>
  );
}
