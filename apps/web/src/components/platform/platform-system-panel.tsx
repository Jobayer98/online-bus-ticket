"use client";

import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { platformApiGet } from "@/lib/platform-api-client";
import type { PlatformHealthDto, PlatformHealthMetricsDto } from "@repo/shared";

const STATUS_CLASS: Record<string, string> = {
  healthy: "badge-green",
  degraded: "badge-yellow",
  down: "badge-red",
};

export function PlatformSystemPanel() {
  const [health, setHealth] = useState<PlatformHealthDto | null>(null);
  const [metrics, setMetrics] = useState<PlatformHealthMetricsDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading && !health);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      platformApiGet<PlatformHealthDto>("/platform/health"),
      platformApiGet<PlatformHealthMetricsDto>(
        "/platform/health/metrics?periodDays=7",
      ),
    ])
      .then(([h, m]) => {
        setHealth(h.data);
        setMetrics(m.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cp-section admin-dashboard">
      <h2 className="adm-page-title">System health</h2>
      {error && <p className="sp-filter-error">{error}</p>}
      {loading && !health && <p className="platform-loading">Loading health…</p>}

      {health && (
        <>
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card">
              <label>Overall status</label>
              <strong style={{ textTransform: "capitalize" }}>
                {health.overallStatus}
              </strong>
            </div>
            <div className="adm-kpi-card">
              <label>Uptime (24h)</label>
              <strong>{health.uptimePct}%</strong>
            </div>
            {metrics && (
              <>
                <div className="adm-kpi-card">
                  <label>Error rate (7d)</label>
                  <strong>{metrics.errorRatePct}%</strong>
                </div>
                <div className="adm-kpi-card">
                  <label>Memory (heap)</label>
                  <strong>{metrics.memoryUsagePct}%</strong>
                </div>
              </>
            )}
          </div>

          <div className="platform-detail-grid">
            {health.services.map((s) => (
              <section key={s.name} className="platform-detail-card">
                <h3>{s.name}</h3>
                <p>
                  <span className={`badge ${STATUS_CLASS[s.status] ?? "badge-grey"}`}>
                    {s.status}
                  </span>
                </p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{s.detail}</p>
              </section>
            ))}
          </div>

          {metrics && metrics.uptimeByDay.length > 0 && (
            <div className="platform-detail-card" style={{ marginTop: "1rem" }}>
              <h3>Uptime by day</h3>
              <div className="platform-plan-bars">
                {metrics.uptimeByDay.map((d) => (
                  <div key={d.date} className="platform-plan-bar-row">
                    <span className="platform-plan-bar-label">{d.date.slice(5)}</span>
                    <div className="platform-plan-bar-track">
                      <div
                        className="platform-plan-bar-fill"
                        style={{
                          width: `${d.uptimePct}%`,
                          backgroundColor:
                            d.uptimePct >= 99 ? "#2e7d32" : "#f57c00",
                        }}
                      />
                    </div>
                    <span className="platform-plan-bar-meta">{d.uptimePct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics && metrics.recentErrors.length > 0 && (
            <div className="platform-table-wrapper" style={{ marginTop: "1rem" }}>
              <h3 className="platform-section-title">Recent errors (7d)</h3>
              <table className="platform-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentErrors.map((e) => (
                    <tr key={`${e.timestamp}-${e.endpoint}-${e.statusCode}`}>
                      <td>
                        {new Date(e.timestamp).toLocaleString("en-GB", {
                          timeZone: "Asia/Dhaka",
                        })}
                      </td>
                      <td>
                        <code>{e.endpoint}</code>
                      </td>
                      <td>{e.statusCode}</td>
                      <td>{e.responseTimeMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
