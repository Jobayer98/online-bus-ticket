"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { formatMoneyBdt } from "@/lib/format";

type Overview = {
  revenue30d: number;
  tickets30d: number;
  activeSchedules: number;
  soldSeats: number;
  avgTicketValue: number;
};

type Sales = {
  totalRevenue: number;
  ticketCount: number;
  online: { count: number; revenue: number };
  counter: { count: number; revenue: number };
  byRoute: { routeSlug: string; count: number; revenue: number }[];
};

export function AdminDashboardPanel() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [sales, setSales] = useState<Sales | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<Overview>("/admin/reports/analytics/overview"),
      apiGet<Sales>("/admin/reports/sales"),
    ])
      .then(([o, s]) => {
        setOverview(o.data);
        setSales(s.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="cp-section admin-dashboard">
      <h2 className="adm-page-title">Dashboard — last 30 days</h2>
      {error && <p className="sp-filter-error">{error}</p>}

      {overview && (
        <div className="adm-kpi-grid">
          <div className="adm-kpi-card">
            <label>Revenue</label>
            <strong>{formatMoneyBdt(overview.revenue30d)}</strong>
          </div>
          <div className="adm-kpi-card">
            <label>Tickets sold</label>
            <strong>{overview.tickets30d}</strong>
          </div>
          <div className="adm-kpi-card">
            <label>Active schedules</label>
            <strong>{overview.activeSchedules}</strong>
          </div>
          <div className="adm-kpi-card">
            <label>Avg ticket</label>
            <strong>{formatMoneyBdt(overview.avgTicketValue)}</strong>
            <span>{overview.soldSeats} seats sold</span>
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
                      {sales.online.count} tickets · {formatMoneyBdt(sales.online.revenue)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Counter</th>
                    <td>
                      {sales.counter.count} tickets · {formatMoneyBdt(sales.counter.revenue)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Total</th>
                    <td>
                      <strong>
                        {sales.ticketCount} tickets · {formatMoneyBdt(sales.totalRevenue)}
                      </strong>
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
                    <th>Revenue</th>
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
                        <td>{formatMoneyBdt(r.revenue)}</td>
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
