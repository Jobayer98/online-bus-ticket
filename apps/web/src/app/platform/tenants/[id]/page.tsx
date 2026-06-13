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
import { toast } from "@/lib/toast";
import type { PlatformTenantDetailDto } from "@repo/shared";
import {
  admPageTitleClass,
  cpSectionClass,
  cpTableClass,
  cpTableWrapClass,
  platformBtnClass,
  platformBtnDangerClass,
  platformBtnPrimaryClass,
  platformDetailActionsClass,
  platformDetailCardClass,
  platformDetailGridClass,
  platformDetailHeaderClass,
  platformDetailMetaClass,
  platformDetailPageClass,
  platformDlClass,
  platformErrorClass,
  platformLinkClass,
  platformLoadingClass,
} from "@/components/platform/platform-styles";

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
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  if (!ready) {
    return <main className={platformDetailPageClass} aria-busy="true" />;
  }

  const mainDomain =
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "localhost:3000";
  const adminUrl = tenant
    ? `http://${tenant.subdomainPrefix}.${mainDomain}/admin`
    : "#";

  return (
    <main className={platformDetailPageClass}>
      <header className={platformDetailHeaderClass}>
        <Link href="/platform" className={platformLinkClass}>
          ← Back to platform
        </Link>
      </header>

      <div className={cpSectionClass}>
        {loading && <p className={platformLoadingClass}>Loading tenant…</p>}
        {error && <div className={platformErrorClass}>{error}</div>}

        {tenant && (
          <>
            <h1 className={admPageTitleClass}>{tenant.name}</h1>
            <p className={platformDetailMetaClass}>
              Status: <strong>{tenant.planStatus}</strong> · Plan:{" "}
              <strong>{tenant.planTier}</strong> · Since{" "}
              {new Date(tenant.createdAt).toLocaleDateString("en-GB")}
            </p>

            <div className={platformDetailGridClass}>
              <section className={platformDetailCardClass}>
                <h3>Organization</h3>
                <dl className={platformDlClass}>
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

              <section className={platformDetailCardClass}>
                <h3>Subscription</h3>
                <dl className={platformDlClass}>
                  <dt>Plan</dt>
                  <dd>{tenant.planTier}</dd>
                  <dt>Monthly MRR</dt>
                  <dd>{formatMoneyBdt(tenant.monthlyMrr)}</dd>
                  <dt>Status</dt>
                  <dd>{tenant.planStatus}</dd>
                </dl>
              </section>

              <section className={platformDetailCardClass}>
                <h3>This month</h3>
                <dl className={platformDlClass}>
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

            <section className={platformDetailCardClass}>
              <h3>Team members</h3>
              <div className={cpTableWrapClass}>
                <table className={cpTableClass}>
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

            <div className={platformDetailActionsClass}>
              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className={platformBtnPrimaryClass}
              >
                Open tenant admin
              </a>
              {tenant.planStatus === "SUSPENDED" ? (
                <button
                  type="button"
                  className={platformBtnClass}
                  disabled={updating}
                  onClick={() => setStatus("ACTIVE")}
                >
                  Reactivate
                </button>
              ) : (
                <button
                  type="button"
                  className={platformBtnDangerClass}
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
