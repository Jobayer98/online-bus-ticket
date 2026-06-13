"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImportResultDto } from "@repo/shared";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { parseCsvToObjects } from "@/lib/csv-parse";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatBusTypeLabel } from "@/lib/format";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { toast } from "@/lib/toast";
import { AdminCsvImport } from "@/components/admin/admin-csv-import";
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
  const [importing, setImporting] = useState(false);
  const confirm = useConfirm();
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
        toast.success("Coach updated");
      } else {
        await apiPost("/admin/coaches", payload);
        toast.success("Coach created");
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
      toast.success(`Imported ${created} coach(es)${skipped ? `, ${skipped} skipped` : ""}`);
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
    if (
      !(await confirm({
        title: `Delete coach "${coachNumber}"?`,
        description: "This action cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
      }))
    ) {
      return;
    }
    try {
      await apiDelete(`/admin/coaches/${id}`);
      toast.success("Coach deleted");
      if (editId === id) resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className={admPanel}>
      <form className={admFormCard} onSubmit={submit}>
        <h3>{editId ? "Edit coach" : "Add coach"}</h3>
        <div className={admFormRow}>
          <div className={spCheckoutField}>
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
          <div className={spCheckoutField}>
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
          <div className={spCheckoutField}>
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
        <AdminTable>
            <thead>
              <tr className={admTableHeadRow}>
                <th className={admTableHeadCell}>Coach #</th>
                <th className={admTableHeadCell}>Type</th>
                <th className={admTableHeadCell}>Layout</th>
                <th className={admTableHeadCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c) => (
                <AdminTableRow key={c.id}>
                  <td className={admTableCell}>{c.coachNumber}</td>
                  <td className={admTableCell}>{formatBusTypeLabel(c.busType)}</td>
                  <td className={admTableCell}>{c.seatLayout?.name ?? "—"}</td>
                  <td className={admTableCell}>
                    <div className={admRowActions}>
                      <button
                        type="button"
                        className={admBtnEdit}
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
                        className={admBtnDelete}
                        onClick={() => remove(c.id, c.coachNumber)}
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
