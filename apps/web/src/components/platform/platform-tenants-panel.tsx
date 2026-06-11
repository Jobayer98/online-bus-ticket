"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  platformApiGet,
  platformApiPatch,
  platformApiPost,
  platformApiDownload,
} from "@/lib/platform-api-client";
import { formatMoneyBdt } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { PlatformTenantListItemDto } from "@repo/shared";
import {
  admPageTitleClass,
  badgeSelectClass,
  cpSectionClass,
  platformBulkBarClass,
  platformBtnClass,
  platformBtnPrimaryClass,
  platformEmptyClass,
  platformErrorClass,
  platformFiltersClass,
  platformLinkClass,
  platformLoadingClass,
  platformMetaClass,
  platformModalActionsClass,
  platformModalClass,
  platformModalOverlayClass,
  platformPaginationClass,
  platformPanelHeadClass,
  platformSearchClass,
  platformTableClass,
  platformTableRowClickClass,
  platformTableWrapClass,
} from "./platform-styles";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceBody, setAnnounceBody] = useState("");
  const [announceType, setAnnounceType] = useState<
    "MAINTENANCE" | "FEATURE" | "POLICY"
  >("MAINTENANCE");
  const [bulkBusy, setBulkBusy] = useState(false);
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
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const slug = createSlug || slugFromName(createName);
    if (!createName.trim() || slug.length < 2) {
      toast.error("Enter a valid company name and slug.");
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
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === tenants.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tenants.map((t) => t.id)));
    }
  }

  async function exportCsv() {
    setBulkBusy(true);
    try {
      const ids = [...selected];
      const qs =
        ids.length > 0
          ? `?tenantIds=${encodeURIComponent(ids.join(","))}`
          : "";
      await platformApiDownload(`/platform/tenants/export${qs}`, "platform-tenants.csv");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkSuspend() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirm(`Suspend ${ids.length} tenant(s)?`)) return;
    setBulkBusy(true);
    try {
      await platformApiPost("/platform/tenants/bulk-suspend", { tenantIds: ids });
      setSelected(new Set());
      await fetchTenants();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk suspend failed");
    } finally {
      setBulkBusy(false);
    }
  }

  async function sendAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    const ids = [...selected];
    setBulkBusy(true);
    try {
      await platformApiPost("/platform/announcements", {
        title: announceTitle.trim(),
        body: announceBody.trim(),
        type: announceType,
        sendToAll: ids.length === 0,
        tenantIds: ids.length > 0 ? ids : undefined,
      });
      setShowAnnounce(false);
      setAnnounceTitle("");
      setAnnounceBody("");
      toast.success("Announcement sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div className={cpSectionClass}>
      <div className={platformPanelHeadClass}>
        <h2 className={admPageTitleClass}>Tenant management</h2>
        <button
          type="button"
          className={platformBtnPrimaryClass}
          onClick={() => setShowCreate(true)}
        >
          + Create tenant
        </button>
      </div>

      <div className={platformFiltersClass}>
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
          className={platformSearchClass}
        />
      </div>

      {loading && <p className={platformLoadingClass}>Loading tenants…</p>}
      {error && <div className={platformErrorClass}>{error}</div>}

      {!loading && !error && (
        <>
          {selected.size > 0 && (
            <div className={platformBulkBarClass}>
              <span>{selected.size} selected</span>
              <button type="button" disabled={bulkBusy} onClick={() => setShowAnnounce(true)}>
                Send announcement
              </button>
              <button type="button" disabled={bulkBusy} onClick={() => void exportCsv()}>
                Export CSV
              </button>
              <button type="button" disabled={bulkBusy} onClick={() => void bulkSuspend()}>
                Suspend
              </button>
            </div>
          )}

          <div className={platformTableWrapClass}>
            <table className={platformTableClass}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={tenants.length > 0 && selected.size === tenants.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all tenants"
                    />
                  </th>
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
                    className={platformTableRowClickClass}
                    onClick={() => router.push(`/platform/tenants/${t.id}`)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        aria-label={`Select ${t.name}`}
                      />
                    </td>
                    <td>
                      <strong>{t.name}</strong>
                    </td>
                    <td>
                      <code>{t.subdomainPrefix}</code>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={badgeSelectClass(PLAN_COLORS[t.planTier])}
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
                        className={badgeSelectClass(STATUS_COLORS[t.planStatus])}
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
                      <Link href={`/platform/tenants/${t.id}`} className={platformLinkClass}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tenants.length === 0 && (
              <p className={platformEmptyClass}>No tenants match your filters.</p>
            )}
          </div>

          <div className={platformPaginationClass}>
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

      {showAnnounce && (
        <div
          className={platformModalOverlayClass}
          onClick={() => !bulkBusy && setShowAnnounce(false)}
          role="presentation"
        >
          <form
            className={platformModalClass}
            onSubmit={sendAnnouncement}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Send announcement</h3>
            <p className={platformMetaClass}>
              {selected.size > 0
                ? `To ${selected.size} selected tenant(s)`
                : "To all tenants"}
            </p>
            <label>
              Title
              <input
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Type
              <select
                value={announceType}
                onChange={(e) =>
                  setAnnounceType(
                    e.target.value as "MAINTENANCE" | "FEATURE" | "POLICY",
                  )
                }
              >
                <option value="MAINTENANCE">Maintenance</option>
                <option value="FEATURE">Feature</option>
                <option value="POLICY">Policy</option>
              </select>
            </label>
            <label>
              Message
              <textarea
                value={announceBody}
                onChange={(e) => setAnnounceBody(e.target.value)}
                rows={4}
                required
              />
            </label>
            <div className={platformModalActionsClass}>
              <button type="button" className={platformBtnClass} disabled={bulkBusy} onClick={() => setShowAnnounce(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className={platformBtnPrimaryClass}
                disabled={bulkBusy}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {showCreate && (
        <div
          className={platformModalOverlayClass}
          onClick={() => !creating && setShowCreate(false)}
          role="presentation"
        >
          <form
            className={platformModalClass}
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
            <div className={platformModalActionsClass}>
              <button
                type="button"
                className={platformBtnClass}
                onClick={() => setShowCreate(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={platformBtnPrimaryClass}
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
