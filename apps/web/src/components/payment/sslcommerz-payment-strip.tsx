import type { CSSProperties } from "react";
import Image from "next/image";

type Props = {
  compact?: boolean;
};

/** Checkout preview — SSLCommerz-branded strip (online only; no cash). */
export function SslCommerzPaymentStrip({ compact = false }: Props) {
  return (
    <div
      className={`ssl-strip${compact ? " ssl-strip--compact" : ""}`}
      role="region"
      aria-label="Secure online payment via SSLCommerz"
    >
      <div className="ssl-strip__header">
        <span className="ssl-strip__badge" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14.59l-3.3-3.3 1.41-1.42L11 12.17l4.89-4.88 1.41 1.42L11 15.59z" />
          </svg>
        </span>
        <span className="ssl-strip__title">Secured by SSLCommerz</span>
      </div>
      <p className="ssl-strip__note">
        Pay online with bKash, Nagad, cards, and mobile banking. Cash payment is
        not available for online bookings.
      </p>
      <div className="ssl-strip__methods" aria-hidden>
        {PAYMENT_METHODS.map((m) => (
          <span
            key={m.id}
            className="ssl-strip__chip"
            style={{ "--chip-bg": m.bg, "--chip-fg": m.fg } as CSSProperties}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="ssl-strip__footer-img">
        <Image
          src="/images/home/ssl-commerz-inline.png"
          alt="Visa, Mastercard, bKash, Nagad, and other methods verified by SSLCommerz"
          width={1100}
          height={120}
          className="ssl-strip__inline-img"
          priority={!compact}
        />
      </div>
    </div>
  );
}

export const PAYMENT_METHODS = [
  { id: "bkash", label: "bKash", bg: "#e2136e", fg: "#fff" },
  { id: "nagad", label: "Nagad", bg: "#f6921e", fg: "#fff" },
  { id: "rocket", label: "Rocket", bg: "#8b2f8b", fg: "#fff" },
  { id: "upay", label: "Upay", bg: "#0066b3", fg: "#fff" },
  { id: "visa", label: "Visa", bg: "#1a1f71", fg: "#fff" },
  { id: "mastercard", label: "Mastercard", bg: "#eb001b", fg: "#fff" },
  { id: "amex", label: "Amex", bg: "#006fcf", fg: "#fff" },
  { id: "dbbl", label: "DBBL", bg: "#003366", fg: "#fff" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
