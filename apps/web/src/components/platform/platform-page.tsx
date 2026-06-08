"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import {
  clearPlatformAuthSession,
  getPlatformAuthRole,
  getPlatformAuthToken,
} from "@/lib/platform-auth-session";
import {
  platformBadgeClass,
  platformHeaderClass,
  platformHeaderLogoutClass,
  platformHeaderMainClass,
  platformHeaderTopClass,
  platformHeaderTopRightClass,
  platformNavBtnActiveClass,
  platformNavBtnClass,
  platformNavClass,
  platformShellClass,
  platformShellTitleClass,
} from "./platform-styles";
import { PlatformOverviewPanel } from "./platform-overview-panel";
import { PlatformTenantsPanel } from "./platform-tenants-panel";
import { PlatformAnalyticsPanel } from "./platform-analytics-panel";
import { PlatformBillingPanel } from "./platform-billing-panel";
import {
  PlatformPaymentProvidersPanel,
  PlatformWithdrawalsPanel,
} from "./platform-payment-providers-panel";
import { PlatformSystemPanel } from "./platform-system-panel";
import { PlatformAuditPanel } from "./platform-audit-panel";
import { PlatformSupportPanel } from "./platform-support-panel";

type Tab = "overview" | "tenants" | "analytics" | "billing" | "system" | "support" | "audit";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tenants", label: "Tenants" },
  { id: "analytics", label: "Analytics" },
  { id: "billing", label: "Billing" },
  { id: "system", label: "System" },
  { id: "support", label: "Support" },
  { id: "audit", label: "Audit" },
];

export function PlatformPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState("");
  useGlobalLoading(!ready);

  useEffect(() => {
    const token = getPlatformAuthToken();
    const role = getPlatformAuthRole();
    if (!token || role !== "SUPER_ADMIN") {
      router.replace("/platform/login");
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
    clearPlatformAuthSession();
    router.push("/platform/login");
  }

  if (!ready) {
    return <div className={platformShellClass} aria-busy="true" />;
  }

  return (
    <div className={platformShellClass}>
      <header className={platformHeaderClass}>
        <div className={platformHeaderTopClass}>
          <span className={platformBadgeClass}>Platform Admin</span>
          <div className={platformHeaderTopRightClass}>
            <span>{clock} Dhaka</span>
            <button
              type="button"
              className={platformHeaderLogoutClass}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
        <div className={platformHeaderMainClass}>
          <h1 className={platformShellTitleClass}>SaaS Platform Dashboard</h1>
          <MobileNavMenu
            menuLabel="Platform navigation"
            items={TABS.map(({ id, label }) => ({
              type: "button" as const,
              label,
              active: tab === id,
              onClick: () => setTab(id),
            }))}
          />
          <nav className={platformNavClass} aria-label="Platform admin">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={tab === id ? platformNavBtnActiveClass : platformNavBtnClass}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {tab === "overview" && <PlatformOverviewPanel />}
      {tab === "tenants" && <PlatformTenantsPanel />}
      {tab === "analytics" && <PlatformAnalyticsPanel />}
      {tab === "billing" && (
        <>
          <PlatformBillingPanel />
          <PlatformPaymentProvidersPanel />
          <PlatformWithdrawalsPanel />
        </>
      )}
      {tab === "system" && <PlatformSystemPanel />}
      {tab === "support" && <PlatformSupportPanel />}
      {tab === "audit" && <PlatformAuditPanel />}
    </div>
  );
}
