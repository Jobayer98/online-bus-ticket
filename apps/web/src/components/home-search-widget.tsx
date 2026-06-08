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

const selectClass =
  "m-0 h-12 w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-white bg-[length:12px_12px] bg-[position:right_0.6rem_center] bg-no-repeat px-3 pr-8 text-[0.944rem] font-semibold text-[var(--text)] focus-visible:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)] focus-visible:shadow-[0_0_0_3px_var(--primary-light)]";

const selectBg =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")]";

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
      className="overflow-visible rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_25px_rgba(0,0,0,0.1),0_8px_10px_rgba(0,0,0,0.04)]"
      onSubmit={handleSearch}
      animate={shake ? shakeKeyframes : { x: 0 }}
      transition={{ duration: 0.3 }}
      id="home-search"
    >
      <div className="border-b border-[var(--border)] px-4 py-3.5 text-center text-[0.944rem] font-medium text-[var(--text)]">
        Select your route &amp; search coach schedule
      </div>
      <div className="relative overflow-visible px-6 pt-5 pb-4 max-md:px-4 max-md:pt-4 max-md:pb-3.5">
        <div className="flex flex-wrap items-end gap-3 max-[560px]:flex-col">
          <div className="min-w-[120px] flex-[1_1_140px] max-[560px]:flex-[1_1_100%]">
            <label className="mb-1.5 block text-[0.722rem] font-semibold tracking-wide text-[var(--muted)]" htmlFor="home-from">
              From
            </label>
            <select
              id="home-from"
              className={`${selectClass} ${selectBg}`}
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
          <div className="min-w-[120px] flex-[1_1_140px] max-[560px]:flex-[1_1_100%]">
            <label className="mb-1.5 block text-[0.722rem] font-semibold tracking-wide text-[var(--muted)]" htmlFor="home-to">
              To
            </label>
            <select
              id="home-to"
              className={`${selectClass} ${selectBg}`}
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
          <div className="min-w-[120px] flex-[1_1_140px] max-[560px]:flex-[1_1_100%]">
            <span className="mb-1.5 block text-[0.722rem] font-semibold tracking-wide text-[var(--muted)]">
              Date
            </span>
            <HomeDatePicker
              value={date}
              onChange={setDate}
              minDate={getTodayIso()}
            />
          </div>
          <div className="min-w-[200px] shrink-0 grow-0">
            <span className="mb-1.5 block text-[0.722rem] font-semibold tracking-wide text-[var(--muted)]">
              Coach type
            </span>
            <div className="flex gap-2 max-[560px]:w-full">
              <button
                type="button"
                className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border px-4 text-[0.722rem] font-semibold transition-colors ${acOn ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--text-on-primary,#fff)]" : "border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]"}`}
                onClick={() => setAcOn((v) => !v)}
                aria-pressed={acOn}
              >
                {acOn && <Check size={14} aria-hidden />}
                AC
              </button>
              <button
                type="button"
                className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border px-4 text-[0.722rem] font-semibold transition-colors ${nonAcOn ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--text-on-primary,#fff)]" : "border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]"}`}
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
      {error && (
        <p className="mx-6 mb-2 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end px-6 pt-3 pb-5">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-md)] border-0 bg-[var(--primary)] px-7 text-[0.944rem] font-semibold tracking-wide text-[var(--text-on-primary,#fff)] transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] focus-visible:shadow-[0_0_0_3px_var(--primary-light)]"
        >
          <Search size={18} aria-hidden />
          Search
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>
    </m.form>
  );
}
