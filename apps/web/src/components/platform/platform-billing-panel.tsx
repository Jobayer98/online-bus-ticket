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
import { toast } from "@/lib/toast";
import type {
  PlatformBillingRevenueDto,
  PlatformSubscriptionDto,
  PlatformInvoiceDto,
} from "@repo/shared";
import {
  admKpiCardClass,
  admKpiGridClass,
  admPageTitleClass,
  badgeClass,
  cpSectionClass,
  filterErrorClass,
  platformAlertWarningClass,
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

const linkBtnClass = `${platformLinkClass} mr-2 cursor-pointer border-0 bg-transparent p-0`;

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
      toast.error(e instanceof Error ? e.message : "Upgrade failed");
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
      toast.error(e instanceof Error ? e.message : "Suspend failed");
    } finally {
      setUpdating(null);
    }
  }

  async function payInvoice(id: string, providerCode: "BKASH" | "SSLCOMMERZ") {
    setUpdating(id);
    try {
      const res = await platformApiPost<{ redirectUrl: string }>(
        `/platform/billing/invoices/${id}/pay`,
        { providerCode },
      );
      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
        return;
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
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
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  }

  return (
    <div className={cpSectionClass}>
      <h2 className={admPageTitleClass}>Billing & revenue</h2>
      {error && <p className={filterErrorClass}>{error}</p>}
      {loading && !revenue && <p className={platformLoadingClass}>Loading billing…</p>}

      {revenue && (
        <>
          <div className={admKpiGridClass}>
            <div className={admKpiCardClass}>
              <label>MRR</label>
              <strong>{formatMoneyBdt(revenue.mrr)}</strong>
              <span>ARR {formatMoneyBdt(revenue.arr)}</span>
            </div>
            <div className={admKpiCardClass}>
              <label>Active subscriptions</label>
              <strong>{revenue.activeSubscriptions}</strong>
            </div>
            <div className={admKpiCardClass}>
              <label>Churn (30d)</label>
              <strong>
                {revenue.churnRatePct !== null
                  ? `${revenue.churnRatePct}%`
                  : "—"}
              </strong>
              <span>{revenue.cancelledThisPeriod} cancelled</span>
            </div>
            <div className={admKpiCardClass}>
              <label>Collection rate</label>
              <strong>{revenue.collectionRatePct}%</strong>
              <span>ARPU {formatMoneyBdt(revenue.arpu)}</span>
            </div>
          </div>

          <div className={`${platformPlanBarsClass} mb-5`}>
            {revenue.planDistribution.map((p) => (
              <div key={p.planTier} className={platformPlanBarRowClass}>
                <span className={platformPlanBarLabelClass}>{p.planTier}</span>
                <div className={platformPlanBarTrackClass}>
                  <div
                    className={platformPlanBarFillClass}
                    style={{
                      width: revenue.mrr
                        ? `${(p.mrr / revenue.mrr) * 100}%`
                        : "0%",
                      backgroundColor: "#2e7d32",
                    }}
                  />
                </div>
                <span className={platformPlanBarMetaClass}>
                  {p.count} · {formatMoneyBdt(p.mrr)}
                </span>
              </div>
            ))}
          </div>

          <div className={platformTableWrapClass}>
            <table className={platformTableClass}>
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
                        <small className={`${platformAlertWarningClass} mt-1 block`}>
                          At risk
                        </small>
                      )}
                    </td>
                    <td>{s.planTier}</td>
                    <td>{formatMoneyBdt(s.monthlyPriceMinor)}</td>
                    <td>
                      <span
                        className={badgeClass(
                          s.status === "ACTIVE"
                            ? "badge-green"
                            : s.status === "PAST_DUE"
                              ? "badge-yellow"
                              : "badge-grey",
                        )}
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
                          className={linkBtnClass}
                          disabled={updating === s.id}
                          onClick={() => upgrade(s.id, "PRO")}
                        >
                          Upgrade PRO
                        </button>
                      )}
                      {s.status !== "SUSPENDED" && (
                        <button
                          type="button"
                          className={linkBtnClass}
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

          <div className={`${platformTableWrapClass} mt-5`}>
            <h3 className={platformSectionTitleClass}>Invoices</h3>
            <table className={platformTableClass}>
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
                        className={badgeClass(
                          inv.status === "PAID"
                            ? "badge-green"
                            : inv.status === "FAILED"
                              ? "badge-red"
                              : "badge-yellow",
                        )}
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
                        className={linkBtnClass}
                        onClick={() => downloadInvoice(inv.id, inv.invoiceNumber)}
                      >
                        Download
                      </button>
                      {inv.status !== "PAID" && (
                        <>
                          <button
                            type="button"
                            className={linkBtnClass}
                            disabled={updating === inv.id}
                            onClick={() => payInvoice(inv.id, "SSLCOMMERZ")}
                          >
                            Pay (SSLCommerz)
                          </button>
                          <button
                            type="button"
                            className={linkBtnClass}
                            disabled={updating === inv.id}
                            onClick={() => payInvoice(inv.id, "BKASH")}
                          >
                            Pay (bKash)
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <p className={platformEmptyClass}>No invoices yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
