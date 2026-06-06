"use client";

import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  platformApiGet,
  platformApiPatch,
} from "@/lib/platform-api-client";
import type { PlatformHealthDto, PlatformHealthMetricsDto, PlatformAlertDto } from "@repo/shared";

const STATUS_CLASS: Record<string, string> = {
  healthy: "badge-green",
  degraded: "badge-yellow",
  down: "badge-red",
};

export function PlatformSystemPanel() {
  const [health, setHealth] = useState<PlatformHealthDto | null>(null);
  const [metrics, setMetrics] = useState<PlatformHealthMetricsDto | null>(null);
  const [alerts, setAlerts] = useState<PlatformAlertDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  useGlobalLoading(loading && !health);

  async function load() {
    setLoading(true);
    try {
      const [h, m] = await Promise.all([
        platformApiGet<PlatformHealthDto>("/platform/health"),
        platformApiGet<PlatformHealthMetricsDto>(
          "/platform/health/metrics?periodDays=7",
        ),
      ]);
      setHealth(h.data);
      setMetrics(m.data);

      try {
        const a = await platformApiGet<PlatformAlertDto[]>(
          "/platform/alerts?pageSize=20",
        );
        setAlerts(a.data);
      } catch {
        setAlerts([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateAlert(id: string, status: PlatformAlertDto["status"]) {
    setUpdating(id);
    try {
      await platformApiPatch(`/platform/alerts/${id}`, { status });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  const SEVERITY_CLASS: Record<string, string> = {
    INFO: "badge-blue",
    WARNING: "badge-yellow",
    CRITICAL: "badge-red",
  };

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

          <div className="platform-table-wrapper" style={{ marginTop: "1rem" }}>
            <h3 className="platform-section-title">Alerts & incidents</h3>
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className={`badge ${SEVERITY_CLASS[a.severity]}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td>
                      <strong>{a.title}</strong>
                      <br />
                      <small>{a.message}</small>
                    </td>
                    <td>{a.status}</td>
                    <td>
                      {new Date(a.createdAt).toLocaleString("en-GB", {
                        timeZone: "Asia/Dhaka",
                      })}
                    </td>
                    <td>
                      {a.status === "OPEN" && (
                        <button
                          type="button"
                          className="platform-link"
                          style={{ background: "none", border: "none", cursor: "pointer", marginRight: "0.5rem" }}
                          disabled={updating === a.id}
                          onClick={() => updateAlert(a.id, "ACKNOWLEDGED")}
                        >
                          Acknowledge
                        </button>
                      )}
                      {a.status !== "RESOLVED" && (
                        <button
                          type="button"
                          className="platform-link"
                          style={{ background: "none", border: "none", cursor: "pointer" }}
                          disabled={updating === a.id}
                          onClick={() => updateAlert(a.id, "RESOLVED")}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {alerts.length === 0 && (
              <p className="platform-empty">No active alerts.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
