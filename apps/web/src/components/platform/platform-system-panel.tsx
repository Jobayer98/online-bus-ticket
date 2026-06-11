"use client";

import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  platformApiGet,
  platformApiPatch,
} from "@/lib/platform-api-client";
import { toast } from "@/lib/toast";
import type { PlatformHealthDto, PlatformHealthMetricsDto, PlatformAlertDto } from "@repo/shared";
import {
  admKpiCardClass,
  admKpiGridClass,
  admPageTitleClass,
  badgeClass,
  cpSectionClass,
  filterErrorClass,
  platformDetailCardClass,
  platformDetailGridClass,
  platformEmptyClass,
  platformLinkClass,
  platformLoadingClass,
  platformPlanBarFillClass,
  platformPlanBarLabelClass,
  platformPlanBarMetaClass,
  platformPlanBarRowClass,
  platformPlanBarsClass,
  platformPlanBarTrackClass,
  platformSectionTitleClass,
  platformTableClass,
  platformTableWrapClass,
} from "./platform-styles";

const STATUS_CLASS: Record<string, string> = {
  healthy: "badge-green",
  degraded: "badge-yellow",
  down: "badge-red",
};

const linkBtnClass = `${platformLinkClass} mr-2 cursor-pointer border-0 bg-transparent p-0`;

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
      toast.error(e instanceof Error ? e.message : "Update failed");
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
    <div className={cpSectionClass}>
      <h2 className={admPageTitleClass}>System health</h2>
      {error && <p className={filterErrorClass}>{error}</p>}
      {loading && !health && <p className={platformLoadingClass}>Loading health…</p>}

      {health && (
        <>
          <div className={admKpiGridClass}>
            <div className={admKpiCardClass}>
              <label>Overall status</label>
              <strong style={{ textTransform: "capitalize" }}>
                {health.overallStatus}
              </strong>
            </div>
            <div className={admKpiCardClass}>
              <label>Uptime (24h)</label>
              <strong>{health.uptimePct}%</strong>
            </div>
            {metrics && (
              <>
                <div className={admKpiCardClass}>
                  <label>Error rate (7d)</label>
                  <strong>{metrics.errorRatePct}%</strong>
                </div>
                <div className={admKpiCardClass}>
                  <label>Memory (heap)</label>
                  <strong>{metrics.memoryUsagePct}%</strong>
                </div>
              </>
            )}
          </div>

          <div className={platformDetailGridClass}>
            {health.services.map((s) => (
              <section key={s.name} className={platformDetailCardClass}>
                <h3>{s.name}</h3>
                <p>
                  <span className={badgeClass(STATUS_CLASS[s.status] ?? "badge-grey")}>
                    {s.status}
                  </span>
                </p>
                <p className="text-[0.875rem] text-[#6b7280]">{s.detail}</p>
              </section>
            ))}
          </div>

          {metrics && metrics.uptimeByDay.length > 0 && (
            <div className={`${platformDetailCardClass} mt-4`}>
              <h3>Uptime by day</h3>
              <div className={platformPlanBarsClass}>
                {metrics.uptimeByDay.map((d) => (
                  <div key={d.date} className={platformPlanBarRowClass}>
                    <span className={platformPlanBarLabelClass}>{d.date.slice(5)}</span>
                    <div className={platformPlanBarTrackClass}>
                      <div
                        className={platformPlanBarFillClass}
                        style={{
                          width: `${d.uptimePct}%`,
                          backgroundColor:
                            d.uptimePct >= 99 ? "#2e7d32" : "#f57c00",
                        }}
                      />
                    </div>
                    <span className={platformPlanBarMetaClass}>{d.uptimePct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics && metrics.recentErrors.length > 0 && (
            <div className={`${platformTableWrapClass} mt-4`}>
              <h3 className={platformSectionTitleClass}>Recent errors (7d)</h3>
              <table className={platformTableClass}>
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

          <div className={`${platformTableWrapClass} mt-4`}>
            <h3 className={platformSectionTitleClass}>Alerts & incidents</h3>
            <table className={platformTableClass}>
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
                      <span className={badgeClass(SEVERITY_CLASS[a.severity])}>
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
                          className={linkBtnClass}
                          disabled={updating === a.id}
                          onClick={() => updateAlert(a.id, "ACKNOWLEDGED")}
                        >
                          Acknowledge
                        </button>
                      )}
                      {a.status !== "RESOLVED" && (
                        <button
                          type="button"
                          className={linkBtnClass}
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
              <p className={platformEmptyClass}>No active alerts.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
