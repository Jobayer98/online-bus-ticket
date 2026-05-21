"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { formatMoneyBdt, formatTime12h } from "@/lib/format";
import { CounterToast } from "@/components/counter/counter-toast";
import { HomeDateTimePicker } from "@/components/home-datetime-picker";
import { getTodayIso } from "@/lib/trip-date";

type Route = { id: string; slug: string; fromStop: { city: string }; toStop: { city: string } };
type Coach = { id: string; coachNumber: string };
type Schedule = {
  id: string;
  status: string;
  baseFare: number;
  departureAt: string;
  estimatedArrivalAt: string;
  route: Route;
  coach: Coach;
};

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

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
  useGlobalLoading(loading);

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
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h2 className="cp-section-title">SCHEDULES</h2>

      <form className="adm-form-card" onSubmit={createSchedule}>
        <h3>Create schedule</h3>
        <div className="adm-form-row">
          <div className="adm-form-field adm-form-field--wide">
            <label htmlFor="sch-route">Route</label>
            <select
              id="sch-route"
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
          <div className="adm-form-field">
            <label htmlFor="sch-coach">Coach</label>
            <select
              id="sch-coach"
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              required
            >
              <option value="">Select</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.coachNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-form-field adm-form-field--datetime">
            <label>Departure</label>
            <HomeDateTimePicker
              value={departureAt}
              onChange={setDepartureAt}
              minDate={getTodayIso()}
            />
          </div>
          <div className="adm-form-field adm-form-field--datetime">
            <label>Arrival</label>
            <HomeDateTimePicker
              value={arrivalAt}
              onChange={setArrivalAt}
              minDate={getTodayIso()}
            />
          </div>
          <div className="adm-form-field">
            <label htmlFor="sch-fare">Base fare (৳)</label>
            <input
              id="sch-fare"
              type="number"
              min={0}
              value={baseFareTaka}
              onChange={(e) => setBaseFareTaka(e.target.value)}
              required
            />
          </div>
          <div className="adm-form-actions adm-form-actions--with-label">
            <span className="adm-form-actions__spacer" aria-hidden="true">
              Actions
            </span>
            <div className="adm-form-actions__buttons">
              <button type="submit" className="sp-filter-search">
                Create
              </button>
            </div>
          </div>
        </div>
        {error && <p className="sp-panel-error">{error}</p>}
      </form>

      {rescheduleId && (
        <form className="adm-form-card" onSubmit={submitReschedule}>
          <h3>Reschedule</h3>
          <div className="adm-form-row">
            <div className="adm-form-field adm-form-field--datetime">
              <label>New departure</label>
              <HomeDateTimePicker
                value={rescheduleDep}
                onChange={setRescheduleDep}
                minDate={getTodayIso()}
              />
            </div>
            <div className="adm-form-field adm-form-field--datetime">
              <label>New arrival</label>
              <HomeDateTimePicker
                value={rescheduleArr}
                onChange={setRescheduleArr}
                minDate={getTodayIso()}
              />
            </div>
            <div className="adm-form-field adm-form-field--wide">
              <label htmlFor="sch-reason">Reason</label>
              <input
                id="sch-reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>
            <div className="adm-form-actions adm-form-actions--with-label">
              <span className="adm-form-actions__spacer" aria-hidden="true">
                Actions
              </span>
              <div className="adm-form-actions__buttons">
                <button type="submit" className="sp-filter-search">
                  Save
                </button>
                <button
                  type="button"
                  className="sp-btn-back"
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
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Coach</th>
                <th>Departure</th>
                <th>Fare from</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>{s.route.slug}</td>
                  <td>{s.coach.coachNumber}</td>
                  <td>{formatTime12h(s.departureAt)}</td>
                  <td>{formatMoneyBdt(s.baseFare)}</td>
                  <td>
                    <span
                      className={
                        s.status === "CANCELLED"
                          ? "cp-badge cp-badge--cancel"
                          : "cp-badge cp-badge--sell"
                      }
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.status !== "CANCELLED" && (
                      <div className="adm-row-actions">
                        <button
                          type="button"
                          className="adm-btn-edit"
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
                          className="adm-btn-delete"
                          onClick={() => cancelSchedule(s.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
