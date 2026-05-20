"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { clearAuthSession, getAuthRole, getAuthToken } from "@/lib/auth-session";
import { CounterSellFlow } from "./counter-sell-flow";
import { CounterHistoryPanel } from "./counter-history-panel";
import { CounterManagePanel } from "./counter-manage-panel";
import "../../app/home.css";
import "../../app/search/search.css";
import "../../app/counter/counter.css";

type Tab = "sell" | "history" | "manage";

const ALLOWED_ROLES = new Set(["COUNTER_SELLER", "ADMIN"]);

export function CounterPosPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("sell");
  const [ready, setReady] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [clock, setClock] = useState("");

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
    return (
      <div className="search-page counter-page">
        <div className="sp-empty">Loading counter POS…</div>
      </div>
    );
  }

  return (
    <div className="search-page counter-page">
      <header className="home-header">
        <div className="home-header-top">
          <span style={{ fontSize: "0.875rem", color: "#666" }}>
            Counter point of sale
          </span>
          <div className="home-header-top__right">
            <span>{clock}</span>
            <Link href="/">Public site</Link>
            <button type="button" className="home-header-top__logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <div className="home-header-main">
          <BrandLogo className="brand-logo home-logo" />
          <nav className="cp-nav" aria-label="Counter">
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
        className="cp-hero sp-hero"
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
