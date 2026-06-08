"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatMoneyBdt } from "@/lib/format";
import type { AnalyticsOverviewDto, SalesReportDto } from "@repo/shared";
import {
  admDashboardCards,
  admKpiCard,
  admKpiCardLabel,
  admKpiCardSpan,
  admKpiCardStrong,
  admKpiGrid,
  admPageTitle,
  admStatCard,
  admStatCardHead,
} from "./admin-tw";
import {
  cpSection,
  cpTable,
  cpTableCell,
  cpTableHead,
  cpTableRow,
  cpTableWrap,
} from "@/components/counter/counter-tw";
import { spFilterError } from "@/components/search/search-tw";

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
    <div className={`${cpSection} admin-dashboard`}>
      <h2 className={admPageTitle}>Dashboard — last 30 days</h2>
      {error && <p className={spFilterError}>{error}</p>}

      {overview && (
        <div className={admKpiGrid}>
          <div className={admKpiCard}>
            <label className={admKpiCardLabel}>Net revenue (30d)</label>
            <strong className={admKpiCardStrong}>{formatMoneyBdt(overview.netRevenue30d)}</strong>
            <span className={admKpiCardSpan}>
              Gross {formatMoneyBdt(overview.grossRevenue30d)} · Refunds{" "}
              {formatMoneyBdt(overview.refundTotal30d)}
            </span>
          </div>
          <div className={admKpiCard}>
            <label className={admKpiCardLabel}>Tickets sold (30d)</label>
            <strong className={admKpiCardStrong}>{overview.ticketsSold30d}</strong>
            {overview.refundCount30d > 0 && (
              <span className={admKpiCardSpan}>{overview.refundCount30d} refunds</span>
            )}
          </div>
          <div className={admKpiCard}>
            <label className={admKpiCardLabel}>Upcoming trips</label>
            <strong className={admKpiCardStrong}>{overview.upcomingSchedules}</strong>
            <span className={admKpiCardSpan}>Scheduled, not yet departed</span>
          </div>
          <div className={admKpiCard}>
            <label className={admKpiCardLabel}>Avg ticket (30d)</label>
            <strong className={admKpiCardStrong}>{formatMoneyBdt(overview.avgTicketValue)}</strong>
            <span className={admKpiCardSpan}>{overview.seatsSold30d} seats sold</span>
          </div>
        </div>
      )}

      {sales && (
        <div className={admDashboardCards}>
          <article className={admStatCard}>
            <div className={admStatCardHead}>Sales by channel</div>
            <div className={cpTableWrap}>
              <table className={cpTable}>
                <tbody>
                  <tr className={cpTableRow}>
                    <th scope="row" className={cpTableHead}>Online</th>
                    <td className={cpTableCell}>
                      {sales.online.count} tickets ·{" "}
                      {formatMoneyBdt(sales.online.grossRevenue)}
                    </td>
                  </tr>
                  <tr className={cpTableRow}>
                    <th scope="row" className={cpTableHead}>Counter</th>
                    <td className={cpTableCell}>
                      {sales.counter.count} tickets ·{" "}
                      {formatMoneyBdt(sales.counter.grossRevenue)}
                    </td>
                  </tr>
                  <tr className={cpTableRow}>
                    <th scope="row" className={cpTableHead}>Gross</th>
                    <td className={cpTableCell}>
                      {sales.ticketCount} tickets ·{" "}
                      {formatMoneyBdt(sales.grossRevenue)}
                    </td>
                  </tr>
                  <tr className={cpTableRow}>
                    <th scope="row" className={cpTableHead}>Refunds</th>
                    <td className={cpTableCell}>
                      {sales.refundCount} · {formatMoneyBdt(sales.refundTotal)}
                    </td>
                  </tr>
                  <tr className={cpTableRow}>
                    <th scope="row" className={cpTableHead}>Net</th>
                    <td className={cpTableCell}>
                      <strong>{formatMoneyBdt(sales.netRevenue)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className={admStatCard}>
            <div className={admStatCardHead}>Top routes</div>
            <div className={cpTableWrap}>
              <table className={cpTable}>
                <thead>
                  <tr>
                    <th className={cpTableHead}>Route</th>
                    <th className={cpTableHead}>Tickets</th>
                    <th className={cpTableHead}>Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.byRoute.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`${cpTableCell} text-center text-[#666]`}>
                        No route data
                      </td>
                    </tr>
                  ) : (
                    sales.byRoute.map((r) => (
                      <tr key={r.routeSlug} className={cpTableRow}>
                        <td className={cpTableCell}>{r.routeSlug}</td>
                        <td className={cpTableCell}>{r.count}</td>
                        <td className={cpTableCell}>{formatMoneyBdt(r.grossRevenue)}</td>
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
