"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeaturedRouteDto } from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";

type RouteOption = {
  id: string;
  slug: string;
  fromStop: { city: string; name: string };
  toStop: { city: string; name: string };
};

export function AdminCmsFeaturedRoutesPanel() {
  const [featured, setFeatured] = useState<FeaturedRouteDto[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [routeId, setRouteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  useGlobalLoading(loading || busy);

  const sorted = useMemo(
    () => [...featured].sort((a, b) => a.sortOrder - b.sortOrder),
    [featured],
  );

  const availableRoutes = useMemo(() => {
    const used = new Set(featured.map((f) => f.routeId));
    return routes.filter((r) => !used.has(r.id));
  }, [routes, featured]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiGet<FeaturedRouteDto[]>("/admin/cms/featured-routes"),
      apiGet<RouteOption[]>("/admin/routes"),
    ])
      .then(([f, r]) => {
        setFeatured(f.data);
        setRoutes(r.data);
        setRouteId((prev) => prev || r.data.find((x) => !f.data.some((fr) => fr.routeId === x.id))?.id || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!routeId) {
      setToast("Select a route");
      return;
    }
    setBusy(true);
    try {
      await apiPost("/admin/cms/featured-routes", {
        routeId,
        sortOrder: sorted.length,
        isVisible: true,
      });
      setToast("Route added to home curation");
      setRouteId("");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Add failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(item: FeaturedRouteDto) {
    setBusy(true);
    try {
      await apiPatch(`/admin/cms/featured-routes/${item.id}`, {
        isVisible: !item.isVisible,
      });
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= sorted.length) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(next, 0, moved);
    setBusy(true);
    try {
      await apiPost("/admin/cms/featured-routes/reorder", {
        items: reordered.map((r, i) => ({ id: r.id, sortOrder: i })),
      });
      setToast("Order updated");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Reorder failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Remove "${label}" from featured routes?`)) return;
    setBusy(true);
    try {
      await apiDelete(`/admin/cms/featured-routes/${id}`);
      setToast("Removed from curation");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading && featured.length === 0) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading featured routes…</p>
      </div>
    );
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">FEATURED ROUTES</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="adm-form-card" onSubmit={addRoute}>
        <h3>Add route to home</h3>
        <div className="adm-form-row">
          <div className="adm-form-field adm-form-field--wide">
            <label htmlFor="cms-featured-route">Route</label>
            <select
              id="cms-featured-route"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              <option value="">Select route…</option>
              {availableRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fromStop.city} → {r.toStop.city} ({r.slug})
                </option>
              ))}
            </select>
          </div>
          <div className="adm-form-actions adm-form-actions--with-label">
            <span className="adm-form-actions__label" aria-hidden="true">
              &nbsp;
            </span>
            <button type="submit" className="sp-filter-search" disabled={busy || !routeId}>
              Add
            </button>
          </div>
        </div>
      </form>

      <div className="cp-table-wrap">
        <table className="cp-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Route</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="adm-muted">
                  No featured routes yet.
                </td>
              </tr>
            ) : (
              sorted.map((item, index) => {
                const label = `${item.fromStop.city} → ${item.toStop.city}`;
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{label}</strong>
                      <br />
                      <span className="adm-muted">{item.routeSlug}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sp-btn-back"
                        onClick={() => toggleVisible(item)}
                      >
                        {item.isVisible ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td>
                      <div className="adm-cms-row-actions">
                        <button
                          type="button"
                          className="sp-btn-back"
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="sp-btn-back"
                          disabled={index === sorted.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="sp-btn-back"
                          onClick={() => remove(item.id, label)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
