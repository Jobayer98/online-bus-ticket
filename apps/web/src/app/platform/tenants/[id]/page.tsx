"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  getPlatformAuthRole,
  getPlatformAuthToken,
} from "@/lib/platform-auth-session";
import {
  platformApiGet,
  platformApiPatch,
} from "@/lib/platform-api-client";
import { formatMoneyBdt } from "@/lib/format";
import type { PlatformTenantDetailDto } from "@repo/shared";
import "../../platform.css";
import "../../../admin/admin.css";

export default function PlatformTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [tenant, setTenant] = useState<PlatformTenantDetailDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [ready, setReady] = useState(false);
  useGlobalLoading(!ready || loading);

  useEffect(() => {
    const token = getPlatformAuthToken();
    const role = getPlatformAuthRole();
    if (!token || role !== "SUPER_ADMIN") {
      router.replace("/platform/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    platformApiGet<PlatformTenantDetailDto>(`/platform/tenants/${id}`)
      .then((r) => setTenant(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [ready, id]);

  async function setStatus(planStatus: "ACTIVE" | "SUSPENDED") {
    if (!tenant) return;
    setUpdating(true);
    try {
      const json = await platformApiPatch<{ planStatus: string }>(
        `/platform/tenants/${id}`,
        { planStatus },
      );
      setTenant({ ...tenant, planStatus: json.data.planStatus as PlatformTenantDetailDto["planStatus"] });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  if (!ready) {
    return <main className="platform-page" aria-busy="true" />;
  }

  const mainDomain =
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "localhost:3000";
  const adminUrl = tenant
    ? `http://${tenant.subdomainPrefix}.${mainDomain}/admin`
    : "#";

  return (
    <main className="platform-page platform-detail-page">
      <header className="platform-detail-header">
        <Link href="/platform" className="platform-link">
          ← Back to platform
        </Link>
      </header>

      <div className="cp-section">
        {loading && <p className="platform-loading">Loading tenant…</p>}
        {error && <div className="platform-error">{error}</div>}

        {tenant && (
          <>
            <h1 className="adm-page-title">{tenant.name}</h1>
            <p className="platform-detail-meta">
              Status: <strong>{tenant.planStatus}</strong> · Plan:{" "}
              <strong>{tenant.planTier}</strong> · Since{" "}
              {new Date(tenant.createdAt).toLocaleDateString("en-GB")}
            </p>

            <div className="platform-detail-grid">
              <section className="platform-detail-card">
                <h3>Organization</h3>
                <dl className="platform-dl">
                  <dt>Slug</dt>
                  <dd>
                    <code>{tenant.slug}</code>
                  </dd>
                  <dt>Subdomain</dt>
                  <dd>
                    {tenant.subdomainPrefix}.{mainDomain}
                  </dd>
                  <dt>Custom domain</dt>
                  <dd>{tenant.customDomain ?? "None"}</dd>
                  {tenant.ownerContact && (
                    <>
                      <dt>Admin contact</dt>
                      <dd>
                        {tenant.ownerContact.name ?? "—"} ·{" "}
                        {tenant.ownerContact.phone}
                        {tenant.ownerContact.email &&
                          ` · ${tenant.ownerContact.email}`}
                      </dd>
                    </>
                  )}
                </dl>
              </section>

              <section className="platform-detail-card">
                <h3>Subscription</h3>
                <dl className="platform-dl">
                  <dt>Plan</dt>
                  <dd>{tenant.planTier}</dd>
                  <dt>Monthly MRR</dt>
                  <dd>{formatMoneyBdt(tenant.monthlyMrr)}</dd>
                  <dt>Status</dt>
                  <dd>{tenant.planStatus}</dd>
                </dl>
              </section>

              <section className="platform-detail-card">
                <h3>This month</h3>
                <dl className="platform-dl">
                  <dt>Bookings</dt>
                  <dd>{tenant.statsThisMonth.bookings}</dd>
                  <dt>Gross revenue</dt>
                  <dd>{formatMoneyBdt(tenant.statsThisMonth.grossRevenue)}</dd>
                  <dt>Refunds</dt>
                  <dd>{formatMoneyBdt(tenant.statsThisMonth.refunds)}</dd>
                  <dt>Net revenue</dt>
                  <dd>{formatMoneyBdt(tenant.statsThisMonth.netRevenue)}</dd>
                </dl>
              </section>
            </div>

            <section className="platform-detail-card">
              <h3>Team members</h3>
              <div className="cp-table-wrap">
                <table className="cp-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenant.members.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name ?? "—"}</td>
                        <td>{m.phone}</td>
                        <td>{m.email ?? "—"}</td>
                        <td>{m.role}</td>
                      </tr>
                    ))}
                    {tenant.members.length === 0 && (
                      <tr>
                        <td colSpan={4}>No members yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="platform-detail-actions">
              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className="platform-btn platform-btn--primary"
              >
                Open tenant admin
              </a>
              {tenant.planStatus === "SUSPENDED" ? (
                <button
                  type="button"
                  className="platform-btn"
                  disabled={updating}
                  onClick={() => setStatus("ACTIVE")}
                >
                  Reactivate
                </button>
              ) : (
                <button
                  type="button"
                  className="platform-btn platform-btn--danger"
                  disabled={updating}
                  onClick={() => setStatus("SUSPENDED")}
                >
                  Suspend
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
