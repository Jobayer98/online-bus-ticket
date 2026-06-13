"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Building2,
  CreditCard,
  Landmark,
  Plus,
  Settings2,
  Trash2,
  Wallet,
} from "lucide-react";
import type {
  PaymentProviderCode,
  TenantPaymentProviderDto,
} from "@repo/shared";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import { formatMoneyBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  AdminTable,
  AdminTableRow,
  admTableCell,
  admTableHeadCell,
  admTableHeadRow,
} from "./admin-table";

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

function providerStatus(provider: TenantPaymentProviderDto) {
  if (!provider.systemEnabled) {
    return { label: "Unavailable", variant: "secondary" as const };
  }
  if (provider.configured && provider.isActive) {
    return { label: "Active", variant: "success" as const };
  }
  if (provider.configured) {
    return { label: "Inactive", variant: "warning" as const };
  }
  return { label: "Not configured", variant: "outline" as const };
}

function settlementLabel(route: TenantPaymentProviderDto["settlementRoute"]) {
  if (route === "TENANT_DIRECT") return "Direct to you";
  if (route === "SYSTEM") return "Platform wallet";
  return "—";
}

function withdrawalStatusVariant(
  status: string,
): "success" | "warning" | "secondary" | "destructive" {
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED" || normalized === "APPROVED") return "success";
  if (normalized === "PENDING" || normalized === "PROCESSING") return "warning";
  if (normalized === "REJECTED" || normalized === "FAILED") return "destructive";
  return "secondary";
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 max-w-sm rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function AdminPaymentsPanel() {
  const [providers, setProviders] = useState<TenantPaymentProviderDto[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useGlobalLoading(loading);

  async function load() {
    setError("");
    try {
      const [prov, wal, accts, wdr] = await Promise.all([
        apiGet<{ providers: TenantPaymentProviderDto[] }>("/admin/payment-providers"),
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProvider(code: PaymentProviderCode) {
    setSaving(true);
    try {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save provider");
    } finally {
      setSaving(false);
    }
  }

  async function removeProvider(code: PaymentProviderCode) {
    if (!confirm(`Remove ${code} credentials?`)) return;
    try {
      await apiDelete(`/admin/payment-providers/${code}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove provider");
    }
  }

  async function addBankAccount(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost("/admin/bank-accounts", bankForm);
      setBankForm({ bankName: "", accountName: "", accountNumber: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add bank account");
    } finally {
      setSaving(false);
    }
  }

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const amountMinor = Math.round(parseFloat(withdrawAmount) * 100);
      await apiPost("/admin/withdrawals", {
        bankAccountId: withdrawAccountId,
        amountMinor,
      });
      setWithdrawAmount("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to request withdrawal");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PaymentsSkeleton />;

  const canWithdraw =
    accounts.length > 0 && wallet !== null && wallet.wallet.balanceMinor > 0;

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {wallet ? (
        <Card className="max-w-md overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Wallet balance</p>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatMoneyBdt(wallet.wallet.balanceMinor)}
                </p>
                <p className="text-xs text-slate-500">
                  System-collected booking payments credited to your wallet
                </p>
              </div>
              <div className="rounded-xl bg-[var(--primary-muted)] p-2.5 text-[var(--primary)]">
                <Wallet className="size-5" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4 text-slate-500" aria-hidden />
            Payment gateways
          </CardTitle>
          <CardDescription>
            Configure bKash or SSLCommerz to receive payments directly. If none are active,
            passengers pay via platform gateways and funds credit your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <AdminTable minWidth="640px">
              <thead>
                <tr className={admTableHeadRow}>
                  <th className={admTableHeadCell}>Provider</th>
                  <th className={admTableHeadCell}>Status</th>
                  <th className={admTableHeadCell}>Settlement</th>
                  <th className={cn(admTableHeadCell, "text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => {
                  const status = providerStatus(p);
                  return (
                    <AdminTableRow key={p.code}>
                      <td className={cn(admTableCell, "font-medium")}>
                        {p.displayName}
                      </td>
                      <td className={admTableCell}>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className={admTableCell}>
                        <span className="text-[var(--muted)]">
                          {settlementLabel(p.settlementRoute)}
                        </span>
                      </td>
                      <td className={cn(admTableCell, "text-right")}>
                        {p.systemEnabled ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditing(p.code);
                                setForm((f) => ({
                                  ...f,
                                  isActive: p.isActive,
                                  sandboxMode: p.sandboxMode,
                                }));
                              }}
                            >
                              <Settings2 className="size-3.5" />
                              Configure
                            </Button>
                            {p.configured ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                                onClick={() => void removeProvider(p.code)}
                              >
                                <Trash2 className="size-3.5" />
                                Remove
                              </Button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[var(--muted)]">—</span>
                        )}
                      </td>
                    </AdminTableRow>
                  );
                })}
              </tbody>
          </AdminTable>

          {editing ? (
            <form
              className="rounded-lg border border-[var(--border)] bg-slate-50/50 p-4 md:p-5"
              onSubmit={(e) => {
                e.preventDefault();
                void saveProvider(editing);
              }}
            >
              <h4 className="mb-4 text-sm font-semibold text-slate-900">
                Configure {editing}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {editing === "SSLCOMMERZ" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="store-id">Store ID</Label>
                      <Input
                        id="store-id"
                        value={form.storeId}
                        onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-password">Store password</Label>
                      <Input
                        id="store-password"
                        type="password"
                        value={form.storePassword}
                        onChange={(e) =>
                          setForm({ ...form, storePassword: e.target.value })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="app-key">App key</Label>
                      <Input
                        id="app-key"
                        value={form.appKey}
                        onChange={(e) => setForm({ ...form, appKey: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-secret">App secret</Label>
                      <Input
                        id="app-secret"
                        type="password"
                        value={form.appSecret}
                        onChange={(e) => setForm({ ...form, appSecret: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[var(--border)]"
                    checked={form.sandboxMode}
                    onChange={(e) => setForm({ ...form, sandboxMode: e.target.checked })}
                  />
                  Sandbox mode
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-[var(--border)]"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  Save configuration
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="size-4 text-slate-500" aria-hidden />
            Bank accounts
          </CardTitle>
          <CardDescription>Add payout accounts for withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <form onSubmit={addBankAccount}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank name</Label>
                <Input
                  id="bank-name"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account name</Label>
                <Input
                  id="account-name"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account number</Label>
                <Input
                  id="account-number"
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                  <Plus className="size-4" />
                  Add account
                </Button>
              </div>
            </div>
          </form>

          <Separator />

          {accounts.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No bank accounts yet. Add one above to enable withdrawals.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div className="rounded-lg bg-white p-2 text-slate-500 shadow-sm">
                    <Building2 className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{a.bankName}</p>
                    <p className="text-sm text-slate-500">
                      {a.accountName} · {a.accountNumberMasked}
                    </p>
                  </div>
                  {a.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="size-4 text-slate-500" aria-hidden />
            Withdrawals
          </CardTitle>
          <CardDescription>
            Request a payout from your wallet balance to a linked bank account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {canWithdraw ? (
            <form onSubmit={requestWithdrawal}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-account">Bank account</Label>
                  <select
                    id="withdraw-account"
                    className="flex h-9 w-full rounded-md border border-[var(--border)] bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1"
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (BDT)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={saving}>
                    Request withdrawal
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
              {accounts.length === 0
                ? "Add a bank account before requesting a withdrawal."
                : "Your wallet balance is empty. Withdrawals become available once funds are credited."}
            </div>
          )}

          {withdrawals.length > 0 ? (
            <>
              <Separator />
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {withdrawals.map((w) => (
                  <li
                    key={w.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatMoneyBdt(w.amountMinor)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(w.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant={withdrawalStatusVariant(w.status)}>{w.status}</Badge>
                  </li>
                ))}
              </ul>
            </>
          ) : canWithdraw ? (
            <p className="text-center text-sm text-slate-500">No withdrawal requests yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
