"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDownload, apiGet } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatMoneyBdt } from "@/lib/format";
import { HomeDatePicker } from "@/components/home-date-picker";
import { getTodayIso } from "@/lib/trip-date";
import type { SalesReportDto } from "@repo/shared";
import { subtractDaysFromDateStr } from "@repo/shared";
import {
  admFormActionsButtons,
  admFormActionsSpacer,
  admFormActionsWithLabel,
  admKpiCard,
  admKpiCardLabel,
  admKpiCardSpan,
  admKpiCardStrong,
  admKpiGrid,
  admReportDateField,
} from "./admin-tw";
import {
  cpSection,
  cpSectionTitle,
  cpTable,
  cpTableCell,
  cpTableHead,
  cpTableRow,
  cpTableWrap,
} from "@/components/counter/counter-tw";
import {
  spBtnSelect,
  spFilterCard,
  spFilterError,
  spFilterRow,
  spFilterSearch,
  spFilterSection,
} from "@/components/search/search-tw";

const REPORT_MIN_DATE = "2020-01-01";

export function AdminReportsPanel() {
  const today = getTodayIso();
  const [from, setFrom] = useState(subtractDaysFromDateStr(today, 30));
  const [to, setTo] = useState(today);
  const [sales, setSales] = useState<SalesReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  useGlobalLoading(loading || exporting);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const q = new URLSearchParams({ from, to });
    apiGet<SalesReportDto>(`/admin/reports/sales?${q}`)
      .then((r) => setSales(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={cpSection}>
      <h2 className={cpSectionTitle}>SALES REPORTS</h2>

      <div className={spFilterSection} style={{ padding: "0 0 0.75rem" }}>
        <div className={spFilterCard}>
          <div className={spFilterRow}>
            <div className={`home-date-field ${admReportDateField}`}>
              <label>From</label>
              <HomeDatePicker
                value={from}
                onChange={setFrom}
                minDate={REPORT_MIN_DATE}
              />
            </div>
            <div className={`home-date-field ${admReportDateField}`}>
              <label>To</label>
              <HomeDatePicker value={to} onChange={setTo} minDate={from} />
            </div>
            <div className={admFormActionsWithLabel}>
              <span className={admFormActionsSpacer} aria-hidden="true">
                Actions
              </span>
              <div className={admFormActionsButtons}>
                <button type="button" className={spFilterSearch} onClick={load} disabled={loading}>
                  Apply
                </button>
                <button
                  type="button"
                  className={spBtnSelect}
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

      {error && <p className={spFilterError}>{error}</p>}

      {sales && (
        <>
          <div className={admKpiGrid}>
            <div className={admKpiCard}>
              <label className={admKpiCardLabel}>Net revenue</label>
              <strong className={admKpiCardStrong}>{formatMoneyBdt(sales.netRevenue)}</strong>
            </div>
            <div className={admKpiCard}>
              <label className={admKpiCardLabel}>Gross revenue</label>
              <strong className={admKpiCardStrong}>{formatMoneyBdt(sales.grossRevenue)}</strong>
              <span className={admKpiCardSpan}>{sales.ticketCount} tickets</span>
            </div>
            <div className={admKpiCard}>
              <label className={admKpiCardLabel}>Refunds</label>
              <strong className={admKpiCardStrong}>{formatMoneyBdt(sales.refundTotal)}</strong>
              <span className={admKpiCardSpan}>{sales.refundCount} transactions</span>
            </div>
            <div className={admKpiCard}>
              <label className={admKpiCardLabel}>Online / Counter</label>
              <strong className={admKpiCardStrong}>
                {formatMoneyBdt(sales.online.grossRevenue)} /{" "}
                {formatMoneyBdt(sales.counter.grossRevenue)}
              </strong>
              <span className={admKpiCardSpan}>
                {sales.online.count} online · {sales.counter.count} counter
              </span>
            </div>
          </div>

          <div className={cpTableWrap}>
            <table className={cpTable}>
              <thead>
                <tr>
                  <th className={cpTableHead}>Route</th>
                  <th className={cpTableHead}>Tickets</th>
                  <th className={cpTableHead}>Gross</th>
                  <th className={cpTableHead}>Share</th>
                </tr>
              </thead>
              <tbody>
                {sales.byRoute.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`${cpTableCell} text-center text-[#666]`}>
                      No sales in range
                    </td>
                  </tr>
                ) : (
                  sales.byRoute.map((r) => (
                    <tr key={r.routeSlug} className={cpTableRow}>
                      <td className={cpTableCell}>{r.routeSlug}</td>
                      <td className={cpTableCell}>{r.count}</td>
                      <td className={cpTableCell}>{formatMoneyBdt(r.grossRevenue)}</td>
                      <td className={cpTableCell}>
                        {sales.grossRevenue
                          ? `${Math.round((r.grossRevenue / sales.grossRevenue) * 100)}%`
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
