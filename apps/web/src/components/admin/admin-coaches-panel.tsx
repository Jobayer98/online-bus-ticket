"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImportResultDto } from "@repo/shared";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { parseCsvToObjects } from "@/lib/csv-parse";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatBusTypeLabel } from "@/lib/format";
import { CounterToast } from "@/components/counter/counter-toast";
import { AdminCsvImport } from "@/components/admin/admin-csv-import";

type Layout = { id: string; name: string };
type Coach = {
  id: string;
  coachNumber: string;
  busType: "AC" | "NON_AC";
  seatLayoutId: string | null;
  seatLayout: { name: string } | null;
};

const emptyForm = {
  coachNumber: "",
  busType: "AC" as "AC" | "NON_AC",
  seatLayoutId: "",
};

const COACH_CSV_TEMPLATE = `coachNumber,busType,seatLayoutName
DH-2001,AC,40 Seat Standard
DH-2002,NON_AC,`;

const COACH_CSV_HEADERS = ["coachNumber", "busType", "seatLayoutName"] as const;

export function AdminCoachesPanel() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  useGlobalLoading(loading || importing);

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

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      coachNumber: form.coachNumber.trim(),
      busType: form.busType,
      seatLayoutId: form.seatLayoutId || null,
    };
    try {
      if (editId) {
        await apiPatch(`/admin/coaches/${editId}`, payload);
        setToast("Coach updated");
      } else {
        await apiPost("/admin/coaches", payload);
        setToast("Coach created");
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function importCsv(text: string) {
    setImportErrors([]);
    setImporting(true);
    try {
      const { rows } = parseCsvToObjects(text, COACH_CSV_HEADERS);
      const payload = {
        rows: rows.map((r) => ({
          coachNumber: r.coachNumber.trim(),
          busType: r.busType.trim(),
          seatLayoutName: r.seatLayoutName.trim() || undefined,
        })),
        skipDuplicates: true,
      };
      const res = await apiPost<ImportResultDto>("/admin/coaches/import", payload);
      const { created, skipped, errors } = res.data;
      setToast(`Imported ${created} coach(es)${skipped ? `, ${skipped} skipped` : ""}`);
      if (errors.length > 0) {
        setImportErrors(errors.map((e) => `Row ${e.row}: ${e.message}`));
      }
      load();
    } catch (err) {
      setImportErrors([
        err instanceof Error ? err.message : "Import failed",
      ]);
    } finally {
      setImporting(false);
    }
  }

  async function remove(id: string, coachNumber: string) {
    if (!window.confirm(`Delete coach "${coachNumber}"?`)) return;
    try {
      await apiDelete(`/admin/coaches/${id}`);
      setToast("Coach deleted");
      if (editId === id) resetForm();
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="cp-section-title">COACHES</h2>

      <form className="adm-form-card" onSubmit={submit}>
        <h3>{editId ? "Edit coach" : "Add coach"}</h3>
        <div className="adm-form-row">
          <div className="sp-checkout-field">
            <label htmlFor="coach-num">Coach number</label>
            <input
              id="coach-num"
              value={form.coachNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, coachNumber: e.target.value }))
              }
              required
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="coach-type">Bus type</label>
            <select
              id="coach-type"
              value={form.busType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  busType: e.target.value as "AC" | "NON_AC",
                }))
              }
            >
              <option value="AC">AC</option>
              <option value="NON_AC">Non AC</option>
            </select>
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="coach-layout">Seat layout</label>
            <select
              id="coach-layout"
              value={form.seatLayoutId}
              onChange={(e) =>
                setForm((f) => ({ ...f, seatLayoutId: e.target.value }))
              }
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
                {editId ? "Update" : "Add"}
              </button>
              {editId && (
                <button type="button" className="sp-btn-back" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
        {error && <p className="sp-panel-error">{error}</p>}
      </form>

      <AdminCsvImport
        title="Import coaches from CSV"
        templateFilename="coaches-template.csv"
        templateContent={COACH_CSV_TEMPLATE}
        previewHeaders={[...COACH_CSV_HEADERS]}
        onImport={importCsv}
        importing={importing}
        importErrors={importErrors}
      />

      {!loading && (
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Coach #</th>
                <th>Type</th>
                <th>Layout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c) => (
                <tr key={c.id}>
                  <td>{c.coachNumber}</td>
                  <td>{formatBusTypeLabel(c.busType)}</td>
                  <td>{c.seatLayout?.name ?? "—"}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        type="button"
                        className="adm-btn-edit"
                        onClick={() => {
                          setEditId(c.id);
                          setForm({
                            coachNumber: c.coachNumber,
                            busType: c.busType,
                            seatLayoutId: c.seatLayoutId ?? "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adm-btn-delete"
                        onClick={() => remove(c.id, c.coachNumber)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
