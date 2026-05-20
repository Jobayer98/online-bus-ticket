"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { CounterToast } from "@/components/counter/counter-toast";

type Stop = { id: string; name: string; city: string; code: string };
type Route = {
  id: string;
  slug: string;
  distanceKm: number | null;
  fromStop: Stop;
  toStop: Stop;
};
type BoardingPoint = {
  id: string;
  routeId: string;
  name: string;
  sortOrder: number;
};

export function AdminRoutesPanel() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [fromStopId, setFromStopId] = useState("");
  const [toStopId, setToStopId] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
  const [bpName, setBpName] = useState("");
  const [bpSortOrder, setBpSortOrder] = useState("");
  const [editBpId, setEditBpId] = useState<string | null>(null);
  const [editBpName, setEditBpName] = useState("");
  const [editBpSort, setEditBpSort] = useState("");
  const [bpLoading, setBpLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  const loadRoutes = useCallback(() => {
    setLoading(true);
    Promise.all([apiGet<Route[]>("/admin/routes"), apiGet<Stop[]>("/admin/stops")])
      .then(([r, s]) => {
        setRoutes(r.data);
        setStops(s.data);
        setSelectedRouteId((prev) => prev || r.data[0]?.id || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const loadBoardingPoints = useCallback((routeId: string) => {
    if (!routeId) {
      setBoardingPoints([]);
      return;
    }
    setBpLoading(true);
    apiGet<BoardingPoint[]>(`/admin/routes/${routeId}/boarding-points`)
      .then((r) => setBoardingPoints(r.data))
      .catch((e) => setToast(e instanceof Error ? e.message : "Failed to load points"))
      .finally(() => setBpLoading(false));
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    loadBoardingPoints(selectedRouteId);
    setEditBpId(null);
    setBpName("");
    setBpSortOrder("");
  }, [selectedRouteId, loadBoardingPoints]);

  async function submitRoute(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (fromStopId === toStopId) {
      setToast("From and to must differ");
      return;
    }
    try {
      const created = await apiPost<Route>("/admin/routes", {
        fromStopId,
        toStopId,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
      });
      setToast("Route created");
      setFromStopId("");
      setToStopId("");
      setDistanceKm("");
      setSelectedRouteId(created.data.id);
      loadRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function addBoardingPoint(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRouteId) return;
    const name = bpName.trim();
    if (!name) {
      setToast("Enter boarding point name");
      return;
    }
    try {
      await apiPost(`/admin/routes/${selectedRouteId}/boarding-points`, {
        name,
        sortOrder: bpSortOrder ? Number(bpSortOrder) : undefined,
      });
      setToast("Boarding point added");
      setBpName("");
      setBpSortOrder("");
      loadBoardingPoints(selectedRouteId);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Add failed");
    }
  }

  async function saveBoardingPointEdit() {
    if (!selectedRouteId || !editBpId) return;
    const name = editBpName.trim();
    if (!name) {
      setToast("Name is required");
      return;
    }
    try {
      await apiPatch(`/admin/routes/${selectedRouteId}/boarding-points/${editBpId}`, {
        name,
        sortOrder: Number(editBpSort),
      });
      setToast("Boarding point updated");
      setEditBpId(null);
      loadBoardingPoints(selectedRouteId);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function deleteBoardingPoint(id: string) {
    if (!selectedRouteId) return;
    if (!window.confirm("Delete this boarding point?")) return;
    try {
      await apiDelete(`/admin/routes/${selectedRouteId}/boarding-points/${id}`);
      setToast("Boarding point deleted");
      loadBoardingPoints(selectedRouteId);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function startEdit(bp: BoardingPoint) {
    setEditBpId(bp.id);
    setEditBpName(bp.name);
    setEditBpSort(String(bp.sortOrder));
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="cp-section-title">ROUTES</h2>

      <form className="adm-form-card" onSubmit={submitRoute}>
        <h3>Add route</h3>
        <div className="adm-form-row">
          <div className="adm-form-field adm-form-field--wide">
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
          <div className="adm-form-field adm-form-field--wide">
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
          <div className="adm-form-field">
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
                <th />
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr
                  key={r.id}
                  className={selectedRouteId === r.id ? "adm-row-selected" : undefined}
                >
                  <td>{r.slug}</td>
                  <td>
                    {r.fromStop.city} ({r.fromStop.code})
                  </td>
                  <td>
                    {r.toStop.city} ({r.toStop.code})
                  </td>
                  <td>{r.distanceKm ? `${r.distanceKm} km` : "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="adm-btn-edit"
                      onClick={() => setSelectedRouteId(r.id)}
                    >
                      Boarding points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="adm-form-card adm-boarding-section">
        <h3>Boarding points</h3>
        <p className="adm-boarding-hint">
          Each route can have multiple pickup points. Customers choose one when booking.
        </p>

        <div className="adm-form-row">
          <div className="adm-form-field adm-form-field--wide">
            <label htmlFor="bp-route">Route</label>
            <select
              id="bp-route"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
            >
              <option value="">Select route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.slug} ({r.fromStop.city} → {r.toStop.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedRoute && (
          <p className="adm-boarding-route-label">
            Managing: <strong>{selectedRoute.slug}</strong>
          </p>
        )}

        {selectedRouteId && (
          <>
            <form className="adm-form-row" onSubmit={addBoardingPoint}>
              <div className="adm-form-field adm-form-field--wide">
                <label htmlFor="bp-name">Point name</label>
                <input
                  id="bp-name"
                  type="text"
                  value={bpName}
                  onChange={(e) => setBpName(e.target.value)}
                  placeholder="e.g. Gabtoli"
                />
              </div>
              <div className="adm-form-field">
                <label htmlFor="bp-sort">Order</label>
                <input
                  id="bp-sort"
                  type="number"
                  min={0}
                  value={bpSortOrder}
                  onChange={(e) => setBpSortOrder(e.target.value)}
                  placeholder="Auto"
                />
              </div>
              <div className="adm-form-actions adm-form-actions--with-label">
                <span className="adm-form-actions__spacer" aria-hidden="true">
                  Actions
                </span>
                <div className="adm-form-actions__buttons">
                  <button type="submit" className="sp-filter-search">
                    Add point
                  </button>
                </div>
              </div>
            </form>

            {bpLoading ? (
              <div className="sp-empty">Loading boarding points…</div>
            ) : boardingPoints.length === 0 ? (
              <div className="sp-empty">No boarding points yet for this route.</div>
            ) : (
              <div className="cp-table-wrap">
                <table className="cp-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardingPoints.map((bp) => (
                      <tr key={bp.id}>
                        <td>
                          {editBpId === bp.id ? (
                            <input
                              type="number"
                              min={0}
                              className="adm-inline-input"
                              value={editBpSort}
                              onChange={(e) => setEditBpSort(e.target.value)}
                            />
                          ) : (
                            bp.sortOrder
                          )}
                        </td>
                        <td>
                          {editBpId === bp.id ? (
                            <input
                              type="text"
                              className="adm-inline-input"
                              value={editBpName}
                              onChange={(e) => setEditBpName(e.target.value)}
                            />
                          ) : (
                            bp.name
                          )}
                        </td>
                        <td>
                          <div className="adm-row-actions">
                            {editBpId === bp.id ? (
                              <>
                                <button
                                  type="button"
                                  className="adm-btn-edit"
                                  onClick={saveBoardingPointEdit}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="sp-btn-back"
                                  onClick={() => setEditBpId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="adm-btn-edit"
                                  onClick={() => startEdit(bp)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="adm-btn-delete"
                                  onClick={() => deleteBoardingPoint(bp.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
