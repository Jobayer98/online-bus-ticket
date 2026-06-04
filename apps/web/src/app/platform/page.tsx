"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearPlatformAuthSession,
  getPlatformAuthRole,
  getPlatformAuthToken,
} from "@/lib/platform-auth-session";
import { platformApiGet, platformApiPatch } from "@/lib/platform-api-client";
import "./platform.css";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  subdomainPrefix: string;
  customDomain: string | null;
  planTier: "FREE" | "PRO" | "ENTERPRISE";
  planStatus: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
  createdAt: string;
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "badge-grey",
  PRO: "badge-blue",
  ENTERPRISE: "badge-purple",
};

const STATUS_COLORS: Record<string, string> = {
  TRIAL: "badge-yellow",
  ACTIVE: "badge-green",
  SUSPENDED: "badge-red",
  CANCELLED: "badge-grey",
};

export default function PlatformPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getPlatformAuthToken();
    const role = getPlatformAuthRole();
    if (!token || role !== "SUPER_ADMIN") {
      router.replace("/platform/login");
      return;
    }
    setReady(true);
  }, [router]);

  async function fetchTenants() {
    setLoading(true);
    setError(null);
    try {
      const json = await platformApiGet<Tenant[]>("/platform/tenants");
      setTenants(json.data);
      setTotal(json.meta?.total ?? json.data.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    id: string,
    planStatus: string,
    planTier?: string,
  ) {
    setUpdating(id);
    try {
      const json = await platformApiPatch<{
        planStatus: string;
        planTier: string;
      }>(`/platform/tenants/${id}`, {
        planStatus,
        ...(planTier ? { planTier } : {}),
      });
      setTenants((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                planStatus: json.data.planStatus as Tenant["planStatus"],
                planTier: json.data.planTier as Tenant["planTier"],
              }
            : t,
        ),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  function logout() {
    clearPlatformAuthSession();
    router.push("/platform/login");
  }

  useEffect(() => {
    if (ready) void fetchTenants();
  }, [ready]);

  if (!ready) {
    return <main className="platform-page" aria-busy="true" />;
  }

  return (
    <main className="platform-page">
      <header className="platform-header">
        <div className="platform-header-inner">
          <h1 className="platform-title">🚌 Platform Admin</h1>
          <span className="platform-subtitle">Tenant Management</span>
        </div>
        <div className="platform-stats">
          <span className="platform-stat">
            <strong>{total}</strong> tenants
          </span>
          <button
            type="button"
            className="platform-link"
            onClick={logout}
            style={{ marginLeft: "1rem", background: "none", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="platform-content">
        {loading && <p className="platform-loading">Loading tenants…</p>}
        {error && <div className="platform-error">{error}</div>}

        {!loading && !error && (
          <div className="platform-table-wrapper">
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Slug</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      {t.customDomain && (
                        <small className="platform-custom-domain">
                          {t.customDomain}
                        </small>
                      )}
                    </td>
                    <td>
                      <code>{t.subdomainPrefix}</code>
                    </td>
                    <td>
                      <select
                        className={`badge ${PLAN_COLORS[t.planTier]}`}
                        value={t.planTier}
                        disabled={updating === t.id}
                        onChange={(e) =>
                          updateStatus(t.id, t.planStatus, e.target.value)
                        }
                      >
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`badge ${STATUS_COLORS[t.planStatus]}`}
                        value={t.planStatus}
                        disabled={updating === t.id}
                        onChange={(e) =>
                          updateStatus(t.id, e.target.value, t.planTier)
                        }
                      >
                        <option value="TRIAL">TRIAL</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      <a
                        href={`http://${t.subdomainPrefix}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "localhost:3000"}/admin`}
                        target="_blank"
                        rel="noreferrer"
                        className="platform-link"
                      >
                        Open →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tenants.length === 0 && (
              <p className="platform-empty">No tenants yet.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
