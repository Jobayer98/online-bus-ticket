"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { clearAuthSession, getAuthRole, getAuthToken } from "@/lib/auth-session";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { CounterSellFlow } from "./counter-sell-flow";
import { CounterHistoryPanel } from "./counter-history-panel";
import { CounterManagePanel } from "./counter-manage-panel";
import {
  opsHeader,
  opsHeaderLink,
  opsHeaderLogo,
  opsHeaderMain,
  opsHeaderTop,
  opsHeaderTopRight,
  opsPage,
} from "@/components/admin/admin-tw";
import { cpHero, cpNav, cpNavBtn, cpNavBtnActive } from "./counter-tw";

type Tab = "sell" | "history" | "manage";

const ALLOWED_ROLES = new Set(["COUNTER_SELLER", "ADMIN"]);

export function CounterPosPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("sell");
  const [ready, setReady] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [clock, setClock] = useState("");
  useGlobalLoading(!ready);

  useEffect(() => {
    const token = getAuthToken();
    const role = getAuthRole();
    if (!token || !role || !ALLOWED_ROLES.has(role)) {
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
          <span className="text-[0.875rem] text-[#666]">Counter point of sale</span>
          <div className={opsHeaderTopRight}>
            <span>{clock}</span>
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
            menuLabel="Counter navigation"
            items={[
              {
                type: "button",
                label: "Sell ticket",
                active: tab === "sell",
                onClick: () => setTab("sell"),
              },
              {
                type: "button",
                label: "Today\u2019s sales",
                active: tab === "history",
                onClick: () => setTab("history"),
              },
              {
                type: "button",
                label: "Refund / change",
                active: tab === "manage",
                onClick: () => setTab("manage"),
              },
            ]}
          />
          <nav className={cpNav} aria-label="Counter">
            {(
              [
                ["sell", "Sell ticket"],
                ["history", "Today\u2019s sales"],
                ["manage", "Refund / change"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`${cpNavBtn} ${tab === id ? cpNavBtnActive : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div
        className={cpHero}
        style={{ backgroundImage: "url(/images/home/hero.jpg)" }}
      />

      {tab === "sell" && (
        <CounterSellFlow onSold={() => setHistoryKey((k) => k + 1)} />
      )}
      {tab === "history" && <CounterHistoryPanel refreshKey={historyKey} />}
      {tab === "manage" && <CounterManagePanel />}
    </div>
  );
}
