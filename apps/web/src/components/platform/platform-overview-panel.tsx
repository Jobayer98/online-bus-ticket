"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { platformApiGet } from "@/lib/platform-api-client";
import { formatMoneyBdt } from "@/lib/format";
import type { PlatformDashboardOverviewDto } from "@repo/shared";
import {
  admKpiCardClass,
  admKpiGridClass,
  admPageTitleClass,
  alertClass,
  cpSectionClass,
  cpTableClass,
  cpTableWrapClass,
  filterErrorClass,
  platformAlertListClass,
  platformAlertsClass,
  platformLoadingClass,
  platformPlanBarFillClass,
  platformPlanBarLabelClass,
  platformPlanBarMetaClass,
  platformPlanBarRowClass,
  platformPlanBarsClass,
  platformPlanBarTrackClass,
  platformSectionTitleClass,
  platformTwoColClass,
} from "./platform-styles";

const PLAN_COLORS: Record<string, string> = {
  FREE: "#9ca3af",
  PRO: "#2e7d32",
  ENTERPRISE: "#6d28d9",
};

export function PlatformOverviewPanel() {
  const [data, setData] = useState<PlatformDashboardOverviewDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading);

  useEffect(() => {
    setLoading(true);
    platformApiGet<PlatformDashboardOverviewDto>("/platform/dashboard/overview")
      .then((r) => setData(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className={cpSectionClass}>
        <p className={platformLoadingClass}>Loading overview…</p>
      </div>
    );
  }

  return (
    <div className={cpSectionClass}>
      <h2 className={admPageTitleClass}>Platform overview</h2>
      {error && <p className={filterErrorClass}>{error}</p>}

      {data && (
        <>
          <div className={admKpiGridClass}>
            <div className={admKpiCardClass}>
              <label>Total MRR</label>
              <strong>{formatMoneyBdt(data.totalMrr)}</strong>
              <span>Active paid subscriptions</span>
            </div>
            <div className={admKpiCardClass}>
              <label>Active tenants</label>
              <strong>
                {data.activeTenants} / {data.licensedCapacity}
              </strong>
              <span>
                {Math.round((data.activeTenants / data.licensedCapacity) * 100)}%
                capacity
              </span>
            </div>
            <div className={admKpiCardClass}>
              <label>Bookings this month</label>
              <strong>{data.monthlyBookings}</strong>
              {data.bookingsGrowthPct !== null && (
                <span>
                  {data.bookingsGrowthPct >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(data.bookingsGrowthPct)}% vs last month
                </span>
              )}
            </div>
            <div className={admKpiCardClass}>
              <label>Platform revenue (30d)</label>
              <strong>{formatMoneyBdt(data.platformRevenue30d)}</strong>
              <span>Gross ticket sales all tenants</span>
            </div>
            <div className={admKpiCardClass}>
              <label>Platform uptime</label>
              <strong>{data.platformUptimePct}%</strong>
              <span>Last 30 days (stub until E24)</span>
            </div>
          </div>

          {data.alerts.length > 0 && (
            <div className={platformAlertsClass}>
              <h3 className={platformSectionTitleClass}>Alerts</h3>
              <ul className={platformAlertListClass}>
                {data.alerts.map((a) => (
                  <li
                    key={`${a.tenantId}-${a.message}`}
                    className={alertClass(a.severity)}
                  >
                    {a.tenantId ? (
                      <Link href={`/platform/tenants/${a.tenantId}`}>
                        {a.message}
                      </Link>
                    ) : (
                      a.message
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={platformTwoColClass}>
            <div>
              <h3 className={platformSectionTitleClass}>Top tenants by revenue</h3>
              <div className={cpTableWrapClass}>
                <table className={cpTableClass}>
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Plan</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topTenants.map((t) => (
                      <tr key={t.tenantId}>
                        <td>
                          <Link href={`/platform/tenants/${t.tenantId}`}>
                            {t.name}
                          </Link>
                        </td>
                        <td>{t.planTier}</td>
                        <td>{t.bookingsThisMonth}</td>
                        <td>{formatMoneyBdt(t.revenueThisMonth)}</td>
                      </tr>
                    ))}
                    {data.topTenants.length === 0 && (
                      <tr>
                        <td colSpan={4}>No bookings this month yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className={platformSectionTitleClass}>Plan distribution</h3>
              <div className={platformPlanBarsClass}>
                {data.planDistribution.map((p) => (
                  <div key={p.planTier} className={platformPlanBarRowClass}>
                    <span className={platformPlanBarLabelClass}>{p.planTier}</span>
                    <div className={platformPlanBarTrackClass}>
                      <div
                        className={platformPlanBarFillClass}
                        style={{
                          width: `${p.percentage}%`,
                          backgroundColor: PLAN_COLORS[p.planTier],
                        }}
                      />
                    </div>
                    <span className={platformPlanBarMetaClass}>
                      {p.count} ({p.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
