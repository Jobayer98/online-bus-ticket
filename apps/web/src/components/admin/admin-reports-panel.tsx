"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDownload, apiGet } from "@/lib/api-client";
import { formatMoneyBdt } from "@/lib/format";
import { getTodayIso } from "@/lib/trip-date";

type Sales = {
  from: string;
  to: string;
  totalRevenue: number;
  ticketCount: number;
  online: { count: number; revenue: number };
  counter: { count: number; revenue: number };
  byRoute: { routeSlug: string; count: number; revenue: number }[];
};

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function AdminReportsPanel() {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(getTodayIso());
  const [sales, setSales] = useState<Sales | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const q = new URLSearchParams({ from, to });
    apiGet<Sales>(`/admin/reports/sales?${q}`)
      .then((r) => setSales(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="cp-section">
      <h2 className="cp-section-title">SALES REPORTS</h2>

      <div className="sp-filter-section" style={{ padding: "0 0 0.75rem" }}>
        <div className="sp-filter-card">
          <div className="sp-filter-row">
            <div className="sp-checkout-field" style={{ flex: "0 1 150px" }}>
              <label htmlFor="rep-from">From</label>
              <input
                id="rep-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="sp-checkout-field" style={{ flex: "0 1 150px" }}>
              <label htmlFor="rep-to">To</label>
              <input
                id="rep-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="adm-form-actions adm-form-actions--with-label">
              <span className="adm-form-actions__spacer" aria-hidden="true">
                Actions
              </span>
              <div className="adm-form-actions__buttons">
                <button type="button" className="sp-filter-search" onClick={load} disabled={loading}>
                  {loading ? "Loading…" : "Apply"}
                </button>
                <button
                  type="button"
                  className="sp-btn-select"
                  disabled={exporting}
                  onClick={async () => {
                    setExporting(true);
                    try {
                      const q = new URLSearchParams({ from, to });
                      await apiDownload(`/admin/reports/export/csv?${q}`, "sales.csv");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Export failed");
                    } finally {
                      setExporting(false);
                    }
                  }}
                >
                  {exporting ? "Exporting…" : "Export CSV"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="sp-filter-error">{error}</p>}

      {sales && (
        <>
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card">
              <label>Total revenue</label>
              <strong>{formatMoneyBdt(sales.totalRevenue)}</strong>
            </div>
            <div className="adm-kpi-card">
              <label>Tickets</label>
              <strong>{sales.ticketCount}</strong>
            </div>
            <div className="adm-kpi-card">
              <label>Online</label>
              <strong>{sales.online.count}</strong>
              <span>{formatMoneyBdt(sales.online.revenue)}</span>
            </div>
            <div className="adm-kpi-card">
              <label>Counter</label>
              <strong>{sales.counter.count}</strong>
              <span>{formatMoneyBdt(sales.counter.revenue)}</span>
            </div>
          </div>

          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Tickets</th>
                  <th>Revenue</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {sales.byRoute.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#666" }}>
                      No sales in range
                    </td>
                  </tr>
                ) : (
                  sales.byRoute.map((r) => (
                    <tr key={r.routeSlug}>
                      <td>{r.routeSlug}</td>
                      <td>{r.count}</td>
                      <td>{formatMoneyBdt(r.revenue)}</td>
                      <td>
                        {sales.totalRevenue
                          ? `${Math.round((r.revenue / sales.totalRevenue) * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
