"use client";

import { useState } from "react";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatMoneyBdt, formatTime12h } from "@/lib/format";
import type { TicketDto } from "@repo/shared";
import {
  cpManageBody,
  cpManageGrid,
  cpManageHeading,
  cpManageHint,
  cpManageSection,
  cpSection,
  cpSectionTitle,
} from "./counter-tw";
import {
  spBtnBack,
  spCheckoutActions,
  spCheckoutField,
  spCheckoutTable,
  spEmpty,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

export function CounterManagePanel() {
  const [passengerNumber, setPassengerNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const confirm = useConfirm();
  useGlobalLoading(loading || acting);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError("");
    setActionError("");
    setActionMessage("");
    setTicket(null);
    setLoading(true);
    try {
      const q = new URLSearchParams({
        passengerNumber: passengerNumber.trim(),
        phone: phone.trim(),
      });
      const r = await apiGet<TicketDto>(`/tickets/lookup?${q}`);
      setTicket(r.data);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Ticket not found");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(
    path: "/counter/refund" | "/counter/change",
    label: string,
  ) {
    if (!ticket) return;
    if (
      !(await confirm({
        title: `${label} booking?`,
        description: `${ticket.passengerName} (${ticket.passengerNumber})`,
        confirmLabel: label,
        destructive: label === "Refund",
      }))
    ) {
      return;
    }

    setActing(true);
    setActionError("");
    setActionMessage("");
    try {
      await apiPost(path, {
        bookingId: ticket.bookingId,
        note: note.trim() || undefined,
      });
      setActionMessage(`${label} recorded successfully.`);
      setTicket(null);
      setPassengerNumber("");
      setPhone("");
      setNote("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `${label} failed`);
    } finally {
      setActing(false);
    }
  }

  return (
    <div className={cpSection}>
      <h2 className={cpSectionTitle}>REFUND / CHANGE</h2>

      <div className={cpManageGrid}>
        <section className={cpManageSection}>
          <h3 className={cpManageHeading}>Find ticket</h3>
          <div className={cpManageBody}>
            <form onSubmit={lookup}>
              <div className={spCheckoutField} style={{ padding: 0 }}>
                <label htmlFor="mgmt-pn">Passenger number</label>
                <input
                  id="mgmt-pn"
                  value={passengerNumber}
                  onChange={(e) => setPassengerNumber(e.target.value)}
                  placeholder="P123456"
                  required
                />
              </div>
              <div className={spCheckoutField} style={{ padding: 0 }}>
                <label htmlFor="mgmt-phone">Phone on booking</label>
                <input
                  id="mgmt-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  required
                />
              </div>
              {lookupError && (
                <p className={spPanelError} style={{ marginBottom: "0.5rem" }}>
                  {lookupError}
                </p>
              )}
              <button
                type="submit"
                className={spFilterSearch}
                style={{ width: "100%", marginTop: "0.25rem" }}
                disabled={loading}
              >
                Lookup ticket
              </button>
            </form>
          </div>
        </section>

        <section className={cpManageSection}>
          <h3 className={cpManageHeading}>Booking actions</h3>
          <div className={cpManageBody}>
            {!ticket && (
              <p className={spEmpty} style={{ border: "none", padding: "1.5rem 0" }}>
                Lookup a paid ticket to refund or log a change
              </p>
            )}
            {ticket && (
              <>
                <table className={spCheckoutTable} style={{ width: "100%", margin: "0 0 0.75rem" }}>
                  <tbody>
                    <tr>
                      <th>Passenger #</th>
                      <td>
                        <strong style={{ color: "var(--sp-red, #c62828)" }}>
                          {ticket.passengerNumber}
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <td>{ticket.passengerName}</td>
                    </tr>
                    <tr>
                      <th>Route</th>
                      <td>{ticket.routeSlug}</td>
                    </tr>
                    <tr>
                      <th>Departure</th>
                      <td>{formatTime12h(ticket.departureAt)}</td>
                    </tr>
                    <tr>
                      <th>Seats</th>
                      <td>{ticket.seatLabels.join(", ")}</td>
                    </tr>
                    <tr>
                      <th>Boarding</th>
                      <td>{ticket.boardingPoint}</td>
                    </tr>
                    <tr>
                      <th>Amount</th>
                      <td>{formatMoneyBdt(ticket.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className={spCheckoutField} style={{ padding: 0 }}>
                  <label htmlFor="mgmt-note">Note (optional)</label>
                  <input
                    id="mgmt-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reason or reference"
                  />
                </div>

                {actionError && <p className={spPanelError}>{actionError}</p>}
                {actionMessage && (
                  <p
                    style={{
                      color: "var(--sp-green-dark, #1b5e20)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {actionMessage}
                  </p>
                )}

                <div className={spCheckoutActions} style={{ justifyContent: "flex-start" }}>
                  <button
                    type="button"
                    className={spBtnBack}
                    disabled={acting}
                    onClick={() => runAction("/counter/refund", "Refund")}
                  >
                    Refund
                  </button>
                  <button
                    type="button"
                    className={spFilterSearch}
                    disabled={acting}
                    onClick={() => runAction("/counter/change", "Log change")}
                  >
                    Log change
                  </button>
                </div>
                <p className={cpManageHint}>
                  Unpaid holds are cancelled automatically on expiry. Paid tickets must
                  be refunded — not cancelled.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
