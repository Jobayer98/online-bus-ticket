"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { ArrowRight, Check, Search } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { getTodayIso } from "@/lib/trip-date";
import { HomeDatePicker } from "@/components/home-date-picker";
import { shakeKeyframes } from "@/components/motion/variants";

type Stop = { id: string; name: string; city: string; code: string };

export function HomeSearchWidget() {
  const router = useRouter();
  const [stops, setStops] = useState<Stop[]>([]);
  const [fromStopId, setFromStopId] = useState("");
  const [toStopId, setToStopId] = useState("");
  const [date, setDate] = useState("");
  const [acOn, setAcOn] = useState(true);
  const [nonAcOn, setNonAcOn] = useState(true);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setDate(getTodayIso());
    apiGet<Stop[]>("/schedules/stops")
      .then((r) => setStops(r.data))
      .catch(() => setStops([]));
  }, []);

  function resolveBusType(): string {
    if (acOn && !nonAcOn) return "AC";
    if (!acOn && nonAcOn) return "NON_AC";
    return "";
  }

  function showValidationError(message: string) {
    setError(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fromStopId || !toStopId || !date) {
      showValidationError("Please fill from, to, and date");
      return;
    }
    if (fromStopId === toStopId) {
      showValidationError("From and to must differ");
      return;
    }
    if (!acOn && !nonAcOn) {
      showValidationError("Select at least AC or Non AC");
      return;
    }
    const from = stops.find((s) => s.id === fromStopId);
    const to = stops.find((s) => s.id === toStopId);
    if (!from || !to) return;
    const slug = `${from.city}-${to.city}`.toLowerCase().replace(/\s+/g, "-");
    const busType = resolveBusType();
    const params = new URLSearchParams();
    if (busType) params.set("busType", busType);
    const qs = params.toString();
    router.push(`/search/${slug}/${date}${qs ? `?${qs}` : ""}`);
  }

  return (
    <m.form
      className="home-search-card"
      onSubmit={handleSearch}
      animate={shake ? shakeKeyframes : { x: 0 }}
      transition={{ duration: 0.3 }}
      id="home-search"
    >
      <div className="home-search-header">
        Select your route &amp; search coach schedule
      </div>
      <div className="home-search-body">
        <div className="home-search-row">
          <div className="home-field">
            <label className="home-field-label" htmlFor="home-from">
              From
            </label>
            <select
              id="home-from"
              value={fromStopId}
              onChange={(e) => setFromStopId(e.target.value)}
              required
            >
              <option value="">Select city</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city}
                </option>
              ))}
            </select>
          </div>
          <div className="home-field">
            <label className="home-field-label" htmlFor="home-to">
              To
            </label>
            <select
              id="home-to"
              value={toStopId}
              onChange={(e) => setToStopId(e.target.value)}
              required
            >
              <option value="">Select city</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city}
                </option>
              ))}
            </select>
          </div>
          <div className="home-date-field">
            <label className="home-field-label">Date</label>
            <HomeDatePicker
              value={date}
              onChange={setDate}
              minDate={getTodayIso()}
            />
          </div>
          <div className="home-bus-toggles-wrap">
            <span className="home-field-label">Coach type</span>
            <div className="home-bus-toggles">
              <button
                type="button"
                className={`home-bus-toggle ${acOn ? "is-active" : ""}`}
                onClick={() => setAcOn((v) => !v)}
                aria-pressed={acOn}
              >
                {acOn && <Check size={14} aria-hidden />}
                AC
              </button>
              <button
                type="button"
                className={`home-bus-toggle ${nonAcOn ? "is-active" : ""}`}
                onClick={() => setNonAcOn((v) => !v)}
                aria-pressed={nonAcOn}
              >
                {nonAcOn && <Check size={14} aria-hidden />}
                Non AC
              </button>
            </div>
          </div>
        </div>
      </div>
      {error && <p className="home-search-error" role="alert">{error}</p>}
      <div className="home-search-footer">
        <button type="submit" className="home-search-btn">
          <Search size={18} aria-hidden />
          Search
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </m.form>
  );
}
