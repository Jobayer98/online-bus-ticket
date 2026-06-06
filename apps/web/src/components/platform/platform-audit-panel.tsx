"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { platformApiGet } from "@/lib/platform-api-client";
import type { PlatformAuditLogDto } from "@repo/shared";

export function PlatformAuditPanel() {
  const [logs, setLogs] = useState<PlatformAuditLogDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("");
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
  }, [page, pageSize, actionFilter]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="cp-section">
      <h2 className="adm-page-title">Audit logs</h2>

      <div className="platform-filters">
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
        </select>
      </div>

      {error && <p className="sp-filter-error">{error}</p>}
      {loading && <p className="platform-loading">Loading audit logs…</p>}

      {!loading && !error && (
        <>
          <div className="platform-table-wrapper">
            <table className="platform-table">
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
                        <span className={`badge badge-blue`}>{log.action}</span>
                      </td>
                      <td>
                        {log.resourceType} · {log.resourceId.slice(0, 8)}…
                      </td>
                      <td>{log.ipAddress ?? "—"}</td>
                      <td>
                        {log.changes && (
                          <button
                            type="button"
                            className="platform-link"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
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
                          <pre className="platform-audit-detail">
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
              <p className="platform-empty">No audit entries yet.</p>
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
    </div>
  );
}
