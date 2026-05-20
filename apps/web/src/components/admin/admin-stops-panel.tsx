"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { CounterToast } from "@/components/counter/counter-toast";

type Stop = { id: string; name: string; city: string; code: string };

const emptyForm = { name: "", city: "", code: "" };

export function AdminStopsPanel() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Stop[]>("/admin/stops")
      .then((r) => setStops(r.data))
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
    try {
      if (editId) {
        await apiPatch(`/admin/stops/${editId}`, form);
        setToast("Stop updated");
      } else {
        await apiPost("/admin/stops", form);
        setToast("Stop created");
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete stop "${name}"?`)) return;
    try {
      await apiDelete(`/admin/stops/${id}`);
      setToast("Stop deleted");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="cp-section-title">STOPS</h2>

      <form className="adm-form-card" onSubmit={submit}>
        <h3>{editId ? "Edit stop" : "Add stop"}</h3>
        <div className="adm-form-row">
          <div className="sp-checkout-field">
            <label htmlFor="stop-name">Name</label>
            <input
              id="stop-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="stop-city">City</label>
            <input
              id="stop-city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
          </div>
          <div className="sp-checkout-field">
            <label htmlFor="stop-code">Code</label>
            <input
              id="stop-code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
              maxLength={10}
            />
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

      {loading ? (
        <div className="sp-empty">Loading…</div>
      ) : (
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s) => (
                <tr key={s.id}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.city}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        type="button"
                        className="adm-btn-edit"
                        onClick={() => {
                          setEditId(s.id);
                          setForm({ name: s.name, city: s.city, code: s.code });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adm-btn-delete"
                        onClick={() => remove(s.id, s.name)}
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
