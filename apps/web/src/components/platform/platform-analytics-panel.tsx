"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { platformApiGet } from "@/lib/platform-api-client";
import { getPlatformAuthToken } from "@/lib/platform-auth-session";
import { formatMoneyBdt } from "@/lib/format";
import type { PlatformUsageOverviewDto } from "@repo/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function PlatformAnalyticsPanel() {
  const [periodDays, setPeriodDays] = useState(30);
  const [data, setData] = useState<PlatformUsageOverviewDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading && !data);

  useEffect(() => {
    setLoading(true);
    setError("");
    platformApiGet<PlatformUsageOverviewDto>(
      `/platform/usage?periodDays=${periodDays}`,
    )
      .then((r) => setData(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [periodDays]);

  async function exportCsv() {
    const token = getPlatformAuthToken();
    const res = await fetch(
      `${API_URL}/api/v1/platform/usage/export?periodDays=${periodDays}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      },
    );
    if (!res.ok) {
      alert("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platform-usage.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxBookings = Math.max(
    ...(data?.bookingsByDay.map((d) => d.bookings) ?? [1]),
    1,
  );

  return (
    <div className="cp-section admin-dashboard">
      <div className="platform-panel-head">
        <h2 className="adm-page-title">Platform analytics</h2>
        <div className="platform-filters" style={{ marginBottom: 0 }}>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            aria-label="Period"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button type="button" className="platform-btn" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {error && <p className="sp-filter-error">{error}</p>}
      {loading && !data && <p className="platform-loading">Loading analytics…</p>}

      {data && (
        <>
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card">
              <label>API calls</label>
              <strong>{data.totalApiCalls.toLocaleString()}</strong>
            </div>
            <div className="adm-kpi-card">
              <label>Bookings</label>
              <strong>{data.totalBookings.toLocaleString()}</strong>
            </div>
            <div className="adm-kpi-card">
              <label>Avg response</label>
              <strong>{data.avgResponseMs}ms</strong>
            </div>
            <div className="adm-kpi-card">
              <label>Error rate</label>
              <strong>{data.errorRatePct}%</strong>
            </div>
          </div>

          {data.bookingsByDay.length > 0 && (
            <div className="platform-detail-card" style={{ marginBottom: "1rem" }}>
              <h3>Bookings over time</h3>
              <div className="platform-plan-bars">
                {data.bookingsByDay.map((d) => (
                  <div key={d.date} className="platform-plan-bar-row">
                    <span className="platform-plan-bar-label">{d.date.slice(5)}</span>
                    <div className="platform-plan-bar-track">
                      <div
                        className="platform-plan-bar-fill"
                        style={{
                          width: `${(d.bookings / maxBookings) * 100}%`,
                          backgroundColor: "#2e7d32",
                        }}
                      />
                    </div>
                    <span className="platform-plan-bar-meta">{d.bookings}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="platform-table-wrapper">
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Bookings</th>
                  <th>Share</th>
                  <th>API calls</th>
                  <th>Avg resp</th>
                  <th>Errors</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.tenants.map((t) => (
                  <tr key={t.tenantId}>
                    <td>
                      <Link href={`/platform/tenants/${t.tenantId}`}>
                        {t.tenantName}
                      </Link>
                    </td>
                    <td>{t.bookings}</td>
                    <td>{t.bookingsSharePct}%</td>
                    <td>{t.apiCalls}</td>
                    <td>{t.avgResponseMs}ms</td>
                    <td>{t.errorRatePct}%</td>
                    <td>{formatMoneyBdt(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
