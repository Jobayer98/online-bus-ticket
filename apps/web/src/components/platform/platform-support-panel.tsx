"use client";

import { useCallback, useEffect, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  platformApiGet,
  platformApiPatch,
  platformApiPost,
} from "@/lib/platform-api-client";
import type {
  SupportTicketDetailDto,
  SupportTicketDto,
} from "@repo/shared";

const PRIORITY_CLASS: Record<string, string> = {
  LOW: "badge-grey",
  MEDIUM: "badge-yellow",
  HIGH: "badge-red",
};

const STATUS_CLASS: Record<string, string> = {
  OPEN: "badge-blue",
  IN_PROGRESS: "badge-yellow",
  RESOLVED: "badge-green",
  CLOSED: "badge-grey",
};

export function PlatformSupportPanel() {
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [selected, setSelected] = useState<SupportTicketDetailDto | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useGlobalLoading(loading && tickets.length === 0);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const json = await platformApiGet<SupportTicketDto[]>(
        `/platform/support/tickets?${params.toString()}`,
      );
      setTickets(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  async function openTicket(id: string) {
    setBusy(true);
    try {
      const json = await platformApiGet<SupportTicketDetailDto>(
        `/platform/support/tickets/${id}`,
      );
      setSelected(json.data);
      setReply("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load ticket");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setBusy(true);
    try {
      const json = await platformApiPost<SupportTicketDetailDto>(
        `/platform/support/tickets/${selected.id}/reply`,
        { body: reply.trim() },
      );
      setSelected(json.data);
      setReply("");
      await loadTickets();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Reply failed");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(status: SupportTicketDto["status"]) {
    if (!selected) return;
    setBusy(true);
    try {
      const json = await platformApiPatch<SupportTicketDetailDto>(
        `/platform/support/tickets/${selected.id}`,
        { status },
      );
      setSelected(json.data);
      await loadTickets();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-section">
      <h2 className="adm-page-title">Support tickets</h2>

      <div className="platform-filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {error && <p className="sp-filter-error">{error}</p>}
      {loading && <p className="platform-loading">Loading tickets…</p>}

      {!loading && (
        <div className="platform-table-wrapper">
          <table className="platform-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="platform-table-row-click"
                  onClick={() => void openTicket(t.id)}
                >
                  <td>{t.tenantName}</td>
                  <td>{t.subject}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${PRIORITY_CLASS[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    {new Date(t.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>{t.messageCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && (
            <p className="platform-empty">No support tickets yet.</p>
          )}
        </div>
      )}

      {selected && (
        <div
          className="platform-modal-overlay"
          onClick={() => !busy && setSelected(null)}
          role="presentation"
        >
          <div
            className="platform-modal platform-modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selected.subject}</h3>
            <p className="platform-meta">
              {selected.tenantName} · {selected.createdByName}
            </p>
            <div className="platform-ticket-thread">
              {selected.messages.map((m) => (
                <div key={m.id} className="platform-ticket-message">
                  <strong>
                    {m.authorName} ({m.authorType})
                  </strong>
                  <span>
                    {new Date(m.createdAt).toLocaleString("en-GB", {
                      timeZone: "Asia/Dhaka",
                    })}
                  </span>
                  <p>{m.body}</p>
                </div>
              ))}
            </div>
            <label>
              Reply
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
              />
            </label>
            <div className="platform-modal-actions">
              <button type="button" disabled={busy} onClick={() => setSelected(null)}>
                Close
              </button>
              {selected.status !== "CLOSED" && (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => updateStatus("RESOLVED")}
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => updateStatus("CLOSED")}
                  >
                    Close ticket
                  </button>
                </>
              )}
              <button
                type="button"
                className="platform-btn platform-btn--primary"
                disabled={busy || !reply.trim()}
                onClick={() => void sendReply()}
              >
                Send reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
