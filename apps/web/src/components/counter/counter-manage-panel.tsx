"use client";

import { useState } from "react";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatMoneyBdt, formatTime12h } from "@/lib/format";
import type { TicketDto } from "@repo/shared";

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
    path: "/counter/refund" | "/counter/cancel" | "/counter/change",
    label: string,
  ) {
    if (!ticket) return;
    const confirmed = window.confirm(
      `${label} booking for ${ticket.passengerName} (${ticket.passengerNumber})?`,
    );
    if (!confirmed) return;

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
    <div className="cp-section">
      <h2 className="cp-section-title">REFUND / CHANGE / CANCEL</h2>

      <div className="cp-manage-grid">
        <section>
          <h3>Find ticket</h3>
          <div className="cp-manage-body">
            <form onSubmit={lookup}>
              <div className="sp-checkout-field" style={{ padding: 0 }}>
                <label htmlFor="mgmt-pn">Passenger number</label>
                <input
                  id="mgmt-pn"
                  value={passengerNumber}
                  onChange={(e) => setPassengerNumber(e.target.value)}
                  placeholder="P123456"
                  required
                />
              </div>
              <div className="sp-checkout-field" style={{ padding: 0 }}>
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
                <p className="sp-panel-error" style={{ marginBottom: "0.5rem" }}>
                  {lookupError}
                </p>
              )}
              <button
                type="submit"
                className="sp-filter-search"
                style={{ width: "100%", marginTop: "0.25rem" }}
                disabled={loading}
              >
                Lookup ticket
              </button>
            </form>
          </div>
        </section>

        <section>
          <h3>Booking actions</h3>
          <div className="cp-manage-body">
            {!ticket && (
              <p className="sp-empty" style={{ border: "none", padding: "1.5rem 0" }}>
                Lookup a ticket to refund, cancel, or log a change
              </p>
            )}
            {ticket && (
              <>
                <table className="sp-checkout-table" style={{ width: "100%", margin: "0 0 0.75rem" }}>
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

                <div className="sp-checkout-field" style={{ padding: 0 }}>
                  <label htmlFor="mgmt-note">Note (optional)</label>
                  <input
                    id="mgmt-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reason or reference"
                  />
                </div>

                {actionError && <p className="sp-panel-error">{actionError}</p>}
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

                <div className="sp-checkout-actions" style={{ justifyContent: "flex-start" }}>
                  <button
                    type="button"
                    className="sp-btn-back"
                    disabled={acting}
                    onClick={() => runAction("/counter/refund", "Refund")}
                  >
                    Refund
                  </button>
                  <button
                    type="button"
                    className="sp-btn-select is-cancel"
                    disabled={acting}
                    onClick={() => runAction("/counter/cancel", "Cancel")}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="sp-filter-search"
                    disabled={acting}
                    onClick={() => runAction("/counter/change", "Log change")}
                  >
                    Log change
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
