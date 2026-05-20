"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatBusTypeLabel } from "@/lib/format";
import { CounterToast } from "@/components/counter/counter-toast";

type Layout = { id: string; name: string };
type Coach = {
  id: string;
  coachNumber: string;
  busType: string;
  seatLayout: { name: string } | null;
};

export function AdminCoachesPanel() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [coachNumber, setCoachNumber] = useState("");
  const [busType, setBusType] = useState<"AC" | "NON_AC">("AC");
  const [seatLayoutId, setSeatLayoutId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiGet<Coach[]>("/admin/coaches"),
      apiGet<Layout[]>("/admin/layouts"),
    ])
      .then(([c, l]) => {
        setCoaches(c.data);
        setLayouts(l.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/admin/coaches", {
        coachNumber: coachNumber.trim(),
        busType,
        seatLayoutId: seatLayoutId || undefined,
      });
      setToast("Coach created");
      setCoachNumber("");
      setSeatLayoutId("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="cp-section-title">COACHES</h2>

      <form className="adm-form-card" onSubmit={submit}>
        <h3>Add coach</h3>
        <div className="adm-form-row">
          <div className="sp-checkout-field">
            <label htmlFor="coach-num">Coach number</label>
            <input
              id="coach-num"
              value={coachNumber}
              onChange={(e) => setCoachNumber(e.target.value)}
              required
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="coach-type">Bus type</label>
            <select
              id="coach-type"
              value={busType}
              onChange={(e) => setBusType(e.target.value as "AC" | "NON_AC")}
            >
              <option value="AC">AC</option>
              <option value="NON_AC">Non AC</option>
            </select>
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="coach-layout">Seat layout</label>
            <select
              id="coach-layout"
              value={seatLayoutId}
              onChange={(e) => setSeatLayoutId(e.target.value)}
            >
              <option value="">None</option>
              {layouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-form-actions adm-form-actions--with-label">
            <span className="adm-form-actions__spacer" aria-hidden="true">
              Actions
            </span>
            <div className="adm-form-actions__buttons">
              <button type="submit" className="sp-filter-search">
                Add coach
              </button>
            </div>
          </div>
        </div>
        {error && <p className="sp-panel-error">{error}</p>}
      </form>

      {loading ? (
        <div className="sp-empty">Loading…</div>
      ) : (
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Coach #</th>
                <th>Type</th>
                <th>Layout</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c) => (
                <tr key={c.id}>
                  <td>{c.coachNumber}</td>
                  <td>{formatBusTypeLabel(c.busType)}</td>
                  <td>{c.seatLayout?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
