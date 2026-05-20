"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { CounterToast } from "@/components/counter/counter-toast";

type Stop = { id: string; name: string; city: string; code: string };
type Route = {
  id: string;
  slug: string;
  distanceKm: number | null;
  fromStop: Stop;
  toStop: Stop;
};

export function AdminRoutesPanel() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [fromStopId, setFromStopId] = useState("");
  const [toStopId, setToStopId] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiGet<Route[]>("/admin/routes"), apiGet<Stop[]>("/admin/stops")])
      .then(([r, s]) => {
        setRoutes(r.data);
        setStops(s.data);
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
    if (fromStopId === toStopId) {
      setToast("From and to must differ");
      return;
    }
    try {
      await apiPost("/admin/routes", {
        fromStopId,
        toStopId,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
      });
      setToast("Route created");
      setFromStopId("");
      setToStopId("");
      setDistanceKm("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="cp-section-title">ROUTES</h2>

      <form className="adm-form-card" onSubmit={submit}>
        <h3>Add route</h3>
        <div className="adm-form-row">
          <div className="sp-checkout-field">
            <label htmlFor="route-from">From</label>
            <select
              id="route-from"
              value={fromStopId}
              onChange={(e) => setFromStopId(e.target.value)}
              required
            >
              <option value="">Select</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="route-to">To</label>
            <select
              id="route-to"
              value={toStopId}
              onChange={(e) => setToStopId(e.target.value)}
              required
            >
              <option value="">Select</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="route-km">Distance (km)</label>
            <input
              id="route-km"
              type="number"
              min={1}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
          </div>
          <div className="adm-form-actions adm-form-actions--with-label">
            <span className="adm-form-actions__spacer" aria-hidden="true">
              Actions
            </span>
            <div className="adm-form-actions__buttons">
              <button type="submit" className="sp-filter-search">
                Add route
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
                <th>Slug</th>
                <th>From</th>
                <th>To</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id}>
                  <td>{r.slug}</td>
                  <td>
                    {r.fromStop.city} ({r.fromStop.code})
                  </td>
                  <td>
                    {r.toStop.city} ({r.toStop.code})
                  </td>
                  <td>{r.distanceKm ? `${r.distanceKm} km` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
