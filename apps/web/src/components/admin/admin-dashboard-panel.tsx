"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatMoneyBdt } from "@/lib/format";
import type { AnalyticsOverviewDto, SalesReportDto } from "@repo/shared";

export function AdminDashboardPanel() {
  const [overview, setOverview] = useState<AnalyticsOverviewDto | null>(null);
  const [sales, setSales] = useState<SalesReportDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<AnalyticsOverviewDto>("/admin/reports/analytics/overview"),
      apiGet<SalesReportDto>("/admin/reports/sales"),
    ])
      .then(([o, s]) => {
        setOverview(o.data);
        setSales(s.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cp-section admin-dashboard">
      <h2 className="adm-page-title">Dashboard — last 30 days</h2>
      {error && <p className="sp-filter-error">{error}</p>}

      {overview && (
        <div className="adm-kpi-grid">
          <div className="adm-kpi-card">
            <label>Net revenue (30d)</label>
            <strong>{formatMoneyBdt(overview.netRevenue30d)}</strong>
            <span>
              Gross {formatMoneyBdt(overview.grossRevenue30d)} · Refunds{" "}
              {formatMoneyBdt(overview.refundTotal30d)}
            </span>
          </div>
          <div className="adm-kpi-card">
            <label>Tickets sold (30d)</label>
            <strong>{overview.ticketsSold30d}</strong>
            {overview.refundCount30d > 0 && (
              <span>{overview.refundCount30d} refunds</span>
            )}
          </div>
          <div className="adm-kpi-card">
            <label>Upcoming trips</label>
            <strong>{overview.upcomingSchedules}</strong>
            <span>Scheduled, not yet departed</span>
          </div>
          <div className="adm-kpi-card">
            <label>Avg ticket (30d)</label>
            <strong>{formatMoneyBdt(overview.avgTicketValue)}</strong>
            <span>{overview.seatsSold30d} seats sold</span>
          </div>
        </div>
      )}

      {sales && (
        <div className="adm-dashboard-cards">
          <article className="adm-stat-card">
            <div className="adm-stat-card__head">Sales by channel</div>
            <div className="cp-table-wrap">
              <table className="cp-table">
                <tbody>
                  <tr>
                    <th scope="row">Online</th>
                    <td>
                      {sales.online.count} tickets ·{" "}
                      {formatMoneyBdt(sales.online.grossRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Counter</th>
                    <td>
                      {sales.counter.count} tickets ·{" "}
                      {formatMoneyBdt(sales.counter.grossRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Gross</th>
                    <td>
                      {sales.ticketCount} tickets ·{" "}
                      {formatMoneyBdt(sales.grossRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Refunds</th>
                    <td>
                      {sales.refundCount} · {formatMoneyBdt(sales.refundTotal)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Net</th>
                    <td>
                      <strong>{formatMoneyBdt(sales.netRevenue)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className="adm-stat-card">
            <div className="adm-stat-card__head">Top routes</div>
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Tickets</th>
                    <th>Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.byRoute.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "#666" }}>
                        No route data
                      </td>
                    </tr>
                  ) : (
                    sales.byRoute.map((r) => (
                      <tr key={r.routeSlug}>
                        <td>{r.routeSlug}</td>
                        <td>{r.count}</td>
                        <td>{formatMoneyBdt(r.grossRevenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
