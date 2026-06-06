"use client";

import { useEffect, useState } from "react";
import {
  platformApiGet,
  platformApiPut,
  platformApiPost,
} from "@/lib/platform-api-client";
import type {
  SystemPaymentProviderDto,
  PaymentProviderCode,
} from "@repo/shared";

export function PlatformPaymentProvidersPanel() {
  const [providers, setProviders] = useState<SystemPaymentProviderDto[]>([]);
  const [editing, setEditing] = useState<PaymentProviderCode | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    storeId: "",
    storePassword: "",
    appKey: "",
    appSecret: "",
    username: "",
    password: "",
    sandboxMode: true,
    isEnabled: false,
  });

  async function load() {
    setError("");
    try {
      const res = await platformApiGet<{ providers: SystemPaymentProviderDto[] }>(
        "/platform/payment-providers",
      );
      setProviders(res.data.providers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load providers");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(code: PaymentProviderCode) {
    const credentials =
      code === "BKASH"
        ? {
            appKey: form.appKey,
            appSecret: form.appSecret,
            username: form.username,
            password: form.password,
            sandboxMode: form.sandboxMode,
          }
        : {
            storeId: form.storeId,
            storePassword: form.storePassword,
            sandboxMode: form.sandboxMode,
          };
    await platformApiPut(`/platform/payment-providers/${code}`, {
      isEnabled: form.isEnabled,
      sandboxMode: form.sandboxMode,
      credentials,
    });
    setEditing(null);
    await load();
  }

  return (
    <div className="cp-section">
      <h3>System payment providers</h3>
      {error && <p className="sp-filter-error">{error}</p>}
      <table className="platform-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Enabled</th>
            <th>Configured</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id}>
              <td>{p.displayName}</td>
              <td>{p.isEnabled ? "Yes" : "No"}</td>
              <td>{p.configured ? p.credentialHint ?? "Yes" : "No"}</td>
              <td>
                <button
                  type="button"
                  className="platform-btn platform-btn--sm"
                  onClick={() => {
                    setEditing(p.code);
                    setForm((f) => ({
                      ...f,
                      isEnabled: p.isEnabled,
                      sandboxMode: p.sandboxMode,
                    }));
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <form
          className="platform-form"
          onSubmit={(e) => {
            e.preventDefault();
            void save(editing);
          }}
        >
          <h4>Edit {editing}</h4>
          {editing === "SSLCOMMERZ" ? (
            <>
              <input
                placeholder="Store ID"
                value={form.storeId}
                onChange={(e) => setForm({ ...form, storeId: e.target.value })}
              />
              <input
                type="password"
                placeholder="Store password"
                value={form.storePassword}
                onChange={(e) =>
                  setForm({ ...form, storePassword: e.target.value })
                }
              />
            </>
          ) : (
            <>
              <input
                placeholder="App key"
                value={form.appKey}
                onChange={(e) => setForm({ ...form, appKey: e.target.value })}
              />
              <input
                type="password"
                placeholder="App secret"
                value={form.appSecret}
                onChange={(e) =>
                  setForm({ ...form, appSecret: e.target.value })
                }
              />
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </>
          )}
          <label>
            <input
              type="checkbox"
              checked={form.sandboxMode}
              onChange={(e) =>
                setForm({ ...form, sandboxMode: e.target.checked })
              }
            />
            Sandbox
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) =>
                setForm({ ...form, isEnabled: e.target.checked })
              }
            />
            Enabled for tenants
          </label>
          <button type="submit" className="platform-btn platform-btn--primary">
            Save
          </button>
          <button
            type="button"
            className="platform-btn"
            onClick={() => setEditing(null)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export function PlatformWithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState<
    Array<{
      id: string;
      tenantName: string;
      amountMinor: number;
      status: string;
      bankName: string;
      accountNumberMasked: string;
    }>
  >([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await platformApiGet<{
        withdrawals: Array<{
          id: string;
          tenantName: string;
          amountMinor: number;
          status: string;
          bankName: string;
          accountNumberMasked: string;
        }>;
      }>("/platform/withdrawals?status=PENDING");
      setWithdrawals(res.data.withdrawals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(id: string) {
    await platformApiPost(`/platform/withdrawals/${id}/approve`, {});
    await load();
  }

  async function reject(id: string) {
    const note = prompt("Rejection reason (optional)") ?? undefined;
    await platformApiPost(`/platform/withdrawals/${id}/reject`, {
      reviewNote: note,
    });
    await load();
  }

  async function markPaid(id: string) {
    await platformApiPost(`/platform/withdrawals/${id}/mark-paid`, {});
    await load();
  }

  return (
    <div className="cp-section">
      <h3>Tenant withdrawal requests</h3>
      {error && <p className="sp-filter-error">{error}</p>}
      <table className="platform-table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Amount</th>
            <th>Bank</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id}>
              <td>{w.tenantName}</td>
              <td>{(w.amountMinor / 100).toFixed(2)} BDT</td>
              <td>
                {w.bankName} {w.accountNumberMasked}
              </td>
              <td>{w.status}</td>
              <td>
                {w.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      className="platform-btn platform-btn--sm"
                      onClick={() => void approve(w.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="platform-btn platform-btn--sm"
                      onClick={() => void reject(w.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {w.status === "APPROVED" && (
                  <button
                    type="button"
                    className="platform-btn platform-btn--sm"
                    onClick={() => void markPaid(w.id)}
                  >
                    Mark paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
