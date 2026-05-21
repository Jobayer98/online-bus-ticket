"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatSeatClassLabel } from "@/lib/format";
import { CounterToast } from "@/components/counter/counter-toast";
import {
  createEmptyGrid,
  fillGrid,
  gridToTemplates,
  LayoutEditorGrid,
  type LayoutCellClass,
} from "./layout-editor-grid";

type SeatTemplate = {
  id: string;
  label: string;
  row: number;
  col: number;
  seatClass: string;
};

type SeatLayout = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  templates: SeatTemplate[];
};

export function AdminLayoutsPanel() {
  const [layouts, setLayouts] = useState<SeatLayout[]>([]);
  const [name, setName] = useState("");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(4);
  const [grid, setGrid] = useState<LayoutCellClass[][]>(() => createEmptyGrid(10, 4));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  useGlobalLoading(loading || saving);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<SeatLayout[]>("/admin/layouts")
      .then((r) => setLayouts(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resizeGrid(newRows: number, newCols: number) {
    const next = createEmptyGrid(newRows, newCols);
    for (let r = 0; r < Math.min(newRows, grid.length); r++) {
      for (let c = 0; c < Math.min(newCols, grid[r]?.length ?? 0); c++) {
        next[r][c] = grid[r]![c]!;
      }
    }
    setGrid(next);
  }

  function handleRowsChange(n: number) {
    const v = Math.min(20, Math.max(1, n));
    setRows(v);
    resizeGrid(v, cols);
  }

  function handleColsChange(n: number) {
    const v = Math.min(6, Math.max(2, n));
    setCols(v);
    resizeGrid(rows, v);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const templates = gridToTemplates(grid);
    if (!name.trim()) {
      setToast("Enter a layout name");
      return;
    }
    if (templates.length === 0) {
      setToast("Add at least one seat to the grid");
      return;
    }
    const labels = new Set(templates.map((t) => t.label));
    if (labels.size !== templates.length) {
      setToast("Duplicate seat labels in grid");
      return;
    }

    setSaving(true);
    try {
      await apiPost("/admin/layouts", {
        name: name.trim(),
        rows,
        cols,
        templates,
      });
      setToast(`Layout "${name.trim()}" created`);
      setName("");
      setGrid(createEmptyGrid(rows, cols));
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const seatCount = gridToTemplates(grid).length;

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="adm-page-title">Seat layouts</h2>
      <p className="adm-layout-intro">
        Define reusable seat maps, then assign them when creating coaches. Click grid cells to set
        seat class; leave cells empty for aisle space.
      </p>

      <form className="adm-form-card adm-layout-form" onSubmit={submit}>
        <h3>Create layout</h3>
        <div className="adm-form-row">
          <div className="sp-checkout-field">
            <label htmlFor="layout-name">Layout name</label>
            <input
              id="layout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 40 Seat AC Standard"
              required
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="layout-rows">Rows</label>
            <input
              id="layout-rows"
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => handleRowsChange(Number(e.target.value))}
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="layout-cols">Columns</label>
            <input
              id="layout-cols"
              type="number"
              min={2}
              max={6}
              value={cols}
              onChange={(e) => handleColsChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="adm-layout-toolbar">
          <span className="adm-layout-toolbar-meta">
            {seatCount} seat{seatCount === 1 ? "" : "s"} in {rows}×{cols} grid
          </span>
          <button
            type="button"
            className="sp-btn-select"
            onClick={() => setGrid(fillGrid(grid, "STANDARD"))}
          >
            Fill all standard
          </button>
          <button
            type="button"
            className="sp-btn-select"
            onClick={() => setGrid(fillGrid(grid, "PREMIUM"))}
          >
            Fill all premium
          </button>
          <button type="button" className="sp-btn-back" onClick={() => setGrid(createEmptyGrid(rows, cols))}>
            Clear grid
          </button>
        </div>

        <LayoutEditorGrid rows={rows} cols={cols} grid={grid} onChange={setGrid} />

        {error && <p className="sp-panel-error">{error}</p>}

        <div className="adm-layout-submit">
          <button type="submit" className="sp-filter-search" disabled={saving}>
            {saving ? "Saving…" : "Save layout"}
          </button>
        </div>
      </form>

      <h3 className="adm-subheading">Saved layouts</h3>
      {!loading && (
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grid</th>
                <th>Seats</th>
                <th>Classes</th>
              </tr>
            </thead>
            <tbody>
              {layouts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#666" }}>
                    No layouts yet — create one above
                  </td>
                </tr>
              ) : (
                layouts.map((l) => {
                  const classes = [...new Set(l.templates.map((t) => t.seatClass))];
                  return (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.name}</strong>
                      </td>
                      <td>
                        {l.rows} × {l.cols}
                      </td>
                      <td>{l.templates.length}</td>
                      <td>{classes.map(formatSeatClassLabel).join(", ")}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
