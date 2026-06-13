"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { platformApiGet, platformApiDownload } from "@/lib/platform-api-client";
import { toast } from "@/lib/toast";
import type { PlatformAuditLogDto } from "@repo/shared";
import {
  admPageTitleClass,
  badgeClass,
  cpSectionClass,
  filterErrorClass,
  platformAuditDetailClass,
  platformBtnClass,
  platformEmptyClass,
  platformFiltersClass,
  platformLinkClass,
  platformLoadingClass,
  platformPaginationClass,
  platformPanelHeadClass,
  platformTableClass,
  platformTableWrapClass,
} from "./platform-styles";

export function PlatformAuditPanel() {
  const [logs, setLogs] = useState<PlatformAuditLogDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useGlobalLoading(loading && logs.length === 0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (actionFilter) params.set("action", actionFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const json = await platformApiGet<PlatformAuditLogDto[]>(
        `/platform/audit-logs?${params.toString()}`,
      );
      setLogs(json.data);
      setTotal(json.meta?.total ?? json.data.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter, fromDate, toDate]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function exportCsv() {
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const qs = params.toString();
    try {
      await platformApiDownload(
        `/platform/audit-logs/export${qs ? `?${qs}` : ""}`,
        "platform-audit-logs.csv",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }

  return (
    <div className={cpSectionClass}>
      <div className={platformPanelHeadClass}>
        <h2 className={admPageTitleClass}>Audit logs</h2>
        <button type="button" className={platformBtnClass} onClick={() => void exportCsv()}>
          Export CSV
        </button>
      </div>

      <div className={platformFiltersClass}>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="SUSPEND">Suspend</option>
          <option value="ACTIVATE">Activate</option>
          <option value="EXPORT">Export</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
          aria-label="From date"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
          aria-label="To date"
        />
      </div>

      {error && <p className={filterErrorClass}>{error}</p>}
      {loading && <p className={platformLoadingClass}>Loading audit logs…</p>}

      {!loading && !error && (
        <>
          <div className={platformTableWrapClass}>
            <table className={platformTableClass}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>IP</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <tr>
                      <td>
                        {new Date(log.createdAt).toLocaleString("en-GB", {
                          timeZone: "Asia/Dhaka",
                        })}
                      </td>
                      <td>{log.actorName}</td>
                      <td>
                        <span className={badgeClass("badge-blue")}>{log.action}</span>
                      </td>
                      <td>
                        {log.resourceType} · {log.resourceId.slice(0, 8)}…
                      </td>
                      <td>{log.ipAddress ?? "—"}</td>
                      <td>
                        {log.changes && (
                          <button
                            type="button"
                            className={`${platformLinkClass} cursor-pointer border-0 bg-transparent p-0`}
                            onClick={() =>
                              setExpandedId(expandedId === log.id ? null : log.id)
                            }
                          >
                            {expandedId === log.id ? "Hide" : "Details"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id && log.changes && (
                      <tr>
                        <td colSpan={6}>
                          <pre className={platformAuditDetailClass}>
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p className={platformEmptyClass}>No audit entries yet.</p>
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
    </div>
  );
}
