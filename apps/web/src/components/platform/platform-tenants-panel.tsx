"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  platformApiGet,
  platformApiPatch,
  platformApiPost,
} from "@/lib/platform-api-client";
import { formatMoneyBdt } from "@/lib/format";
import type { PlatformTenantListItemDto } from "@repo/shared";

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

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

type Filters = {
  planTier: string;
  planStatus: string;
  search: string;
};

export function PlatformTenantsPanel() {
  const router = useRouter();
  const [tenants, setTenants] = useState<PlatformTenantListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    planTier: "",
    planStatus: "",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createPlan, setCreatePlan] = useState<"FREE" | "PRO" | "ENTERPRISE">(
    "FREE",
  );
  const [creating, setCreating] = useState(false);
  useGlobalLoading(loading && tenants.length === 0);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (filters.planTier) params.set("planTier", filters.planTier);
      if (filters.planStatus) params.set("planStatus", filters.planStatus);
      if (filters.search) params.set("search", filters.search);

      const json = await platformApiGet<PlatformTenantListItemDto[]>(
        `/platform/tenants?${params.toString()}`,
      );
      setTenants(json.data);
      setTotal(json.meta?.total ?? json.data.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    void fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput.trim() }));
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

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
                planStatus: json.data.planStatus as PlatformTenantListItemDto["planStatus"],
                planTier: json.data.planTier as PlatformTenantListItemDto["planTier"],
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

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const slug = createSlug || slugFromName(createName);
    if (!createName.trim() || slug.length < 2) {
      alert("Enter a valid company name and slug.");
      return;
    }
    setCreating(true);
    try {
      const json = await platformApiPost<{ id: string }>("/platform/tenants", {
        name: createName.trim(),
        slug,
        planTier: createPlan,
        planStatus: "TRIAL",
      });
      setShowCreate(false);
      setCreateName("");
      setCreateSlug("");
      await fetchTenants();
      router.push(`/platform/tenants/${json.data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="cp-section">
      <div className="platform-panel-head">
        <h2 className="adm-page-title">Tenant management</h2>
        <button
          type="button"
          className="platform-btn platform-btn--primary"
          onClick={() => setShowCreate(true)}
        >
          + Create tenant
        </button>
      </div>

      <div className="platform-filters">
        <select
          value={filters.planStatus}
          onChange={(e) => {
            setFilters((f) => ({ ...f, planStatus: e.target.value }));
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={filters.planTier}
          onChange={(e) => {
            setFilters((f) => ({ ...f, planTier: e.target.value }));
            setPage(1);
          }}
          aria-label="Filter by plan"
        >
          <option value="">All plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <input
          type="search"
          placeholder="Search name or slug…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="platform-search"
        />
      </div>

      {loading && <p className="platform-loading">Loading tenants…</p>}
      {error && <div className="platform-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="platform-table-wrapper">
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Slug</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Bookings (M)</th>
                  <th>Revenue (M)</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr
                    key={t.id}
                    className="platform-table-row-click"
                    onClick={() => router.push(`/platform/tenants/${t.id}`)}
                  >
                    <td>
                      <strong>{t.name}</strong>
                    </td>
                    <td>
                      <code>{t.subdomainPrefix}</code>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
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
                    <td onClick={(e) => e.stopPropagation()}>
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
                    <td>{t.memberCount}</td>
                    <td>{t.bookingsThisMonth}</td>
                    <td>{formatMoneyBdt(t.revenueThisMonth)}</td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Link href={`/platform/tenants/${t.id}`} className="platform-link">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tenants.length === 0 && (
              <p className="platform-empty">No tenants match your filters.</p>
            )}
          </div>

          <div className="platform-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages} ({total} total)
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showCreate && (
        <div
          className="platform-modal-overlay"
          onClick={() => !creating && setShowCreate(false)}
          role="presentation"
        >
          <form
            className="platform-modal"
            onSubmit={submitCreate}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Create tenant</h3>
            <label>
              Company name
              <input
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  if (!createSlug || createSlug === slugFromName(createName)) {
                    setCreateSlug(slugFromName(e.target.value));
                  }
                }}
                required
              />
            </label>
            <label>
              Slug
              <input
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
                pattern="^[a-z0-9-]+$"
                required
              />
            </label>
            <label>
              Plan tier
              <select
                value={createPlan}
                onChange={(e) =>
                  setCreatePlan(
                    e.target.value as "FREE" | "PRO" | "ENTERPRISE",
                  )
                }
              >
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </label>
            <div className="platform-modal-actions">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="platform-btn platform-btn--primary"
                disabled={creating}
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
