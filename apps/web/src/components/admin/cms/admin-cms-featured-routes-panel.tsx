"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeaturedRouteDto } from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import {
  admCmsRowActions,
  admFormActionsLabel,
  admFormActionsWithLabel,
  admFormCard,
  admFormField,
  admFormFieldInput,
  admFormFieldLabel,
  admFormFieldWide,
  admFormRow,
  admMuted,
  admPageTitle,
} from "../admin-tw";
import {
  cpSection,
  cpTable,
  cpTableCell,
  cpTableHead,
  cpTableRow,
  cpTableWrap,
} from "@/components/counter/counter-tw";
import {
  spBtnBack,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

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
      <div className={cpSection}>
        <p className={admMuted}>Loading featured routes…</p>
      </div>
    );
  }

  return (
    <div className={cpSection}>
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className={admPageTitle}>FEATURED ROUTES</h3>
      {error ? (
        <p className={spPanelError} role="alert">
          {error}
        </p>
      ) : null}

      <form className={admFormCard} onSubmit={addRoute}>
        <h3>Add route to home</h3>
        <div className={admFormRow}>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="cms-featured-route" className={admFormFieldLabel}>Route</label>
            <select
              id="cms-featured-route"
              className={admFormFieldInput}
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
          <div className={admFormActionsWithLabel}>
            <span className={admFormActionsLabel} aria-hidden="true">
              &nbsp;
            </span>
            <button type="submit" className={spFilterSearch} disabled={busy || !routeId}>
              Add
            </button>
          </div>
        </div>
      </form>

      <div className={cpTableWrap}>
        <table className={cpTable}>
          <thead>
            <tr>
              <th className={cpTableHead}>Order</th>
              <th className={cpTableHead}>Route</th>
              <th className={cpTableHead}>Visible</th>
              <th className={cpTableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className={`${cpTableCell} ${admMuted}`}>
                  No featured routes yet.
                </td>
              </tr>
            ) : (
              sorted.map((item, index) => {
                const label = `${item.fromStop.city} → ${item.toStop.city}`;
                return (
                  <tr key={item.id} className={cpTableRow}>
                    <td className={cpTableCell}>{index + 1}</td>
                    <td className={cpTableCell}>
                      <strong>{label}</strong>
                      <br />
                      <span className={admMuted}>{item.routeSlug}</span>
                    </td>
                    <td className={cpTableCell}>
                      <button
                        type="button"
                        className={spBtnBack}
                        onClick={() => toggleVisible(item)}
                      >
                        {item.isVisible ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td className={cpTableCell}>
                      <div className={admCmsRowActions}>
                        <button
                          type="button"
                          className={spBtnBack}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={spBtnBack}
                          disabled={index === sorted.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={spBtnBack}
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
