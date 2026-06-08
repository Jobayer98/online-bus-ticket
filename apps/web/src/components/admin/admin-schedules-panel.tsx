"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImportResultDto } from "@repo/shared";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { parseCsvToObjects } from "@/lib/csv-parse";
import { AdminCsvImport } from "@/components/admin/admin-csv-import";
import { useGlobalLoading } from "@/components/global-loading-provider";
import {
  formatDateDdMmYyyy,
  formatMoneyBdt,
  formatScheduleClassLine,
  formatTime12h,
} from "@/lib/format";
import { seatClassesFromTemplates } from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { HomeDateTimePicker } from "@/components/home-datetime-picker";
import { getTodayIso } from "@/lib/trip-date";
import {
  admBtnDelete,
  admBtnEdit,
  admFormActionsButtons,
  admFormActionsSpacer,
  admFormActionsWithLabel,
  admFormCard,
  admFormField,
  admFormFieldDatetime,
  admFormFieldInput,
  admFormFieldLabel,
  admFormFieldWide,
  admBadgeActive,
  admBadgeBase,
  admBadgeNeutral,
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
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

type Route = { id: string; slug: string; fromStop: { city: string }; toStop: { city: string } };
type Coach = {
  id: string;
  coachNumber: string;
  busType: "AC" | "NON_AC";
  seatLayoutId: string | null;
  seatLayout: {
    name: string;
    templates?: { seatClass: string }[];
  } | null;
};
type Schedule = {
  id: string;
  status: string;
  baseFare: number;
  departureAt: string;
  estimatedArrivalAt: string;
  route: Route;
  coach: Coach;
};

function formatCoachLabel(coach: Coach): string {
  const seatClasses = seatClassesFromTemplates(coach.seatLayout?.templates);
  const typeLine = formatScheduleClassLine(coach.busType, seatClasses);
  return `${coach.coachNumber} · ${typeLine}`;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

const SCHEDULE_CSV_TEMPLATE = `routeSlug,coachNumber,departureAt,estimatedArrivalAt,baseFareTaka
dhaka-pabna,DH-1001,2026-06-10T06:00:00+06:00,2026-06-10T11:30:00+06:00,850`;

const SCHEDULE_CSV_HEADERS = [
  "routeSlug",
  "coachNumber",
  "departureAt",
  "estimatedArrivalAt",
  "baseFareTaka",
] as const;

export function AdminSchedulesPanel() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [routeId, setRouteId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [arrivalAt, setArrivalAt] = useState("");
  const [baseFareTaka, setBaseFareTaka] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDep, setRescheduleDep] = useState("");
  const [rescheduleArr, setRescheduleArr] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  useGlobalLoading(loading || importing);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiGet<Schedule[]>("/admin/schedules"),
      apiGet<Route[]>("/admin/routes"),
      apiGet<Coach[]>("/admin/coaches"),
    ])
      .then(([s, r, c]) => {
        setSchedules(s.data);
        setRoutes(r.data);
        setCoaches(c.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function importCsv(text: string) {
    setImportErrors([]);
    setImporting(true);
    try {
      const { rows } = parseCsvToObjects(text, SCHEDULE_CSV_HEADERS);
      const payload = {
        rows: rows.map((r) => ({
          routeSlug: r.routeSlug.trim(),
          coachNumber: r.coachNumber.trim(),
          departureAt: r.departureAt.trim(),
          estimatedArrivalAt: r.estimatedArrivalAt.trim(),
          baseFareTaka: Number(r.baseFareTaka.trim()),
        })),
      };
      const res = await apiPost<ImportResultDto>(
        "/admin/schedules/import",
        payload,
      );
      const { created, errors } = res.data;
      setToast(`Imported ${created} schedule(s)`);
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

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fare = Math.round(Number(baseFareTaka) * 100);
    if (!departureAt || !arrivalAt) {
      setToast("Select departure and arrival date & time");
      return;
    }
    if (!fare || fare < 0) {
      setToast("Enter a valid base fare");
      return;
    }
    try {
      await apiPost("/admin/schedules", {
        routeId,
        coachId,
        departureAt: fromDatetimeLocal(departureAt),
        estimatedArrivalAt: fromDatetimeLocal(arrivalAt),
        baseFare: fare,
      });
      setToast("Schedule created");
      setRouteId("");
      setCoachId("");
      setDepartureAt("");
      setArrivalAt("");
      setBaseFareTaka("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function submitReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!rescheduleId) return;
    try {
      await apiPatch(`/admin/schedules/${rescheduleId}/reschedule`, {
        departureAt: fromDatetimeLocal(rescheduleDep),
        estimatedArrivalAt: fromDatetimeLocal(rescheduleArr),
        reason: rescheduleReason || undefined,
      });
      setToast("Schedule rescheduled");
      setRescheduleId(null);
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Reschedule failed");
    }
  }

  async function cancelSchedule(id: string) {
    if (!window.confirm("Cancel this schedule?")) return;
    try {
      await apiPatch(`/admin/schedules/${id}/cancel`, {});
      setToast("Schedule cancelled");
      load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  return (
    <div className={admPanel}>
      <CounterToast message={toast} onDismiss={() => setToast(null)} />

      <form className={admFormCard} onSubmit={createSchedule}>
        <h3>Create schedule</h3>
        <div className={admFormRow}>
          <div className={`${admFormField} ${admFormFieldWide}`}>
            <label htmlFor="sch-route" className={admFormFieldLabel}>Route</label>
            <select
              id="sch-route"
              className={admFormFieldInput}
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              required
            >
              <option value="">Select</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.slug} ({r.fromStop.city} → {r.toStop.city})
                </option>
              ))}
            </select>
          </div>
          <div className={admFormField}>
            <label htmlFor="sch-coach" className={admFormFieldLabel}>Coach</label>
            <select
              id="sch-coach"
              className={admFormFieldInput}
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              required
            >
              <option value="">Select</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatCoachLabel(c)}
                  {!c.seatLayoutId ? " (no layout)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className={`${admFormField} ${admFormFieldDatetime}`}>
            <label className={admFormFieldLabel}>Departure</label>
            <HomeDateTimePicker
              value={departureAt}
              onChange={setDepartureAt}
              minDate={getTodayIso()}
            />
          </div>
          <div className={`${admFormField} ${admFormFieldDatetime}`}>
            <label className={admFormFieldLabel}>Arrival</label>
            <HomeDateTimePicker
              value={arrivalAt}
              onChange={setArrivalAt}
              minDate={getTodayIso()}
            />
          </div>
          <div className={admFormField}>
            <label htmlFor="sch-fare" className={admFormFieldLabel}>Base fare (৳)</label>
            <input
              id="sch-fare"
              type="number"
              className={admFormFieldInput}
              min={0}
              value={baseFareTaka}
              onChange={(e) => setBaseFareTaka(e.target.value)}
              required
            />
          </div>
          <div className={admFormActionsWithLabel}>
            <span className={admFormActionsSpacer} aria-hidden="true">
              Actions
            </span>
            <div className={admFormActionsButtons}>
              <button type="submit" className={spFilterSearch}>
                Create
              </button>
            </div>
          </div>
        </div>
        {coachId &&
          coaches.find((c) => c.id === coachId && !c.seatLayoutId) && (
            <p className={spPanelError}>
              Selected coach has no seat layout — assign one on the Coaches tab
              before creating a schedule.
            </p>
          )}
        {error && <p className={spPanelError}>{error}</p>}
      </form>

      <AdminCsvImport
        title="Import schedules from CSV"
        templateFilename="schedules-template.csv"
        templateContent={SCHEDULE_CSV_TEMPLATE}
        previewHeaders={[...SCHEDULE_CSV_HEADERS]}
        onImport={importCsv}
        importing={importing}
        importErrors={importErrors}
      />

      {rescheduleId && (
        <form className={admFormCard} onSubmit={submitReschedule}>
          <h3>Reschedule</h3>
          <div className={admFormRow}>
            <div className={`${admFormField} ${admFormFieldDatetime}`}>
              <label className={admFormFieldLabel}>New departure</label>
              <HomeDateTimePicker
                value={rescheduleDep}
                onChange={setRescheduleDep}
                minDate={getTodayIso()}
              />
            </div>
            <div className={`${admFormField} ${admFormFieldDatetime}`}>
              <label className={admFormFieldLabel}>New arrival</label>
              <HomeDateTimePicker
                value={rescheduleArr}
                onChange={setRescheduleArr}
                minDate={getTodayIso()}
              />
            </div>
            <div className={`${admFormField} ${admFormFieldWide}`}>
              <label htmlFor="sch-reason" className={admFormFieldLabel}>Reason</label>
              <input
                id="sch-reason"
                className={admFormFieldInput}
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>
            <div className={admFormActionsWithLabel}>
              <span className={admFormActionsSpacer} aria-hidden="true">
                Actions
              </span>
              <div className={admFormActionsButtons}>
                <button type="submit" className={spFilterSearch}>
                  Save
                </button>
                <button
                  type="button"
                  className={spBtnBack}
                  onClick={() => setRescheduleId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {!loading && (
        <AdminTable minWidth="720px">
            <thead>
              <tr className={admTableHeadRow}>
                <th className={admTableHeadCell}>Route</th>
                <th className={admTableHeadCell}>Coach</th>
                <th className={admTableHeadCell}>Date</th>
                <th className={admTableHeadCell}>Departure</th>
                <th className={admTableHeadCell}>Fare from</th>
                <th className={admTableHeadCell}>Status</th>
                <th className={admTableHeadCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <AdminTableRow key={s.id}>
                  <td className={admTableCell}>{s.route.slug}</td>
                  <td className={admTableCell}>{formatCoachLabel(s.coach)}</td>
                  <td className={admTableCell}>{formatDateDdMmYyyy(s.departureAt.slice(0, 10))}</td>
                  <td className={admTableCell}>{formatTime12h(s.departureAt)}</td>
                  <td className={admTableCell}>{formatMoneyBdt(s.baseFare)}</td>
                  <td className={admTableCell}>
                    <span
                      className={
                        s.status === "CANCELLED"
                          ? `${admBadgeBase} ${admBadgeNeutral}`
                          : `${admBadgeBase} ${admBadgeActive}`
                      }
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className={admTableCell}>
                    {s.status !== "CANCELLED" && (
                      <div className={admRowActions}>
                        <button
                          type="button"
                          className={admBtnEdit}
                          onClick={() => {
                            setRescheduleId(s.id);
                            setRescheduleDep(toDatetimeLocal(s.departureAt));
                            setRescheduleArr(toDatetimeLocal(s.estimatedArrivalAt));
                            setRescheduleReason("");
                          }}
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          className={admBtnDelete}
                          onClick={() => cancelSchedule(s.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </AdminTableRow>
              ))}
            </tbody>
        </AdminTable>
      )}
    </div>
  );
}
