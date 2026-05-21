"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { getTodayIso } from "@/lib/trip-date";
import { HomeDatePicker } from "@/components/home-date-picker";

type Stop = { id: string; name: string; city: string; code: string };

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeSearchWidget() {
  const router = useRouter();
  const [stops, setStops] = useState<Stop[]>([]);
  const [fromStopId, setFromStopId] = useState("");
  const [toStopId, setToStopId] = useState("");
  const [date, setDate] = useState("");
  const [acOn, setAcOn] = useState(true);
  const [nonAcOn, setNonAcOn] = useState(true);
  const [error, setError] = useState("");

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fromStopId || !toStopId || !date) {
      setError("Please fill from, to, and date");
      return;
    }
    if (fromStopId === toStopId) {
      setError("From and to must differ");
      return;
    }
    if (!acOn && !nonAcOn) {
      setError("Select at least AC or Non AC");
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
    <form className="home-search-card" onSubmit={handleSearch}>
      <div className="home-search-header">
        Select Your Route &amp; Search Coach Schedule
      </div>
      <div className="home-search-body">
        <div className="home-search-row">
          <div className="home-field">
            <select
              value={fromStopId}
              onChange={(e) => setFromStopId(e.target.value)}
              required
              aria-label="From"
            >
              <option value="">FROM</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="home-field">
            <select
              value={toStopId}
              onChange={(e) => setToStopId(e.target.value)}
              required
              aria-label="To"
            >
              <option value="">TO</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="home-date-field">
            <HomeDatePicker
              value={date}
              onChange={setDate}
              minDate={getTodayIso()}
            />
          </div>
          <div className="home-bus-toggles">
            <button
              type="button"
              className={`home-bus-toggle ${acOn ? "is-active" : ""}`}
              onClick={() => setAcOn((v) => !v)}
              aria-pressed={acOn}
            >
              {acOn && <CheckIcon />}
              AC
            </button>
            <button
              type="button"
              className={`home-bus-toggle ${nonAcOn ? "is-active" : ""}`}
              onClick={() => setNonAcOn((v) => !v)}
              aria-pressed={nonAcOn}
            >
              {nonAcOn && <CheckIcon />}
              Non AC
            </button>
          </div>
        </div>
      </div>
      {error && <p className="home-search-error">{error}</p>}
      <div className="home-search-footer">
        <button type="submit" className="home-search-btn">
          <SearchIcon />
          SEARCH
        </button>
      </div>
    </form>
  );
}
