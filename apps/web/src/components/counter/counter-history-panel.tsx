"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatMoneyBdt } from "@/lib/format";
import {
  cpBadgeBase,
  cpBadgeCancel,
  cpBadgeChange,
  cpBadgeRefund,
  cpBadgeSell,
  cpHistoryBar,
  cpSection,
  cpSectionTitle,
  cpTable,
  cpTableCell,
  cpTableHead,
  cpTableRow,
  cpTableWrap,
} from "./counter-tw";
import { spFilterError, spFilterSearch } from "@/components/search/search-tw";

type CounterTxn = {
  id: string;
  type: "SELL" | "CHANGE" | "REFUND" | "CANCEL";
  amount: number;
  note: string | null;
  createdAt: string;
  bookingId: string;
  booking: {
    id: string;
    passengerName: string;
    passengerPhone: string;
    status: string;
    totalAmount: number;
    ticket: { passengerNumber: string } | null;
    payment: { method: "CASH" | "ONLINE"; status: string } | null;
  };
};

function formatPaymentPaid(payment: CounterTxn["booking"]["payment"]) {
  if (!payment) return "—";
  const method = payment.method === "CASH" ? "Cash" : "Online";
  const statusLabel =
    payment.status === "COMPLETED"
      ? "Paid"
      : payment.status === "REFUNDED"
        ? "Refunded"
        : payment.status === "PENDING"
          ? "Pending"
          : payment.status === "FAILED"
            ? "Failed"
            : payment.status;
  return `${statusLabel} (${method})`;
}

function badgeClass(type: CounterTxn["type"]) {
  if (type === "SELL") return `${cpBadgeBase} ${cpBadgeSell}`;
  if (type === "REFUND") return `${cpBadgeBase} ${cpBadgeRefund}`;
  if (type === "CHANGE") return `${cpBadgeBase} ${cpBadgeChange}`;
  return `${cpBadgeBase} ${cpBadgeCancel}`;
}

type Props = {
  refreshKey?: number;
};

export function CounterHistoryPanel({ refreshKey = 0 }: Props) {
  const [txns, setTxns] = useState<CounterTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useGlobalLoading(loading);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiGet<CounterTxn[]>("/counter/transactions/today")
      .then((r) => setTxns(r.data))
      .catch((e) => {
        setTxns([]);
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const sellTotal = txns
    .filter((t) => t.type === "SELL")
    .reduce((s, t) => s + t.amount, 0);
  const refundTotal = txns
    .filter((t) => t.type === "REFUND")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className={cpSection}>
      <h2 className={cpSectionTitle}>TODAY&apos;S COUNTER TRANSACTIONS</h2>

      <div className={cpHistoryBar}>
        <button
          type="button"
          className={spFilterSearch}
          style={{ padding: "0.4rem 0.85rem" }}
          onClick={load}
        >
          Refresh
        </button>
        <span>
          Sales total: <strong>{formatMoneyBdt(sellTotal)}</strong>
        </span>
        {refundTotal > 0 && (
          <span>
            Refunds: <strong>{formatMoneyBdt(refundTotal)}</strong>
          </span>
        )}
        <span>{txns.length} transaction(s)</span>
      </div>

      {error && <p className={spFilterError}>{error}</p>}

      {!loading && !error && (
        <div className={cpTableWrap}>
          <table className={cpTable}>
            <thead>
              <tr>
                <th className={cpTableHead}>Time</th>
                <th className={cpTableHead}>Type</th>
                <th className={cpTableHead}>Passenger #</th>
                <th className={cpTableHead}>Name</th>
                <th className={cpTableHead}>Phone</th>
                <th className={cpTableHead}>Payment</th>
                <th className={cpTableHead}>Amount</th>
                <th className={cpTableHead}>Note</th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`${cpTableCell} text-center text-[#666]`}>
                    No transactions yet today
                  </td>
                </tr>
              ) : (
                txns.map((t) => (
                  <tr key={t.id} className={cpTableRow}>
                    <td className={cpTableCell}>
                      {new Date(t.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Dhaka",
                      })}
                    </td>
                    <td className={cpTableCell}>
                      <span className={badgeClass(t.type)}>{t.type}</span>
                    </td>
                    <td className={cpTableCell}>{t.booking.ticket?.passengerNumber ?? "—"}</td>
                    <td className={cpTableCell}>{t.booking.passengerName}</td>
                    <td className={cpTableCell}>{t.booking.passengerPhone}</td>
                    <td className={cpTableCell}>{formatPaymentPaid(t.booking.payment)}</td>
                    <td className={cpTableCell}>
                      {t.amount >= 0
                        ? formatMoneyBdt(t.amount)
                        : `−${formatMoneyBdt(-t.amount)}`}
                    </td>
                    <td className={cpTableCell}>{t.note ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
