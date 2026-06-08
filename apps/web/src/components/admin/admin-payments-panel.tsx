"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { formatMoneyBdt } from "@/lib/format";
import type {
  TenantPaymentProviderDto,
  PaymentProviderCode,
} from "@repo/shared";
import {
  admBtn,
  admBtnDanger,
  admBtnPrimary,
  admBtnSm,
  admCheckbox,
  admForm,
  admFormActions,
  admFormCardAlt,
  admFormFieldInput,
  admFormFieldLabel,
  admFormInline,
  admHelp,
  admKpiCard,
  admKpiCardLabel,
  admKpiCardSpan,
  admKpiCardStrong,
  admKpiGrid,
  admPageTitle,
  admSection,
} from "./admin-tw";
import { spFilterError } from "@/components/search/search-tw";

type WalletSummary = {
  wallet: { balanceMinor: number };
  entries: Array<{
    id: string;
    type: string;
    amountMinor: number;
    balanceAfterMinor: number;
    referenceType: string;
    createdAt: string;
  }>;
};

type BankAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumberMasked: string;
  isDefault: boolean;
};

type Withdrawal = {
  id: string;
  amountMinor: number;
  status: string;
  createdAt: string;
};

export function AdminPaymentsPanel() {
  const [providers, setProviders] = useState<TenantPaymentProviderDto[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<PaymentProviderCode | null>(null);
  const [form, setForm] = useState({
    storeId: "",
    storePassword: "",
    appKey: "",
    appSecret: "",
    username: "",
    password: "",
    sandboxMode: true,
    isActive: false,
  });
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAccountId, setWithdrawAccountId] = useState("");

  async function load() {
    setError("");
    try {
      const [prov, wal, accts, wdr] = await Promise.all([
        apiGet<{ providers: TenantPaymentProviderDto[] }>(
          "/admin/payment-providers",
        ),
        apiGet<WalletSummary>("/admin/wallet"),
        apiGet<{ accounts: BankAccount[] }>("/admin/bank-accounts"),
        apiGet<{ withdrawals: Withdrawal[] }>("/admin/withdrawals"),
      ]);
      setProviders(prov.data.providers);
      setWallet(wal.data);
      setAccounts(accts.data.accounts);
      setWithdrawals(wdr.data.withdrawals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProvider(code: PaymentProviderCode) {
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
    await apiPut(`/admin/payment-providers/${code}`, {
      isActive: form.isActive,
      sandboxMode: form.sandboxMode,
      credentials,
    });
    setEditing(null);
    await load();
  }

  async function removeProvider(code: PaymentProviderCode) {
    if (!confirm(`Remove ${code} credentials?`)) return;
    await apiDelete(`/admin/payment-providers/${code}`);
    await load();
  }

  async function addBankAccount(e: React.FormEvent) {
    e.preventDefault();
    await apiPost("/admin/bank-accounts", bankForm);
    setBankForm({ bankName: "", accountName: "", accountNumber: "" });
    await load();
  }

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(withdrawAmount) * 100);
    await apiPost("/admin/withdrawals", {
      bankAccountId: withdrawAccountId,
      amountMinor,
    });
    setWithdrawAmount("");
    await load();
  }

  return (
    <div className={admSection}>
      <h2 className={admPageTitle}>Payments & wallet</h2>
      {error && <p className={spFilterError}>{error}</p>}

      {wallet && (
        <div className={admKpiGrid} style={{ marginBottom: "1.5rem" }}>
          <div className={admKpiCard}>
            <label className={admKpiCardLabel}>Wallet balance</label>
            <strong className={admKpiCardStrong}>{formatMoneyBdt(wallet.wallet.balanceMinor)}</strong>
            <span className={admKpiCardSpan}>System-collected booking payments</span>
          </div>
        </div>
      )}

      <h3>Payment gateways</h3>
      <p className={admHelp}>
        Configure your own bKash or SSLCommerz to receive payments directly.
        If none are active, passengers pay via platform gateways and funds
        credit your wallet.
      </p>
      <div className="platform-table-wrapper">
        <table className="platform-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Status</th>
              <th>Route</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.code}>
                <td>{p.displayName}</td>
                <td>
                  {!p.systemEnabled
                    ? "Unavailable"
                    : p.configured && p.isActive
                      ? "Active"
                      : p.configured
                        ? "Configured (inactive)"
                        : "Not configured"}
                </td>
                <td>{p.settlementRoute ?? "—"}</td>
                <td>
                  {p.systemEnabled && (
                    <>
                      <button
                        type="button"
                        className={`${admBtn} ${admBtnSm}`}
                        onClick={() => {
                          setEditing(p.code);
                          setForm((f) => ({
                            ...f,
                            isActive: p.isActive,
                            sandboxMode: p.sandboxMode,
                          }));
                        }}
                      >
                        Configure
                      </button>
                      {p.configured && (
                        <button
                          type="button"
                          className={`${admBtn} ${admBtnSm} ${admBtnDanger}`}
                          onClick={() => void removeProvider(p.code)}
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <form
          className={`${admForm} ${admFormCardAlt}`}
          onSubmit={(e) => {
            e.preventDefault();
            void saveProvider(editing);
          }}
        >
          <h4>Configure {editing}</h4>
          {editing === "SSLCOMMERZ" ? (
            <>
              <label className={admFormFieldLabel}>
                Store ID
                <input
                  className={admFormFieldInput}
                  value={form.storeId}
                  onChange={(e) =>
                    setForm({ ...form, storeId: e.target.value })
                  }
                />
              </label>
              <label className={admFormFieldLabel}>
                Store password
                <input
                  type="password"
                  className={admFormFieldInput}
                  value={form.storePassword}
                  onChange={(e) =>
                    setForm({ ...form, storePassword: e.target.value })
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label className={admFormFieldLabel}>
                App key
                <input
                  className={admFormFieldInput}
                  value={form.appKey}
                  onChange={(e) => setForm({ ...form, appKey: e.target.value })}
                />
              </label>
              <label className={admFormFieldLabel}>
                App secret
                <input
                  type="password"
                  className={admFormFieldInput}
                  value={form.appSecret}
                  onChange={(e) =>
                    setForm({ ...form, appSecret: e.target.value })
                  }
                />
              </label>
              <label className={admFormFieldLabel}>
                Username
                <input
                  className={admFormFieldInput}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </label>
              <label className={admFormFieldLabel}>
                Password
                <input
                  type="password"
                  className={admFormFieldInput}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </label>
            </>
          )}
          <label className={admCheckbox}>
            <input
              type="checkbox"
              checked={form.sandboxMode}
              onChange={(e) =>
                setForm({ ...form, sandboxMode: e.target.checked })
              }
            />
            Sandbox mode
          </label>
          <label className={admCheckbox}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
            />
            Active
          </label>
          <div className={admFormActions}>
            <button type="submit" className={`${admBtn} ${admBtnPrimary}`}>
              Save
            </button>
            <button
              type="button"
              className={admBtn}
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3 style={{ marginTop: "2rem" }}>Bank accounts</h3>
      <form className={admFormInline} onSubmit={addBankAccount}>
        <input
          className={admFormFieldInput}
          placeholder="Bank name"
          value={bankForm.bankName}
          onChange={(e) =>
            setBankForm({ ...bankForm, bankName: e.target.value })
          }
          required
        />
        <input
          className={admFormFieldInput}
          placeholder="Account name"
          value={bankForm.accountName}
          onChange={(e) =>
            setBankForm({ ...bankForm, accountName: e.target.value })
          }
          required
        />
        <input
          className={admFormFieldInput}
          placeholder="Account number"
          value={bankForm.accountNumber}
          onChange={(e) =>
            setBankForm({ ...bankForm, accountNumber: e.target.value })
          }
          required
        />
        <button type="submit" className={`${admBtn} ${admBtnPrimary}`}>
          Add account
        </button>
      </form>
      <ul>
        {accounts.map((a) => (
          <li key={a.id}>
            {a.bankName} — {a.accountName} ({a.accountNumberMasked})
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "2rem" }}>Withdrawals</h3>
      {accounts.length > 0 && wallet && wallet.wallet.balanceMinor > 0 && (
        <form className={admFormInline} onSubmit={requestWithdrawal}>
          <select
            className={admFormFieldInput}
            value={withdrawAccountId}
            onChange={(e) => setWithdrawAccountId(e.target.value)}
            required
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.bankName} ({a.accountNumberMasked})
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            className={admFormFieldInput}
            placeholder="Amount (BDT)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            required
          />
          <button type="submit" className={`${admBtn} ${admBtnPrimary}`}>
            Request withdrawal
          </button>
        </form>
      )}
      <ul>
        {withdrawals.map((w) => (
          <li key={w.id}>
            {formatMoneyBdt(w.amountMinor)} — {w.status} (
            {new Date(w.createdAt).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
