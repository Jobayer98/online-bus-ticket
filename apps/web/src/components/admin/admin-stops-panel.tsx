"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { toast } from "@/lib/toast";
import {
  admBtnDelete,
  admBtnEdit,
  admFormActionsButtons,
  admFormActionsSpacer,
  admFormActionsWithLabel,
  admFormCard,
  admFormRow,
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
  spCheckoutField,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

type Stop = { id: string; name: string; city: string; code: string };

const emptyForm = { name: "", city: "", code: "" };

export function AdminStopsPanel() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const confirm = useConfirm();
  useGlobalLoading(loading);

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
        toast.success("Stop updated");
      } else {
        await apiPost("/admin/stops", form);
        toast.success("Stop created");
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(id: string, name: string) {
    if (
      !(await confirm({
        title: `Delete stop "${name}"?`,
        description: "This action cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
      }))
    ) {
      return;
    }
    try {
      await apiDelete(`/admin/stops/${id}`);
      toast.success("Stop deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className={admPanel}>
      <form className={admFormCard} onSubmit={submit}>
        <h3>{editId ? "Edit stop" : "Add stop"}</h3>
        <div className={admFormRow}>
          <div className={spCheckoutField}>
            <label htmlFor="stop-name">Name</label>
            <input
              id="stop-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className={spCheckoutField}>
            <label htmlFor="stop-city">City</label>
            <input
              id="stop-city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
          </div>
          <div className={spCheckoutField}>
            <label htmlFor="stop-code">Code</label>
            <input
              id="stop-code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
              maxLength={10}
            />
          </div>
          <div className={admFormActionsWithLabel}>
            <span className={admFormActionsSpacer} aria-hidden="true">
              Actions
            </span>
            <div className={admFormActionsButtons}>
              <button type="submit" className={spFilterSearch}>
                {editId ? "Update" : "Add"}
              </button>
              {editId && (
                <button type="button" className={spBtnBack} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
        {error && <p className={spPanelError}>{error}</p>}
      </form>

      {!loading && (
        <AdminTable>
            <thead>
              <tr className={admTableHeadRow}>
                <th className={admTableHeadCell}>Code</th>
                <th className={admTableHeadCell}>Name</th>
                <th className={admTableHeadCell}>City</th>
                <th className={admTableHeadCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s) => (
                <AdminTableRow key={s.id}>
                  <td className={admTableCell}>{s.code}</td>
                  <td className={admTableCell}>{s.name}</td>
                  <td className={admTableCell}>{s.city}</td>
                  <td className={admTableCell}>
                    <div className={admRowActions}>
                      <button
                        type="button"
                        className={admBtnEdit}
                        onClick={() => {
                          setEditId(s.id);
                          setForm({ name: s.name, city: s.city, code: s.code });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={admBtnDelete}
                        onClick={() => remove(s.id, s.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </AdminTableRow>
              ))}
            </tbody>
        </AdminTable>
      )}
    </div>
  );
}
