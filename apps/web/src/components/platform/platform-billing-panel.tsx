"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  platformApiGet,
  platformApiPatch,
  platformApiPost,
  platformApiDownload,
} from "@/lib/platform-api-client";
import { formatMoneyBdt } from "@/lib/format";
import type {
  PlatformBillingRevenueDto,
  PlatformSubscriptionDto,
  PlatformInvoiceDto,
} from "@repo/shared";

export function PlatformBillingPanel() {
  const [revenue, setRevenue] = useState<PlatformBillingRevenueDto | null>(
    null,
  );
  const [subs, setSubs] = useState<PlatformSubscriptionDto[]>([]);
  const [invoices, setInvoices] = useState<PlatformInvoiceDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  useGlobalLoading(loading && !revenue);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [rev, subList] = await Promise.all([
        platformApiGet<PlatformBillingRevenueDto>(
          "/platform/billing/revenue?periodDays=30",
        ),
        platformApiGet<PlatformSubscriptionDto[]>(
          "/platform/billing/subscriptions?pageSize=50",
        ),
      ]);
      setRevenue(rev.data);
      setSubs(subList.data);

      try {
        const invList = await platformApiGet<PlatformInvoiceDto[]>(
          "/platform/billing/invoices?pageSize=50",
        );
        setInvoices(invList.data);
      } catch {
        setInvoices([]);
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

  async function upgrade(id: string, planTier: "PRO" | "ENTERPRISE") {
    setUpdating(id);
    try {
      await platformApiPatch(`/platform/billing/subscriptions/${id}/upgrade`, {
        planTier,
      });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setUpdating(null);
    }
  }

  async function suspend(id: string) {
    if (!confirm("Suspend this subscription?")) return;
    setUpdating(id);
    try {
      await platformApiPost(`/platform/billing/subscriptions/${id}/suspend`, {});
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Suspend failed");
    } finally {
      setUpdating(null);
    }
  }

  async function retryInvoice(id: string) {
    setUpdating(id);
    try {
      await platformApiPost(`/platform/billing/invoices/${id}/retry`, {});
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setUpdating(null);
    }
  }

  async function downloadInvoice(id: string, number: string) {
    try {
      await platformApiDownload(
        `/platform/billing/invoices/${id}/download`,
        `${number}.html`,
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    }
  }

  return (
    <div className="cp-section admin-dashboard">
      <h2 className="adm-page-title">Billing & revenue</h2>
      {error && <p className="sp-filter-error">{error}</p>}
      {loading && !revenue && <p className="platform-loading">Loading billing…</p>}

      {revenue && (
        <>
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card">
              <label>MRR</label>
              <strong>{formatMoneyBdt(revenue.mrr)}</strong>
              <span>ARR {formatMoneyBdt(revenue.arr)}</span>
            </div>
            <div className="adm-kpi-card">
              <label>Active subscriptions</label>
              <strong>{revenue.activeSubscriptions}</strong>
            </div>
            <div className="adm-kpi-card">
              <label>Churn (30d)</label>
              <strong>
                {revenue.churnRatePct !== null
                  ? `${revenue.churnRatePct}%`
                  : "—"}
              </strong>
              <span>{revenue.cancelledThisPeriod} cancelled</span>
            </div>
            <div className="adm-kpi-card">
              <label>Collection rate</label>
              <strong>{revenue.collectionRatePct}%</strong>
              <span>ARPU {formatMoneyBdt(revenue.arpu)}</span>
            </div>
          </div>

          <div className="platform-plan-bars" style={{ marginBottom: "1.25rem" }}>
            {revenue.planDistribution.map((p) => (
              <div key={p.planTier} className="platform-plan-bar-row">
                <span className="platform-plan-bar-label">{p.planTier}</span>
                <div className="platform-plan-bar-track">
                  <div
                    className="platform-plan-bar-fill"
                    style={{
                      width: revenue.mrr
                        ? `${(p.mrr / revenue.mrr) * 100}%`
                        : "0%",
                      backgroundColor: "#2e7d32",
                    }}
                  />
                </div>
                <span className="platform-plan-bar-meta">
                  {p.count} · {formatMoneyBdt(p.mrr)}
                </span>
              </div>
            ))}
          </div>

          <div className="platform-table-wrapper">
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Plan</th>
                  <th>MRR</th>
                  <th>Status</th>
                  <th>Next bill</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/platform/tenants/${s.tenantId}`}>
                        {s.tenantName}
                      </Link>
                      {s.churnRisk && (
                        <small className="platform-alert platform-alert--warning" style={{ display: "block", marginTop: "0.25rem" }}>
                          At risk
                        </small>
                      )}
                    </td>
                    <td>{s.planTier}</td>
                    <td>{formatMoneyBdt(s.monthlyPriceMinor)}</td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === "ACTIVE"
                            ? "badge-green"
                            : s.status === "PAST_DUE"
                              ? "badge-yellow"
                              : "badge-grey"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.nextBillDate
                        ? new Date(s.nextBillDate).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td>
                      {s.planTier !== "PRO" && (
                        <button
                          type="button"
                          className="platform-link"
                          style={{ background: "none", border: "none", cursor: "pointer", marginRight: "0.5rem" }}
                          disabled={updating === s.id}
                          onClick={() => upgrade(s.id, "PRO")}
                        >
                          Upgrade PRO
                        </button>
                      )}
                      {s.status !== "SUSPENDED" && (
                        <button
                          type="button"
                          className="platform-link"
                          style={{ background: "none", border: "none", cursor: "pointer" }}
                          disabled={updating === s.id}
                          onClick={() => suspend(s.id)}
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="platform-table-wrapper" style={{ marginTop: "1.25rem" }}>
            <h3 className="platform-section-title">Invoices</h3>
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.tenantName}</td>
                    <td>{formatMoneyBdt(inv.amountMinor)}</td>
                    <td>
                      <span
                        className={`badge ${
                          inv.status === "PAID"
                            ? "badge-green"
                            : inv.status === "FAILED"
                              ? "badge-red"
                              : "badge-yellow"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {new Date(inv.periodStart).toLocaleDateString("en-GB")} –{" "}
                      {new Date(inv.periodEnd).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="platform-link"
                        style={{ background: "none", border: "none", cursor: "pointer", marginRight: "0.5rem" }}
                        onClick={() => downloadInvoice(inv.id, inv.invoiceNumber)}
                      >
                        Download
                      </button>
                      {inv.status !== "PAID" && (
                        <button
                          type="button"
                          className="platform-link"
                          style={{ background: "none", border: "none", cursor: "pointer" }}
                          disabled={updating === inv.id}
                          onClick={() => retryInvoice(inv.id)}
                        >
                          Retry payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <p className="platform-empty">No invoices yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
