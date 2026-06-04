"use client";

import { useCallback, useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  PAYMENT_METHODS,
  type PaymentMethodId,
} from "./sslcommerz-payment-strip";

type GatewayPhase = "select" | "processing" | "failed";

type Props = {
  amountMinor: number;
  merchantName?: string;
  orderLabel?: string;
  disabled?: boolean;
  onPay: (methodId: PaymentMethodId) => Promise<void>;
  onCancel: () => void;
};

function formatBdt(minor: number): string {
  return `৳ ${(minor / 100).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function SslCommerzMockGateway({
  amountMinor,
  merchantName = "Your bus operator",
  orderLabel = "Bus ticket booking",
  disabled = false,
  onPay,
  onCancel,
}: Props) {
  const [selected, setSelected] = useState<PaymentMethodId | null>(null);
  const [phase, setPhase] = useState<GatewayPhase>("select");
  const [error, setError] = useState("");

  const selectedMeta = PAYMENT_METHODS.find((m) => m.id === selected);
  useGlobalLoading(phase === "processing");

  const handlePay = useCallback(async () => {
    if (!selected || disabled || phase === "processing") return;
    setError("");
    setPhase("processing");
    try {
      await new Promise((r) => setTimeout(r, 900));
      await new Promise((r) => setTimeout(r, 700));
      await onPay(selected);
    } catch (e) {
      setPhase("select");
      setError(e instanceof Error ? e.message : "Payment could not be completed");
    }
  }, [selected, disabled, phase, onPay, selectedMeta?.label]);

  return (
    <div className="ssl-gateway" role="dialog" aria-labelledby="ssl-gateway-title">
      <header className="ssl-gateway__top">
        <div className="ssl-gateway__brand">
          <span className="ssl-gateway__logo" aria-hidden>
            SSL
          </span>
          <span className="ssl-gateway__logo-sub">Commerz</span>
        </div>
        <span className="ssl-gateway__secure">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
          </svg>
          256-bit SSL
        </span>
      </header>

      <div className="ssl-gateway__merchant">
        <p className="ssl-gateway__merchant-label">Merchant</p>
        <p className="ssl-gateway__merchant-name">{merchantName}</p>
      </div>

      <div className="ssl-gateway__amount-block">
        <p className="ssl-gateway__amount-label" id="ssl-gateway-title">
          Total payable
        </p>
        <p className="ssl-gateway__amount">{formatBdt(amountMinor)}</p>
        <p className="ssl-gateway__order">{orderLabel}</p>
      </div>

      {phase !== "processing" && (
        <>
          <p className="ssl-gateway__choose">Select a payment option</p>
          <ul className="ssl-gateway__methods" role="listbox" aria-label="Payment methods">
            {PAYMENT_METHODS.map((m) => {
              const isSelected = selected === m.id;
              return (
                <li key={m.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`ssl-gateway__method${isSelected ? " is-selected" : ""}`}
                    disabled={disabled}
                    onClick={() => setSelected(m.id)}
                  >
                    <span
                      className="ssl-gateway__method-icon"
                      style={
                        {
                          background: m.bg,
                          color: m.fg,
                        } as React.CSSProperties
                      }
                    >
                      {m.label.charAt(0)}
                    </span>
                    <span className="ssl-gateway__method-label">{m.label}</span>
                    <span className="ssl-gateway__method-check" aria-hidden>
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {error && (
            <p className="ssl-gateway__error" role="alert">
              {error}
            </p>
          )}

          <div className="ssl-gateway__actions">
            <button
              type="button"
              className="ssl-gateway__btn ssl-gateway__btn--cancel"
              disabled={disabled}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ssl-gateway__btn ssl-gateway__btn--pay"
              disabled={disabled || !selected}
              onClick={() => void handlePay()}
            >
              Pay {formatBdt(amountMinor)}
            </button>
          </div>
        </>
      )}

      <footer className="ssl-gateway__foot">
        <p>Verified Payment Gateway</p>
        <div className="ssl-gateway__trust-badges" aria-hidden>
          <span>PCI DSS</span>
          <span>ISO 27001</span>
          <span>Verified by Visa</span>
        </div>
      </footer>
    </div>
  );
}
