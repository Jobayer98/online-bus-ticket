"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { toast } from "@/lib/toast";
import {
  admBoardingHint,
  admBoardingRouteLabel,
  admBoardingSection,
  admBtnDelete,
  admBtnEdit,
  admFormActionsButtons,
  admFormActionsSpacer,
  admFormActionsWithLabel,
  admFormCard,
  admFormField,
  admFormFieldInput,
  admFormFieldLabel,
  admFormFieldWide,
  admFormRow,
  admInlineInput,
  admPanel,
  admRowActions,
} from "./admin-tw";
import {
  AdminTable,
  AdminTableRow,
  admTableCell,
  admTableHeadCell,
  admTableHeadRow,
} from "./admin-table";
import {
  spBtnBack,
  spEmpty,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

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
  const confirm = useConfirm();
  useGlobalLoading(loading || bpLoading);

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
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load points"))
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
      toast.error("From and to must differ");
      return;
    }
    try {
      const created = await apiPost<Route>("/admin/routes", {
        fromStopId,
        toStopId,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
      });
      toast.success("Route created");
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
      toast.error("Enter boarding point name");
      return;
    }
    try {
      await apiPost(`/admin/routes/${selectedRouteId}/boarding-points`, {
        name,
        sortOrder: bpSortOrder ? Number(bpSortOrder) : undefined,
      });
      toast.success("Boarding point added");
      setBpName("");
      setBpSortOrder("");
      loadBoardingPoints(selectedRouteId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add failed");
    }
  }

  async function saveBoardingPointEdit() {
    if (!selectedRouteId || !editBpId) return;
    const name = editBpName.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    try {
      await apiPatch(`/admin/routes/${selectedRouteId}/boarding-points/${editBpId}`, {
        name,
        sortOrder: Number(editBpSort),
      });
      toast.success("Boarding point updated");
      setEditBpId(null);
      loadBoardingPoints(selectedRouteId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function deleteBoardingPoint(id: string) {
    if (!selectedRouteId) return;
    if (
      !(await confirm({
        title: "Delete this boarding point?",
        description: "This action cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
      }))
    ) {
      return;
    }
    try {
      await apiDelete(`/admin/routes/${selectedRouteId}/boarding-points/${id}`);
      toast.success("Boarding point deleted");
      loadBoardingPoints(selectedRouteId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function startEdit(bp: BoardingPoint) {
    setEditBpId(bp.id);
    setEditBpName(bp.name);
    setEditBpSort(String(bp.sortOrder));
  }

  return (
    <div className={admPanel}>
      <form className={admFormCard} onSubmit={submitRoute}>
        <h3>Add route</h3>
        <div className={admFormRow}>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="route-from" className={admFormFieldLabel}>From</label>
            <select
              id="route-from"
              className={admFormFieldInput}
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
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="route-to" className={admFormFieldLabel}>To</label>
            <select
              id="route-to"
              className={admFormFieldInput}
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
          <div className={admFormField}>
            <label htmlFor="route-km" className={admFormFieldLabel}>Distance (km)</label>
            <input
              id="route-km"
              type="number"
              className={admFormFieldInput}
              min={1}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
          </div>
          <div className={admFormActionsWithLabel}>
            <span className={admFormActionsSpacer} aria-hidden="true">
              Actions
            </span>
            <div className={admFormActionsButtons}>
              <button type="submit" className={spFilterSearch}>
                Add route
              </button>
            </div>
          </div>
        </div>
        {error && <p className={spPanelError}>{error}</p>}
      </form>

      {!loading && (
        <AdminTable>
            <thead>
              <tr className={admTableHeadRow}>
                <th className={admTableHeadCell}>Slug</th>
                <th className={admTableHeadCell}>From</th>
                <th className={admTableHeadCell}>To</th>
                <th className={admTableHeadCell}>Distance</th>
                <th className={admTableHeadCell} />
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <AdminTableRow
                  key={r.id}
                  selected={selectedRouteId === r.id}
                >
                  <td className={admTableCell}>{r.slug}</td>
                  <td className={admTableCell}>
                    {r.fromStop.city} ({r.fromStop.code})
                  </td>
                  <td className={admTableCell}>
                    {r.toStop.city} ({r.toStop.code})
                  </td>
                  <td className={admTableCell}>{r.distanceKm ? `${r.distanceKm} km` : "—"}</td>
                  <td className={admTableCell}>
                    <button
                      type="button"
                      className={admBtnEdit}
                      onClick={() => setSelectedRouteId(r.id)}
                    >
                      Boarding points
                    </button>
                  </td>
                </AdminTableRow>
              ))}
            </tbody>
        </AdminTable>
      )}

      <section className={`${admFormCard} ${admBoardingSection}`}>
        <h3>Boarding points</h3>
        <p className={admBoardingHint}>
          Each route can have multiple pickup points. Customers choose one when booking.
        </p>

        <div className={admFormRow}>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="bp-route" className={admFormFieldLabel}>Route</label>
            <select
              id="bp-route"
              className={admFormFieldInput}
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
          <p className={admBoardingRouteLabel}>
            Managing: <strong>{selectedRoute.slug}</strong>
          </p>
        )}

        {selectedRouteId && (
          <>
            <form className={admFormRow} onSubmit={addBoardingPoint}>
              <div className={`${admFormField} ${admFormFieldWide}`}>
                <label htmlFor="bp-name" className={admFormFieldLabel}>Point name</label>
                <input
                  id="bp-name"
                  type="text"
                  className={admFormFieldInput}
                  value={bpName}
                  onChange={(e) => setBpName(e.target.value)}
                  placeholder="e.g. Gabtoli"
                />
              </div>
              <div className={admFormField}>
                <label htmlFor="bp-sort" className={admFormFieldLabel}>Order</label>
                <input
                  id="bp-sort"
                  type="number"
                  className={admFormFieldInput}
                  min={0}
                  value={bpSortOrder}
                  onChange={(e) => setBpSortOrder(e.target.value)}
                  placeholder="Auto"
                />
              </div>
              <div className={admFormActionsWithLabel}>
                <span className={admFormActionsSpacer} aria-hidden="true">
                  Actions
                </span>
                <div className={admFormActionsButtons}>
                  <button type="submit" className={spFilterSearch}>
                    Add point
                  </button>
                </div>
              </div>
            </form>

            {!bpLoading &&
              (boardingPoints.length === 0 ? (
                <div className={spEmpty}>No boarding points yet for this route.</div>
              ) : (
                <AdminTable>
                    <thead>
                      <tr className={admTableHeadRow}>
                        <th className={admTableHeadCell}>Order</th>
                        <th className={admTableHeadCell}>Name</th>
                        <th className={admTableHeadCell}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boardingPoints.map((bp) => (
                        <AdminTableRow key={bp.id}>
                          <td className={admTableCell}>
                            {editBpId === bp.id ? (
                              <input
                                type="number"
                                min={0}
                                className={admInlineInput}
                                value={editBpSort}
                                onChange={(e) => setEditBpSort(e.target.value)}
                              />
                            ) : (
                              bp.sortOrder
                            )}
                          </td>
                          <td className={admTableCell}>
                            {editBpId === bp.id ? (
                              <input
                                type="text"
                                className={admInlineInput}
                                value={editBpName}
                                onChange={(e) => setEditBpName(e.target.value)}
                              />
                            ) : (
                              bp.name
                            )}
                          </td>
                          <td className={admTableCell}>
                            <div className={admRowActions}>
                              {editBpId === bp.id ? (
                                <>
                                  <button
                                    type="button"
                                    className={admBtnEdit}
                                    onClick={saveBoardingPointEdit}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className={spBtnBack}
                                    onClick={() => setEditBpId(null)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className={admBtnEdit}
                                    onClick={() => startEdit(bp)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className={admBtnDelete}
                                    onClick={() => deleteBoardingPoint(bp.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </AdminTableRow>
                      ))}
                    </tbody>
                </AdminTable>
              ))}
          </>
        )}
      </section>
    </div>
  );
}
